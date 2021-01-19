import { PrismaClient } from '@prisma/client'
import moment from 'moment'

const prisma = new PrismaClient()

async function PasswordsDetailAPI (req, res) {
  const user = await checkSession(req, res)
  if (!user) return
  switch (req.method) {
    case 'GET':
      await getHandler(req, res, user)
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
  const passwords = await prisma.password.findFirst({
    where: {
      id: Number.parseInt(req.query.id),
      userId: user.id
    }
  })

  return res.status(200).json(passwords)
}

export default PasswordsDetailAPI
