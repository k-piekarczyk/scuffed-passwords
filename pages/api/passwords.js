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
    default:
      return res.status(405).end()
  }
}

async function checkSession (req, res) {
  const sessionToken = req.headers.authorization
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : String(req.socket.remoteAddress)
  const userAgent = req.headers['user-agent']

  if (!userAgent) {
    await prisma.$disconnect()
    res.status(400).json({
      message: 'Stop being nasty, I can tell you\'re trying something weird.',
      status: 'danger'
    })
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
  console.log(session)
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
    where: { userId: user.id }
  })

  console.log()
  return res.status(200).json(passwords)
}

export default PasswordsAPI
