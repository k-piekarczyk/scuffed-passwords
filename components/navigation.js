import Link from 'next/link'
import { Nav, Navbar } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

function Navigation () {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  function handleLogout (event) {
    event.preventDefault()
    window.localStorage.removeItem('session')
    router.push('/')
  }

  useEffect(() => {
    const session = window.localStorage.getItem('session')
    if (!session) setLoggedIn(false)
    else setLoggedIn(true)
  })

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
      <Nav.Link onClick={handleLogout}>Log Out</Nav.Link>
    </Nav>
  )

  return (
    <Navbar bg='light' expand='lg'>
      <Link href='/' passHref>
        <Navbar.Brand><code>Scuffed Passwords</code></Navbar.Brand>
      </Link>

      <Navbar.Toggle aria-controls='navigation-bar'/>
      <Navbar.Collapse id='navigation-bar'>
        {loggedIn && leftLinks}
        {!loggedIn ? unAuthRightLinks : authRightLinks}
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation
