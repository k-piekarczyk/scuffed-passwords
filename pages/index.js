import Link from 'next/link'

function Home () {
    return (
        <>
            <h1>Home Page</h1>
            <Link href='/about'>About</Link>
            <img src="/static/home.png" />
        </>
    )
}

export default Home