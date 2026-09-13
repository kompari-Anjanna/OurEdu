import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDI2l7P7LGNqv_qiz1UfetGkcMfmxWlJxA',
  authDomain: 'ouredu-7f3e7.firebaseapp.com',
  projectId: 'ouredu-7f3e7',
  storageBucket: 'ouredu-7f3e7.firebasestorage.app',
  messagingSenderId: '575321524864',
  appId: '1:575321524864:web:e828f4ce9b47e39dc93465',
  measurementId: 'G-EGGMCL1N51'
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
