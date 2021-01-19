import Navigation from '../../../components/navigation'
import { Container, Alert } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function Activate ({ csrfToken }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')

  useEffect(async () => {
    const token = window.location.href.split('/').pop()
    const response = await fetch('/api/auth/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ tokenValue: token })
    })

    let body
    try {
      body = await response.json()
    } catch (err) {
      window.localStorage.removeItem('session')
      toast.error('Session integrity lost!')
      router.push('/')
      return
    }

    setStatus(body.status)
    setMessage(body.message)
    if (response.status === 200) {
      toast.success('Successfully activated the account. You can log in now.', { duration: 4000 })
    } else {
      toast.error('The token was invalid.')
    }
    router.push('/')
  }, [])

  return (
    <>
      <Navigation/>
      <Container className='mt-5 d-flex justify-content-center'>
        <div>
          <h1>Activation...</h1>
          {message && <Alert variant={status}>{message}</Alert>}
        </div>
      </Container>
    </>
  )
}

export async function getServerSideProps (ctx) {
  const userAgent = ctx.req.headers['user-agent']
  const ip = ctx.req.headers['x-real-ip'] ? ctx.req.headers['x-real-ip'] : String(ctx.req.socket.remoteAddress)

  const csrfToken = randomBytes(32).toString('hex')

  await prisma.csrfToken.create({
    data: {
      value: csrfToken,
      type: 'activate',
      agent: userAgent,
      ip
    }
  })

  await prisma.$disconnect()
  return {
    props: { csrfToken }
  }
}

export default Activate
