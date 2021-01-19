import { PrismaClient } from '@prisma/client'
import moment from 'moment'

const prisma = new PrismaClient()

async function PasswordsAPI (req, res) {
  const user = await checkSession(req, res)
  if (!user) return
  switch (req.method) {
    case 'GET':
      await getHandler(req, res, user)
      break
    case 'POST':
      await postHandler(req, res, user)
      break
    default:
      return res.status(405).end()
  }
}

async function checkSession (req, res) {
  const sessionToken = req.headers.authorization
  const ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : String(req.socket.remoteAddress)
  const userAgent = req.headers['user-agent']

  if (!userAgent) {
    await prisma.$disconnect()
    res.status(400).end()
    return false
  }

  if (!sessionToken) {
    await prisma.$disconnect()
    res.status(401).end()
    return false
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken }
  })

  if (!session || session.revoked || moment().isAfter(moment(session.expires))) {
    await prisma.$disconnect()
    res.status(401).end()
    return false
  }

  if (session.ip !== ip || session.agent !== userAgent) {
    await prisma.session.update({
      where: { id: session.id },
      data: { revoked: true }
    })
    await prisma.$disconnect()
    res.status(401).end()
    return false
  }

  return await prisma.user.findUnique({
    where: { id: session.userId }
  })
}

async function getHandler (req, res, user) {
  const passwords = await prisma.password.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true
    },
    orderBy: [
      { id: 'desc' }
    ]
  })

  return res.status(200).json(passwords)
}

async function postHandler (req, res, user) {
  const { name, encrypted, salt, iv } = req.body
  if (
    (!name || typeof name !== 'string') ||
    (!encrypted || typeof encrypted !== 'string') ||
    (!salt || typeof salt !== 'string') ||
    (!iv || typeof iv !== 'string')
  ) {
    await prisma.$disconnect()
    return res.status(400).json({
      message: 'Name, salt, iv and encrypted need to be present and be strings.',
      status: 'danger'
    })
  }

  try {
    await prisma.password.create({
      data: {
        name,
        encrypted,
        salt,
        iv,
        user: {
          connect: { id: user.id }
        }
      }
    })

    await prisma.$disconnect()
    return res.status(201).json({
      message: 'New password added to your account.',
      status: 'success'
    })
  } catch (error) {
    await prisma.$disconnect()
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'You already have a password with that name.',
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

export default PasswordsAPI
