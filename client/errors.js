import bugsnag from 'bugsnag-js'
import store from './store'
import env from 'env/NODE_ENV'
import key from 'env/BUGSNAG_CLIENT_KEY'

bugsnag.apiKey = key
bugsnag.releaseStage = env
bugsnag.notifyReleaseStages = ['production']
bugsnag.beforeNotify = (payload, meta) => {
  const {currentUser} = store.getState()
  const {email, id} = currentUser || {}
  meta.user = {email, id}
}
