import { PrismaClient } from '@prisma/client'

import moment from 'moment'

const prisma = new PrismaClient()

async function ActivateAPI (req, res) {
  switch (req.method) {
    case 'POST':
      // eslint-disable-next-line no-case-declarations
      const csrf = await csrfSafe(req, res)
      if (!csrf) return
      await handler(req, res, csrf)
      break
    default:
      return res.status(405).end()
  }
}

async function csrfSafe (req, res) {
  const userAgent = req.headers['user-agent']
  const ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : String(req.socket.remoteAddress)
  const csrfToken = req.headers['x-csrf-token']

  if (!csrfToken) {
    await prisma.$disconnect()
    res.status(400).end()
    return false
  }

  const token = await prisma.csrfToken.findUnique({
    where: { value: csrfToken }
  })

  if (!token || token.invalid) {
    await prisma.$disconnect()
    res.status(400).end()
    return false
  }

  if (token.ip !== ip || token.agent !== userAgent || token.type !== 'activate') {
    await prisma.csrfToken.update({
      where: { id: token.id },
      data: { invalid: true }
    })
    await prisma.$disconnect()
    res.status(400).end()
    return false
  }

  return token
}

async function handler (req, res, csrf) {
  const userAgent = req.headers['user-agent']

  if (!userAgent) {
    await prisma.$disconnect()
    return res.status(400).end()
  }

  const { tokenValue } = req.body

  if (!tokenValue || typeof tokenValue !== 'string') {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'This route expects a tokenValue that is a string',
      status: 'danger'
    })
  }

  const token = await prisma.token.findUnique({
    where: {
      value: tokenValue
    }
  })

  if (!token || token.invalid || token.type !== 'activation' || moment().isAfter(moment(token.expires))) {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'Invalid activation token.',
      status: 'danger'
    })
  }

  try {
    await prisma.user.update({
      where: { id: token.userId },
      data: { activated: true }
    })

    await prisma.token.update({
      where: { id: token.id },
      data: { invalid: true }
    })
  } catch (error) {
    await prisma.$disconnect()
    return res.status(500).json({
      message: 'Congrats, you broke it :c',
      status: 'danger'
    })
  }

  await prisma.csrfToken.update({
    where: { id: csrf.id },
    data: { invalid: true }
  })

  await prisma.$disconnect()
  return res.status(200).json({
    message: 'User activated.',
    status: 'success'
  })
}

export default ActivateAPI
