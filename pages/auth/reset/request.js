import Navigation from '../../../components/navigation'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function RequestPasswordReset ({ csrfToken }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')

  const [email, setEmail] = useState('')

  const [processing, setProcessing] = useState(false)

  async function submitRequest (event) {
    event.preventDefault()
    setProcessing(true)

    const response = await fetch('/api/auth/reset/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email })
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
      toast.success('Request submitted. If there exists an account with that email, you will receive your reset token.', { duration: 5000 })
      router.push('/')
    } else {
      setProcessing(false)
    }
  }

  return (
    <>
      <Navigation/>
      <Container className='mt-5 d-flex justify-content-center'>
        <div>
          <h1>Request password reset</h1>
          {message && <Alert variant={status}>{message}</Alert>}
          <Form onSubmit={submitRequest}>
            <Form.Group controlId='formEmail'>
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                disabled={processing}
              />
              <Form.Text className='text-muted'>
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>
            <Button variant='primary' type='submit' disabled={processing}>
              Submit
            </Button>
          </Form>
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
      type: 'password-reset-request',
      agent: userAgent,
      ip
    }
  })

  await prisma.$disconnect()
  return {
    props: { csrfToken }
  }
}

export default RequestPasswordReset
