'use strict'

const axios = require('axios')
const qs = require('qs')
const axiosCookieJarSupport = require('axios-cookiejar-support')
const toughCookie = require('tough-cookie')

axiosCookieJarSupport(axios)

const ENDPOINTS = {
  LOGIN: 'login.fcgi',
  GET_SYSTEM_INFORMATION: 'getsysinfo.fcgi',
  GET_LED: 'ledsetting.fgci',
  GET_CLOUD: 'get_cloud.fcgi',
  GET_VIDEO: 'getvideosetting.fcgi',
  GET_WIFI_STATUS: 'wireless_status.fcgi',
  SCAN_WIFI: 'wireless_scan.fcgi',
  SET_WIFI: 'wireless_get.fcgi',
  GET_WIFI: 'wireless_set.fcgi',
  SET_TURN: 'setTurnDirection.fcgi',
  GET_ETHERNET: 'netconf_get.fcgi',
  SET_ETHERNET: 'netconf_set.fcgi',
  GET_PTZ: 'getPtzVelocity.fcgi',
  SET_PTZ: 'setPtzVelocity.fcgi',
  SET_TURN_DIRECTION: 'setTurnDirection.fcgi',
  REBOOT: 'reboot.fcgi'
}

const VALID_DIRECTIONS = [
  'n', 'nw', 'w', 'sw', 's', 'se', 'e', 'ne', 'c'
]

const ERRORS = {
  1011: 'Incorrect password',
  1012: 'Invalid username',
  '-1': 'Forbidden'
}

const defaultOptions = {
  baseUrl: '',
  username: 'admin',
  password: 'admin',
  token: null
}

class NC450 {
  constructor (options) {
    this.options = Object.assign(defaultOptions, options || {})

    axios.defaults.baseURL = this.options.baseUrl
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

    this.cookieJar = new toughCookie.CookieJar()
  }

  reboot () {
    return new Promise((resolve, reject) => {
      this._call(`/${ENDPOINTS.REBOOT}`)
        .then(data => {
          resolve()
        })
        .catch(err => {
          reject(new Error(ERRORS[err]))
        })
    })
  }

  login () {
    return new Promise((resolve, reject) => {
      const form = {
        Username: this.options.username,
        Password: Buffer.from(this.options.password, 'utf8').toString('base64')
      }

      this._call(`/${ENDPOINTS.LOGIN}`, form)
        .then(data => {
          this.token = data.token

          resolve()
        })
        .catch(err => {
          reject(new Error(`Login failed with error: ${err}`))
        })
    })
  }

  turn (direction, timestep = 1000, operation = 'start') {
    return new Promise((resolve, reject) => {
      if (!VALID_DIRECTIONS.includes(direction)) {
        reject(new Error(`Invalid direction (${direction}`))
      }

      this._call(`/${ENDPOINTS.SET_TURN_DIRECTION}`, {
        operation,
        direction
      })
      .then(data => {
        if (operation === 'start') {
          setTimeout(() => {
            this.turn(direction, timestep, 'stop')
              .then(() => resolve())
              .catch(err => reject(err))
          }, timestep)
        }
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  reset () {
    return this.turn('c', 1000)
  }

  _call (endpoint, data = {}) {
    return new Promise((resolve, reject) => {
      if (this.token) {
        data = Object.assign(data, {
          token: this.token
        })
      }

      axios.post(endpoint, qs.stringify(data), {
        jar: this.cookieJar,
        withCredentials: true
      })
      .then(response => {
        const data = response.data

        if (!('errorCode' in data) || data.errorCode !== 0) {
          reject(data.errorCode)
        }

        resolve(data)
      })
      .catch(err => {
        reject(err)
      })
    })
  }
}

module.exports = NC450
