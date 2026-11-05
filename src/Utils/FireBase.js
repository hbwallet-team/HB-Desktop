import * as firebase from 'firebase'

const config = {
  apiKey: 'AIzaSyD3A2zSnC7F0VQnJQF7NO4k4ZmNyjxgWRc',
  authDomain: 'hbwallet-47232.firebaseapp.com',
  databaseURL: 'https://hbwallet-47232.firebaseio.com/',
  projectId: 'hbwallet-47232'
}
firebase.initializeApp(config)

export default firebase
