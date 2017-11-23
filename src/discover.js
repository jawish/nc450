'use strict'

const Bonjour = require('bonjour')
const ip = require('ip')
const axios = require('axios')

const reModel = /NC450 Admin/m
const reServer = /lighttpd/

/**
 * Use bonjour advertisements to find and list NC450 cameras on the network.
 *
 * @export
 * @param {number} [timeout=60000]  Stop discovery after given milliseconds has elapsed. Use -1 to run forever.
 * @param {func} callback           Function to call for every discovered camera.
 * @returns
 */
function discover (timeout = 60000, callback = undefined) {
  let discoveredHosts = []

  // Start bonjour discovery and return a promise.
  return new Promise((resolve, reject) => {
    // Use Bonjour service discovery to find http servers on the network.
    const bonjour = (new Bonjour()).find({ type: 'http' }, service => {
      // Check each found IPv4 address for a valid camera host
      service.addresses.filter(ip.isV4Format).forEach(address => {
        axios.get(`http://${address}/`)
          .then(response => {
            // Check if service response contains the fingerprint text and expected header value
            if (reModel.test(response.data) &&
              reServer.test(response.headers.server)) {
              if (!discoveredHosts.includes(address)) {
                discoveredHosts.push(address)
              }

              // Trigger callback with the discovered service
              if (typeof callback === 'function') {
                callback(address)
              }
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    })

    // Stop the discovery process after the set timeout has elapsed.
    if (timeout > -1) {
      setTimeout(() => {
        bonjour.stop()
        resolve(discoveredHosts)
      }, timeout)
    }
  })
}

module.exports = discover
