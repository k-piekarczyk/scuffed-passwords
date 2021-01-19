import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'crypto'
import makeToken from '../../../lib/makeToken'

const prisma = new PrismaClient()

async function RegisterAPI (req, res) {
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

  if (token.ip !== ip || token.agent !== userAgent || token.type !== 'register') {
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

    await makeToken(prisma, email, 'activation', 'activate')

    await prisma.csrfToken.update({
      where: { id: csrf.id },
      data: { invalid: true }
    })

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
