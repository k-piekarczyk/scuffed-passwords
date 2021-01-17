import Navigation from '../components/navigation'

import { Jumbotron, Container } from 'react-bootstrap'

import { FaGithub, FaHeart } from 'react-icons/fa'

function Home () {
  return (
    <>
      <Navigation />
      <Container className='mt-3'>
        <Jumbotron variant='dark'>
          <h1>Welcome to <code>Scuffed Passswords</code></h1>
          <p>
            A simple yet somewhat secure password storage.
          </p>
        </Jumbotron>
        <Container>
          <h4>Disclaimer</h4>
          <p className='text-justify'>
            Do NOT actually use it! I am in no way, shape or form an expert on security,
            (at the time of writing this), and although it is an attempt to display at least some understanding of
            application
            security, you shoud treat it for what it is: a student project.
          </p>

          <p className='text-monospace text-md-center mt-5'>
            Made with <FaHeart /> by <a href='https://github.com/k-piekarczyk'>k-piekarczyk <FaGithub /></a>
          </p>
        </Container>
      </Container>
    </>
  )
}

export default Home
