import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import XHR from 'i18next-xhr-backend'
import LocizeBackend from 'i18next-locize-backend'
import whichBackend from './whichBackend'
import en from './en/translations'
import jp from './jp/translations'
import cn from './cn/translations'
import ru from './ru/translations'
import es from './es/translations'
import pt from './pt/translations'
import th from './th/translations'
import vn from './vn/translations'
import kr from './kr/translations'

const options = {
  fallbackLng: 'en',

  // have a common namespace used around the full app
  ns: ['translations'],
  defaultNS: 'translations',

  keySeparator: false, // we use content as keys

  interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ','
  },

  react: {
    wait: true
  }
}

switch (whichBackend()) {
case 'locize':
  options.backend = {
    projectId: '9fa57726-b7a6-4d1c-bbf6-37629309e4c5', // <-- replace with your projectId
    apiKey: 'your apiKey',
    referenceLng: 'en'
  }
  i18n.use(LocizeBackend)
  break

case 'xhr':
  options.backend = {
    loadPath: '/{{lng}}/{{ns}}.json'
  }
  i18n.use(XHR)
  break

case 'memory':
default:
  options.resources = {
    en, jp, cn, ru, es, pt, th, vn, kr
  }
}

export default () => {
  i18n
    .use(LanguageDetector)
    .init(options)
  return i18n
}
