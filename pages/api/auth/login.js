import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'crypto'
import makeToken from '../../../lib/makeToken'
import moment from 'moment'

const prisma = new PrismaClient()

async function LoginAPI (req, res) {

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

  if (token.ip !== ip || token.agent !== userAgent || token.type !== 'login') {
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
  const ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : String(req.socket.remoteAddress)
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

  const user = await prisma.user.findUnique({
    where: { email: email }
  })

  if (!user) {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'Wrong email/password.',
      status: 'danger'
    })
  }

  if (user.locked) {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'This account has been locked due to consecutive failed login attempts. Follow the password restoration procedures to unlock.',
      status: 'danger'
    })
  }

  const passwordHash = pbkdf2Sync(password, user.passwordSalt, 100000, 512, 'sha512').toString('hex')

  if (passwordHash !== user.passwordHash) {
    const failedLogin = await prisma.failedLoginAttempt.create({
      data: {
        user: {
          connect: { email: user.email }
        },
        timestamp: moment.utc().toDate(),
        agent: userAgent,
        ip
      }
    })

    if (user.strikes < 2) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          strikes: user.strikes + 1
        }
      })

      await new Promise(resolve => setTimeout(
        resolve,
        (Math.floor(Math.random() * (278 - 99 + 1)) + 99) * user.strikes
      ))
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          locked: true
        }
      })
    }

    await prisma.$disconnect()
    return res.status(400).json({
      message: 'Wrong email/password.',
      status: 'danger'
    })
  }

  if (!user.activated) {
    await makeToken(prisma, email, 'activation', 'activate')
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'The user has not been activated. We sent you a new activation token.',
      status: 'danger'
    })
  }

  const promptPasswordChange = user.strikes > 1

  if (user.strikes > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        strikes: 0
      }
    })
  }

  const session = await prisma.session.create({
    data: {
      token: randomBytes(64).toString('hex'),
      issued: moment.utc().toDate(),
      expires: moment.utc().add(30, 'minutes').toDate(),
      ip: ip,
      agent: userAgent,
      user: {
        connect: { email: email }
      }
    }
  })

  await prisma.csrfToken.update({
    where: { id: csrf.id },
    data: { invalid: true }
  })

  await prisma.$disconnect()
  return res.status(200).json({
    message: 'Successfull login',
    status: 'success',
    payload: {
      session: session.token,
      promptPasswordChange
    }
  })
}

export default LoginAPI
