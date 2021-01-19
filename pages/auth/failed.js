import Navigation from '../../components/navigation'

import { Container, ListGroup } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import moment from 'moment'

function FailedLoginsList () {
  const router = useRouter()

  const [isAuth, setIsAuth] = useState(false)
  const [failedLogins, setFailedLogins] = useState([])

  useEffect(async () => {
    const sessionToken = window.localStorage.getItem('session')

    if (!sessionToken) {
      router.push('/')
    }
    setIsAuth(true)

    // eslint-disable-next-line no-undef
    const response = await fetch('/api/auth/failed', {
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

    setFailedLogins(await response.json())
  }, [])

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
      <Container className='mt-3'>
        <h1> Failed login attempts </h1>
        <Container>
          <ListGroup>
            {failedLogins.map((fl, idx) => (
              <ListGroup.Item key={idx}>
                <p><strong>When:</strong> {moment(fl.timestamp).format()}</p>
                <p><strong>Agent:</strong> {fl.agent}</p>
                <p><strong>IP:</strong> {fl.ip}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Container>
      </Container>
    </>
  )
}

export default FailedLoginsList
