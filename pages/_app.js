import Head from 'next/head'

import 'bootstrap/dist/css/bootstrap.min.css'

function MyApp ({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Scuffed Passwords</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Component {...pageProps} />
    </>
  )
}

export default MyApp
