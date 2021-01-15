import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'crypto'

const prisma = new PrismaClient()

async function RegisterAPI (req, res) {
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

    return res.status(201).json({
      message: `User with email '${email}' created.`,
      status: 'success'
    })
  } catch (error) {
    if (error.code === 'P2002' && error.meta.target.includes('email')) {
      return res.status(400).json({
        message: 'An account with that email already exists.',
        status: 'failure'
      })
    } else {
      return res.status(400).json({
        message: 'There was a problem with your request.',
        status: 'failure'
      })
    }
  }
}

export default RegisterAPI
