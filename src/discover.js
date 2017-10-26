'use strict'

import Bonjour from 'bonjour'
import ip from 'ip'
import superagent from 'superagent'

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
export default function discover (timeout = 60000, callback = undefined) {
  let discoveredHosts = []

  // Start bonjour discovery and return a promise.
  return new Promise(resolve => {
    // Use Bonjour service discovery to find http servers on the network.
    const bonjour = (new Bonjour()).find({ type: 'http' }, service => {
      // Check each found IPv4 address for a valid camera host
      service.addresses.filter(ip.isV4Format).forEach(address => {
        superagent
          .get(`http://${address}/`)
          .end((err, response) => {
            if (!err && response.ok) {
              // Check if service response contains the fingerprint text and expected header value
              if (reModel.test(response.text) &&
                reServer.test(response.headers.server)) {
                if (!discoveredHosts.includes(address)) {
                  discoveredHosts.push(address)
                }

                // Trigger callback with the discovered service
                if (typeof callback === 'function') {
                  callback(address)
                }
              }
            }
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
