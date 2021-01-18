import Navigation from '../../components/navigation'
import { Container, Form, Button, Alert, InputGroup } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import forge from 'node-forge'
import { toast } from 'react-hot-toast'

function NewPassword () {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')
  const [obscurePassword, setObscurePassword] = useState(true)
  const [obscureMasterPassword, setObscureMasterPassword] = useState(true)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [masterPassword, setMasterPassword] = useState('')

  const [processing, setProcessing] = useState(false)

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
    setProcessing(true)

    const sessionToken = window.localStorage.getItem('session')

    const salt = forge.random.getBytesSync(128)
    const key = forge.pkcs5.pbkdf2(masterPassword, salt, 10000, 32)
    const iv = forge.random.getBytesSync(16)
    const payload = forge.util.createBuffer(JSON.stringify({ payload: password }))

    const cipher = forge.cipher.createCipher('AES-CBC', key)
    cipher.start({ iv })
    cipher.update(payload)
    cipher.finish()
    const encrypted = cipher.output

    const response = await fetch('/api/passwords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: sessionToken
      },
      body: JSON.stringify({
        name,
        salt: forge.util.bytesToHex(salt),
        iv: forge.util.bytesToHex(iv),
        encrypted: encrypted.toHex()
      })
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
      toast.success('Password created successfully.')
      router.push('/passwords')
    } else {
      setProcessing(false)
    }
  }

  if (!isAuth) {
    return (
      <>
        <Navigation/>
        <Container className='mt-5'>
          <h3>Loading...</h3>
        </Container>
      </>
    )
  }

  return (
    <>
      <Navigation/>
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
                disabled={processing}
              />
            </Form.Group>

            <Form.Group controlId='formBasicPassword'>
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={obscurePassword ? 'password' : 'text'}
                  placeholder='Password'
                  required
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  disabled={processing}
                />
                <InputGroup.Append>
                  <Button
                    variant='outline-secondary'
                    onClick={() => setObscurePassword(!obscurePassword)}
                  >
                    {obscurePassword ? (<FaEyeSlash/>) : (<FaEye/>)}
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId='formBasicMasterPassword'>
              <Form.Label>Master password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={obscureMasterPassword ? 'password' : 'text'}
                  placeholder='Master password'
                  required
                  value={masterPassword}
                  onChange={event => setMasterPassword(event.target.value)}
                  disabled={processing}
                />
                <InputGroup.Append>
                  <Button
                    variant='outline-secondary'
                    onClick={() => setObscureMasterPassword(!obscureMasterPassword)}
                  >
                    {obscureMasterPassword ? (<FaEyeSlash/>) : (<FaEye/>)}
                  </Button>
                </InputGroup.Append>
              </InputGroup>
              <Form.Text className='text-muted'>
                This password is never stored, if you loose it, your data is gone.
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

export default NewPassword
