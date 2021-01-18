import Navigation from '../../components/navigation'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

function Register () {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [processing, setProcessing] = useState(false)

  async function submitRegister (event) {
    event.preventDefault()
    setProcessing(true)

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const body = await response.json()
    setStatus(body.status)
    setMessage(body.message)
    if (response.status === 201) {
      toast.success('Successfully registered. Activate your account with the link we sent you.', {duration: 4000})
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

export default Register
