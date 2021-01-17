import Navigation from '../../components/navigation'
import { Container, Form, Button, Alert, InputGroup } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function NewPassword () {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')
  const [obscure, setObscure] = useState(true)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    if (!window.localStorage.getItem('session')) {
      router.push('/')
    } else {
      setIsAuth(true)
    }
  }, [])

  async function submitNewPassword (event) {
    event.preventDefault()

    const sessionToken = window.localStorage.getItem('session')

    const response = await fetch('/api/passwords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: sessionToken
      },
      body: JSON.stringify({ name, encoded: password, salt: 'not implemented' })
    })

    if (response.status === 401) {
      router.push('/')
      window.localStorage.removeItem('session')
      return
    }

    const body = await response.json()
    setStatus(body.status)
    setMessage(body.message)
    if (response.status === 201) {
      setTimeout(() => {
        router.push('/passwords')
      }, 1000)
    }
  }

  if (!isAuth) {
    return (
      <>
        <Navigation />
        <Container className='mt-5'>
          <h3>Loading...</h3>
        </Container>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <Container className='mt-5 d-flex justify-content-center'>
        <div>
          <h1>New Password</h1>
          {message && <Alert variant={status}>{message}</Alert>}
          <Form onSubmit={submitNewPassword}>
            <Form.Group controlId='formName'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter password name'
                required
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Form.Group>

            <Form.Group controlId='formBasicPassword'>
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={obscure ? 'password' : 'text'}
                  placeholder='Password'
                  required
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                />
                <InputGroup.Append>
                  <Button
                    variant='outline-secondary'
                    onClick={() => setObscure(!obscure)}
                  >
                    {obscure ? (<FaEyeSlash />) : (<FaEye />)}
                  </Button>
                </InputGroup.Append>
              </InputGroup>
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

export default NewPassword
