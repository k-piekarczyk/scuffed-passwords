import Navigation from '../../components/navigation'

import { Button, Container, Form, InputGroup, ListGroup, Modal } from 'react-bootstrap'
import { FaEye, FaEyeSlash, FaPlus } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import forge from 'node-forge'
import { toast } from 'react-hot-toast'

function PasswordList () {
  const router = useRouter()

  const [isAuth, setIsAuth] = useState(false)
  const [passwords, setPasswords] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState({})
  const [step, setStep] = useState(1)
  const [masterPassword, setMasterPassword] = useState('')
  const [obscurePassword, setObscurePassword] = useState(true)
  const [decipheredPassword, setDecipheredPassword] = useState('')

  const handleClose = () => {
    setShowModal(false)
    setCurrentPassword({})
    setMasterPassword('')
    setDecipheredPassword('')
    setStep(1)
  }

  useEffect(async () => {
    const sessionToken = window.localStorage.getItem('session')

    if (!sessionToken) {
      router.push('/')
    }
    setIsAuth(true)

    const response = await fetch('/api/passwords', {
      method: 'GET',
      headers: {
        Authorization: sessionToken
      }
    })

    if (response.status === 401) {
      router.push('/')
      window.localStorage.removeItem('session')
      return
    }

    setPasswords(await response.json())
  }, [])

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

  function decipherPasswordStep1 (id) {
    return async function decipherPasswordStep1Inner () {
      const sessionToken = window.localStorage.getItem('session')

      const response = await fetch(`/api/passwords/${id}`, {
        method: 'GET',
        headers: {
          Authorization: sessionToken
        }
      })

      if (response.status === 401) {
        router.push('/')
        window.localStorage.removeItem('session')
        return
      }

      const body = await response.json()

      setCurrentPassword(body)
      setShowModal(true)
    }
  }

  async function decipherPasswordStep2 () {
    if (!masterPassword) return
    setStep(2)

    try {
      const encrypted = forge.util.createBuffer(forge.util.hexToBytes(currentPassword.encrypted))
      const salt = forge.util.hexToBytes(currentPassword.salt)
      const iv = forge.util.hexToBytes(currentPassword.iv)

      const key = forge.pkcs5.pbkdf2(masterPassword, salt, 10000, 32)
      const decipher = forge.cipher.createDecipher('AES-CBC', key)
      decipher.start({ iv: iv })
      decipher.update(encrypted)
      decipher.finish()
      setDecipheredPassword(JSON.parse(decipher.output.toString()).payload)
    } catch (e) {
      toast.error('Bad master password!')
      handleClose()
    }
  }

  return (
    <>
      <Navigation/>
      <Container className='mt-3'>
        <h1> Your passwords </h1>
        <Container>
          <Button
            className='mb-2'
            onClick={() => router.push('/passwords/new')}
          >
            <FaPlus/> Add new password
          </Button>
          <ListGroup>
            {passwords.map((password, idx) => (
              <ListGroup.Item key={idx} className='d-flex justify-content-between align-items-cente'>
                {password.name}
                <Button
                  variant='outline-secondary'
                  onClick={decipherPasswordStep1(password.id)}
                >
                  Retrieve
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Container>
      </Container>

      <Modal
        show={showModal}
        onHide={handleClose}
        backdrop='static'
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Password deciphering</Modal.Title>
        </Modal.Header>
        {step === 1 && (
          <Modal.Body>
            Provide master password for: {currentPassword.name}
            <InputGroup className='mt-3'>
              <Form.Control
                type={obscurePassword ? 'password' : 'text'}
                placeholder='Master password'
                required
                value={masterPassword}
                onChange={event => setMasterPassword(event.target.value)}
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
          </Modal.Body>
        )}
        {step === 2 && (
          <Modal.Body>
            {currentPassword.name}:
            <p className='bg-dark p-2 rounded'>
              <code>{decipheredPassword || '...'}</code>
            </p>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Close
          </Button>
          {step === 1 && (
            <Button variant='primary' onClick={decipherPasswordStep2} disabled={!masterPassword}>
              Decipher
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default PasswordList
