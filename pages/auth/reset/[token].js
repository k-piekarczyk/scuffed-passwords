import Navigation from '../../../components/navigation'
import { Container, Alert, Form, Button, ProgressBar } from 'react-bootstrap'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import stringEntropy from 'fast-password-entropy'

import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function PasswordReset ({ csrfToken }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')

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

  async function handleReset (event) {
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

    const token = window.location.href.split('/').pop()
    const response = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ tokenValue: token, password})
    })

    const body = await response.json()
    setStatus(body.status)
    setMessage(body.message)
    if (response.status === 200) {
      toast.success('Successfully changed the password.', { duration: 4000 })
    } else {
      toast.error('The token was invalid.')
    }

    router.push('/')
  }

  return (
    <>
      <Navigation/>
      <Container className='mt-5 d-flex justify-content-center'>
        <div>
          <h1>Change password</h1>
          {message && <Alert variant={status}>{message}</Alert>}
          <Form onSubmit={handleReset}>
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
      type: 'password-reset',
      agent: userAgent,
      ip
    }
  })

  await prisma.$disconnect()
  return {
    props: { csrfToken }
  }
}

export default PasswordReset
