import Navigation from '../components/navigation'

import { Container, ListGroup } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import moment from 'moment'

function SessionList () {
  const router = useRouter()

  const [isAuth, setIsAuth] = useState(false)
  const [sessions, setSessions] = useState([])

  useEffect(async () => {
    const sessionToken = window.localStorage.getItem('session')

    if (!sessionToken) {
      router.push('/')
    }
    setIsAuth(true)

    // eslint-disable-next-line no-undef
    const response = await fetch('/api/sessions', {
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

    setSessions(await response.json())
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
        <h1> Your passwords </h1>
        <Container>
          <ListGroup>
            {sessions.map((session, idx) => (
              <ListGroup.Item key={idx}>
                <p><strong>Agent:</strong> {session.agent}</p>
                <p><strong>IP:</strong> {session.ip}</p>
                <p><strong>Issued:</strong> {moment(session.issued).format()} <strong className='ml-5'>Expires:</strong> {moment(session.expires).format()}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Container>
      </Container>
    </>
  )
}

export default SessionList
