import { PrismaClient } from '@prisma/client'

import moment from 'moment'
import makeToken from '../../../../lib/makeToken'

const prisma = new PrismaClient()

async function RequestPasswordResetAPI (req, res) {
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

  await prisma.$disconnect()
  return res.status(200).json({
    message: 'Request submitted.',
    status: 'success'
  })
}

export default RequestPasswordResetAPI
