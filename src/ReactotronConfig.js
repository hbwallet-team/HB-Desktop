import Reactotron from 'reactotron-react-js'
import { reactotronRedux } from 'reactotron-redux'

const reactotron = Reactotron
  .configure({
    name: 'HB Wallet for Desktop',
    host: 'localhost'
  })
  .use(reactotronRedux()) //  <- here i am!
  .connect()

export default reactotron
