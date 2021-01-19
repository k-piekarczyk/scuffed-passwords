import { PrismaClient } from '@prisma/client'

import makeToken from '../../../../lib/makeToken'

const prisma = new PrismaClient()

async function RequestPasswordResetAPI (req, res) {
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

  if (token.ip !== ip || token.agent !== userAgent || token.type !== 'password-reset-request') {
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

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'This route expects an email that is a string',
      status: 'danger'
    })
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (user) {
    await makeToken(prisma, user.email, 'reset-password', 'reset')
  } else {
    await new Promise(resolve => setTimeout(
      resolve,
      Math.floor(Math.random() * (278 - 99 + 1)) + 99
    ))
  }

  await prisma.csrfToken.update({
    where: { id: csrf.id },
    data: { invalid: true }
  })

  await prisma.$disconnect()
  return res.status(200).json({
    message: 'Request submitted.',
    status: 'success'
  })
}

export default RequestPasswordResetAPI
