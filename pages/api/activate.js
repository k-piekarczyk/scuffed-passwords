import { PrismaClient } from '@prisma/client'

import moment from 'moment'

const prisma = new PrismaClient()

async function ActivateAPI (req, res) {
  switch (req.method) {
    case 'POST':
      await handler(req, res)
      break
    default:
      return res.status(405).end()
  }
}

async function handler (req, res) {
  const userAgent = req.headers['user-agent']

  if (!userAgent) {
    await prisma.$disconnect()
    return res.status(400).json({
      message: "Stop being nasty, I can tell you're trying something weird.",
      status: 'danger'
    })
  }

  const { tokenValue } = req.body

  if (!tokenValue || typeof tokenValue !== 'string') {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'This route expects a tokenValue that is a string',
      status: 'danger'
    })
  }

  const token = await prisma.activationToken.findUnique({
    where: { value: tokenValue }
  })

  if (!token || token.invalid || moment().isAfter(moment(token.expires))) {
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

    await prisma.activationToken.update({
      where: { id: token.id },
      data: { invalid: true }
    })

  } catch (error) {
    console.log(error)
    await prisma.$disconnect()
    return res.status(500).json({
      message: 'Congrats, you broke it :c',
      status: 'danger'
    })
  }

  await prisma.$disconnect()
  return res.status(200).json({
    message: 'User activated.',
    status: 'success'
  })
}

export default ActivateAPI
