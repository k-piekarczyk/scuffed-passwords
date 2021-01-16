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
    return res.status(400).json({
      message: "Stop being nasty, I can tell you're trying something weird.",
      status: 'failure'
    })
  }

  const { tokenValue } = req.body

  if (!tokenValue || typeof tokenValue !== 'string') {
    return res.status(400).json({
      message: 'This route expects a tokenValue that is a string',
      status: 'failure'
    })
  }

  const token = await prisma.activationToken.findUnique({
    where: { value: tokenValue }
  })

  if (!token || token.invalid || moment().isAfter(moment(token.expires))) {
    return res.status(400).json({
      message: 'Invalid activation token.',
      status: 'failure'
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
    return res.status(500).json({
      message: 'Congrats, you broke it :c',
      status: 'failure'
    })
  }

  return res.status(200).json({
    message: 'User activated.',
    status: 'success'
  })
}

export default ActivateAPI
