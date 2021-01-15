import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync } from 'crypto'

const prisma = new PrismaClient()

async function LoginAPI (req, res) {
  switch (req.method) {
    case 'POST':
      await postHandler(req, res)
      break
    default:
      return res.status(405).end()
  }
}

async function postHandler (req, res) {
  const { email, password } = req.body

  if ((!email || typeof email !== 'string') || (!password || typeof password !== 'string')) {
    return res.status(400).json({
      message: 'Both email and password are required, and need to be strings.',
      status: 'failure'
    })
  }

  let user = null
  try {
    user = await prisma.user.findUnique({
      where: { email: email }
    })
  } catch (error) {
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

  return res.status(200).json({
    message: 'Successfull login',
    status: 'success',
    payload: 'the token goes here :)'
  })
}

export default LoginAPI
