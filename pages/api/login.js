import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'crypto'
import makeToken from '../../lib/makeToken'
import moment from 'moment'

const prisma = new PrismaClient()

async function LoginAPI (req, res) {
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
      message: 'Stop being nasty, I can tell you\'re trying something weird.',
      status: 'failure'
    })
  }

  const { email, password } = req.body

  if ((!email || typeof email !== 'string') || (!password || typeof password !== 'string')) {
    return res.status(400).json({
      message: 'Both email and password are required, and need to be strings.',
      status: 'failure'
    })
  }

  const user = await prisma.user.findUnique({
    where: { email: email }
  })

  if (!user) {
    return res.status(400).json({
      message: 'Wrong email/password.',
      status: 'failure'
    })
  }

  const passwordHash = pbkdf2Sync(password, user.passwordSalt, 100000, 512, 'sha512').toString('hex')

  if (passwordHash !== user.passwordHash) {
    return res.status(400).json({
      message: 'Wrong email/password.',
      status: 'failure'
    })
  }

  if (!user.activated) {
    await makeToken(prisma, email)

    return res.status(400).json({
      message: 'The user has not been activated. We sent you a new activation token.',
      status: 'failure'
    })
  }

  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : String(req.socket.remoteAddress)

  const session = await prisma.session.create({
    data: {
      token: randomBytes(64).toString('hex'),
      issued: moment.utc().toDate(),
      expires: moment.utc().add(15, 'minutes').toDate(),
      ip: ip,
      agent: userAgent,
      user: {
        connect: { email: email }
      }
    }
  })

  return res.status(200).json({
    message: 'Successfull login',
    status: 'success',
    payload: session.token
  })
}

export default LoginAPI
