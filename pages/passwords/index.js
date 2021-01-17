import Navigation from '../../components/navigation'

import { Button, Container, ListGroup } from 'react-bootstrap'
import { FaEye, FaEyeSlash, FaPlus } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function PasswordList () {
  const router = useRouter()

  const [isAuth, setIsAuth] = useState(false)
  const [passwords, setPasswords] = useState([])

  useEffect(async () => {
    if (!window.localStorage.getItem('session')) {
      router.push('/')
    }
    setIsAuth(true)

    const sessionToken = window.localStorage.getItem('session')

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
                  onClick={() => console.log(password.stored)}
                >
                  Retrieve
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Container>
      </Container>
    </>
  )
}

export default PasswordList
