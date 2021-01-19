import Navigation from '../../../components/navigation'
import { Container, Alert, Form, Button } from 'react-bootstrap'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

function Activate () {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')

  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')

  const [processing, setProcessing] = useState(false)

  async function handleReset (event) {
    event.preventDefault()
    setProcessing(true)

    if (password !== passwordRepeat) {
      setStatus('danger')
      setMessage('Both passwords need to be the same!')
      setProcessing(false)
      return
    }

    const token = window.location.href.split('/').pop()
    const response = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

export default Activate
