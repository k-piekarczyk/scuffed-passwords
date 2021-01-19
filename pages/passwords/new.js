import Navigation from '../../components/navigation'
import { Container, Form, Button, Alert, InputGroup, ProgressBar } from 'react-bootstrap'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import forge from 'node-forge'
import { toast } from 'react-hot-toast'
import stringEntropy from 'fast-password-entropy'

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

  const passwordStrength = useMemo(() => {
    const entr = stringEntropy(password)
    if (entr < 28) return { per: 0, va: 'danger', entr, m: 'abysmally weak' }
    else if (entr < 36) return { per: 25, va: 'danger', entr, m: 'weak' }
    else if (entr < 60) return { per: 50, va: 'warning', entr, m: 'reasonable' }
    else if (entr < 128) return { per: 75, va: 'info', entr, m: 'strong' }
    else return { per: 100, va: 'success', entr, m: 'very strong' }
  }, [password])

  const masterPasswordStrength = useMemo(() => {
    const entr = stringEntropy(masterPassword)
    if (entr < 28) return { per: 0, va: 'danger', entr, m: 'abysmally weak' }
    else if (entr < 36) return { per: 25, va: 'danger', entr, m: 'weak' }
    else if (entr < 60) return { per: 50, va: 'warning', entr, m: 'reasonable' }
    else if (entr < 128) return { per: 75, va: 'info', entr, m: 'strong' }
    else return { per: 100, va: 'success', entr, m: 'very strong' }
  }, [masterPassword])

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

    if (masterPasswordStrength.entr < 60) {
      setStatus('danger')
      setMessage('Your master password should be at least strong!')
      setProcessing(false)
      return
    }

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
              <ProgressBar striped variant={passwordStrength.va} now={passwordStrength.per} />
              <Form.Text className='text-muted'>
                Password entropy: {passwordStrength.entr}, this password is {passwordStrength.m}
              </Form.Text>
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
              <ProgressBar striped variant={masterPasswordStrength.va} now={masterPasswordStrength.per} />
              <Form.Text className='text-muted'>
                Password entropy: {masterPasswordStrength.entr}, this password is {masterPasswordStrength.m}
              </Form.Text>
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
