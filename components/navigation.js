import Link from 'next/link'
import { Nav, Navbar } from 'react-bootstrap'

function Navigation () {
  return (
    <Navbar bg='light' expand='lg'>
      <Link href='/' passHref>
        <Navbar.Brand><code>Scuffed Passwords</code></Navbar.Brand>
      </Link>

      <Navbar.Toggle aria-controls='navigation-bar'/>
      <Navbar.Collapse id='navigation-bar'>
        <Nav className='mr-auto'>
          <Link href='/passwords' passHref>
            <Nav.Link>Passwords</Nav.Link>
          </Link>
        </Nav>
        <Nav className='ml-auto'>
          <Link href='/login' passHref>
            <Nav.Link>Log In</Nav.Link>
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation
