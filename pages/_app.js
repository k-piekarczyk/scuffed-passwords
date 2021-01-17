import Head from 'next/head'
import { Toaster } from 'react-hot-toast'

import '../styles/global.css'
import 'bootstrap/dist/css/bootstrap.min.css'

function MyApp ({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Scuffed Passwords</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Component {...pageProps} />
      <Toaster
        position='top-center'
        reverseOrder={false}
      />
    </>
  )
}

export default MyApp
