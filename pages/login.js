import Navigation from '../components/navigation'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

function Login () {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submitLogin (event) {
    event.preventDefault()

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const body = await response.json()
    setStatus(body.status)
    setMessage(body.message)
    if (response.status === 200) {
      window.localStorage.setItem('session', body.payload)
      toast.success('You will be redirected to the home page in 2s.')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  }

  return (
    <>
      <Navigation />
      <Container className='mt-5 d-flex justify-content-center'>
        <div>
          <h1>Log In</h1>
          {message && <Alert variant={status}>{message}</Alert>}
          <Form onSubmit={submitLogin}>
            <Form.Group controlId='formEmail'>
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
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
              />
            </Form.Group>

            <Button variant='primary' type='submit'>
              Submit
            </Button>
          </Form>
        </div>
      </Container>
    </>
  )
}

export default Login
