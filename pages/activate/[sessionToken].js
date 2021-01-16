import Navigation from '../../components/navigation'
import { Container, Alert } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

function Activate () {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('danger')

  useEffect(async () => {
    const sessionToken = window.location.href.split('/').pop()
    const response = await fetch('/api/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tokenValue: sessionToken })
    })

    const body = await response.json()
    setStatus(body.status)
    setMessage(body.message)
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }, [])

  return (
    <>
      <Navigation />
      <Container className='mt-5 d-flex justify-content-center'>
        <div>
          <h1>Activation...</h1>
          {message && <Alert variant={status}>{message}</Alert>}
        </div>
      </Container>
    </>
  )
}

export default Activate
