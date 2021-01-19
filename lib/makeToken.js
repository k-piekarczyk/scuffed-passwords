import { randomBytes } from 'crypto'
import moment from 'moment'

async function makeToken (prisma, userEmail, type, url) {
  const token = await prisma.token.create({
    data: {
      type: type,
      value: randomBytes(32).toString('hex'),
      issued: moment.utc().toDate(),
      expires: moment.utc().add(15, 'minutes').toDate(),
      user: {
        connect: { email: userEmail }
      }
    }
  })

  console.log(
    '##############################################################################################################\n' +
    '#\n' +
    '# Go to: /auth/' + url + '/' + token.value + '\n' +
    '#\n' +
    '# NOTE: The token is valid until: ' + token.expires + '\n' +
    '#\n' +
    '##############################################################################################################'
  )
}

export default makeToken
