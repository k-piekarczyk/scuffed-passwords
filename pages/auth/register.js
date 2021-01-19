import Navigation from '../../components/navigation'
import { Container, Form, Button, Alert, ProgressBar } from 'react-bootstrap'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import stringEntropy from 'fast-password-entropy'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function Register ({ csrfToken }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')

  const [processing, setProcessing] = useState(false)

  const passwordStrength = useMemo(() => {
    const entr = stringEntropy(password)
    if (entr < 28) return { per: 0, va: 'danger', entr, m: 'abysmally weak' }
    else if (entr < 36) return { per: 25, va: 'danger', entr, m: 'weak' }
    else if (entr < 60) return { per: 50, va: 'warning', entr, m: 'reasonable' }
    else if (entr < 128) return { per: 75, va: 'info', entr, m: 'strong' }
    else return { per: 100, va: 'success', entr, m: 'very strong' }
  }, [password])

  async function submitRegister (event) {
    event.preventDefault()
    setProcessing(true)

    if (password !== passwordRepeat) {
      setStatus('danger')
      setMessage('Both passwords need to be the same!')
      setProcessing(false)
      return
    }

    if (passwordStrength.entr < 60) {
      setStatus('danger')
      setMessage('Your password should be at least strong!')
      setProcessing(false)
      return
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email, password })
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
    if (response.status === 201) {
      toast.success('Successfully registered. Activate your account with the link we sent you.', { duration: 4000 })
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
          <h1>Register</h1>
          {message && <Alert variant={status}>{message}</Alert>}
          <Form onSubmit={submitRegister}>
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

            <Form.Group controlId='formBasicPassword'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Password'
                required
                value={password}
                onChange={event => setPassword(event.target.value)}
                disabled={processing}
              />
              <ProgressBar striped variant={passwordStrength.va} now={passwordStrength.per}/>
              <Form.Text className='text-muted'>
                Password entropy: {passwordStrength.entr}, this password is {passwordStrength.m}
              </Form.Text>
            </Form.Group>

            <Form.Group controlId='formBasicPasswordRepeat'>
              <Form.Label>Repeat password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Repeat password'
                required
                value={passwordRepeat}
                onChange={event => setPasswordRepeat(event.target.value)}
                disabled={processing}
              />
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
      type: 'register',
      agent: userAgent,
      ip
    }
  })

  await prisma.$disconnect()
  return {
    props: { csrfToken }
  }
}

export default Register
