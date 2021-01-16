import { randomBytes } from 'crypto'
import moment from 'moment'

async function makeToken (prisma, userEmail) {
  const token = await prisma.activationToken.create({
    data: {
      value: randomBytes(32).toString('hex'),
      issued: moment.utc().toDate(),
      expires: moment.utc().add(10, 'minutes').toDate(),
      user: {
        connect: { email: userEmail }
      }
    }
  })

  console.log(
    '##############################################################################################################\n' +
    '#\n' +
    '# Go to: /activate/' + token.value + '\n' +
    '#\n' +
    '# NOTE: The token is valid until: ' + token.expires + '\n' +
    '#\n' +
    '##############################################################################################################'
  )
}

export default makeToken
