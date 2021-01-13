import { Container } from 'react-bootstrap'

import Navigation from '../components/navigation'
import { useRouter } from 'next/router'

function SlugBased () {
  const router = useRouter()
  const { slug } = router.query

  return (
    <>
      <Navigation />
      <Container className='mt-3'>
        <h1>Welcome to: {slug}</h1>
        <p>
          Here is some mumbo jumbo :)
        </p>
      </Container>
    </>
  )
}

export default SlugBased
