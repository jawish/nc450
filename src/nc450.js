'use strict'

import superagent from 'superagent'

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
  host: '',
  port: 80,
  username: 'admin',
  password: 'admin',
  token: null
}

export default class NC450 {
  constructor (options) {
    this.options = Object.assign(defaultOptions, options || {})
    this.baseUrl = `http://${this.options.host}:${this.options.port}`
    this.agent = superagent.agent()
  }

  reboot () {
    this.agent
      .post(`${this.baseUrl}/${ENDPOINTS.REBOOT}`)
      .type('form')
      .send({ token: this.token })
      .end()
  }

  login (username, password) {
    return new Promise((resolve, reject) => {
      this.agent
      .post(`${this.baseUrl}/${ENDPOINTS.LOGIN}`)
      .type('form')
      .send({
        Username: username,
        Password: Buffer.from(password, 'utf8').toString('base64')
      })
      .end(response => {
        const body = JSON.parse(response.text)

        if (!('errorCode' in body) || body.errorCode !== 0) {
          reject(new Error(ERRORS[`${body.errorCode}`]))
        }

        this.token = body.token
        this.isAdmin = body.isAdmin === 1

        resolve(true)
      })
    })
  }

  turn (direction, timestep = 1000) {
    return new Promise((resolve, reject) => {
      if (!VALID_DIRECTIONS.includes(direction)) {
        reject(new Error(`Invalid direction (${direction}`))
      }

      this.agent
        .post(`${this.baseUrl}/${ENDPOINTS.SET_TURN_DIRECTION}`)
        .type('form')
        .send({
          operation: 'start',
          token: this.token,
          direction
        })
        .end(response => {
          const body = JSON.parse(response.text)

          if (!('errorCode' in body) || body.errorCode !== 0) {
            reject(new Error('Failed to start turning'))
          }

          setTimeout(() => {
            this.agent
            .post(`${this.baseUrl}/${ENDPOINTS.SET_TURN_DIRECTION}`)
            .type('form')
            .send({
              operation: 'stop',
              token: this.token,
              direction
            })
            .end(response => {
              resolve(true)
            })
          })
        })
    })
  }
}
