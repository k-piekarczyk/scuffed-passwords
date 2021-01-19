import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'crypto'

import moment from 'moment'

const prisma = new PrismaClient()

async function ResetPasswordAPI (req, res) {
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

  const { tokenValue, password } = req.body

  if ((!tokenValue || typeof tokenValue !== 'string') || (!password || typeof password !== 'string')) {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'This route expects a tokenValue and a password that is a string',
      status: 'danger'
    })
  }

  const token = await prisma.token.findUnique({
    where: {
      value: tokenValue
    }
  })

  if (!token || token.invalid || token.type !== 'reset-password' || moment().isAfter(moment(token.expires))) {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'Invalid activation token.',
      status: 'danger'
    })
  }

  try {
    const salt = randomBytes(8).toString('hex')
    const passwordHash = pbkdf2Sync(password, salt, 100000, 512, 'sha512').toString('hex')

    await prisma.user.update({
      where: { id: token.userId },
      data: {
        passwordHash,
        passwordSalt: salt,
        strikes: 0,
        locked: false
      }
    })

    await prisma.token.update({
      where: { id: token.id },
      data: { invalid: true }
    })
  } catch (error) {
    console.error(error)
    await prisma.$disconnect()
    return res.status(500).json({
      message: 'Congrats, you broke it :c',
      status: 'danger'
    })
  }

  await prisma.$disconnect()
  return res.status(200).json({
    message: 'Password changed.',
    status: 'success'
  })
}

export default ResetPasswordAPI
