import Link from 'next/link'
import { Nav, Navbar } from 'react-bootstrap'

function Navigation ({ loggedIn }) {

  const leftLinks = (
    <Nav className='mr-auto'>
      <Link href='/passwords' passHref>
        <Nav.Link>Passwords</Nav.Link>
      </Link>
    </Nav>
  )

  const unAuthRightLinks = (
    <Nav className='ml-auto'>
      <Link href='/login' passHref>
        <Nav.Link>Log In</Nav.Link>
      </Link>
      <Link href='/register' passHref>
        <Nav.Link>Register</Nav.Link>
      </Link>
    </Nav>
  )

  const authRightLinks = (
    <Nav className='ml-auto'>
      <Link href='/logout' passHref>
        <Nav.Link>Log Out</Nav.Link>
      </Link>
    </Nav>
  )

  return (
    <Navbar bg='light' expand='lg'>
      <Link href='/' passHref>
        <Navbar.Brand><code>Scuffed Passwords</code></Navbar.Brand>
      </Link>

      <Navbar.Toggle aria-controls='navigation-bar' />
      <Navbar.Collapse id='navigation-bar'>
        {loggedIn && leftLinks}
        {!loggedIn ? unAuthRightLinks : authRightLinks}
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation
