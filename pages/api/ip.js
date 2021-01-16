async function ip (req, res) {
  console.log('#####################')
  console.log(req.headers['user-agent'])
  console.log(req.headers['x-forwarded-for'])
  console.log(req.socket.localAddress)
  console.log(req.socket.remoteAddress)
  res.status(200).end()
}

export default ip
