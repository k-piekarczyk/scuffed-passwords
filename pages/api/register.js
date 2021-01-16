import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'crypto'
import makeToken from '../../lib/makeToken'

const prisma = new PrismaClient()

async function RegisterAPI (req, res) {
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
      message: 'Stop being nasty, I can tell you\'re trying something weird.',
      status: 'danger'
    })
  }

  const { email, password } = req.body

  if ((!email || typeof email !== 'string') || (!password || typeof password !== 'string')) {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'Both email and password are required, and need to be strings.',
      status: 'danger'
    })
  }

  const salt = randomBytes(8).toString('hex')
  const passwordHash = pbkdf2Sync(password, salt, 100000, 512, 'sha512').toString('hex')

  try {
    await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        passwordSalt: salt
      }
    })

    await makeToken(prisma, email)

    await prisma.$disconnect()
    return res.status(201).json({
      message: `User with email '${email}' created. Activation token has been sent.`,
      status: 'success'
    })
  } catch (error) {
    console.error(error)
    await prisma.$disconnect()
    if (error.code === 'P2002' && error.meta.target.includes('email')) {
      return res.status(400).json({
        message: 'An account with that email already exists.',
        status: 'danger'
      })
    } else {
      return res.status(400).json({
        message: 'There was a problem with your request.',
        status: 'danger'
      })
    }
  }
}

export default RegisterAPI
