/**
 * Demo to sweep camera from side to side endlessly.
 */

const NC450 = require('./src/nc450')

const cam = new NC450({
  baseUrl: 'http://192.168.1.220',
  username: 'admin',
  password: 'humcam.'
})

const dirs = ['e', 'w']
const moveInterval = 30000

let counter = 0

function moveCamera() {
  counter = (counter > 20) ? 0 : counter + 1

  cam.login()
    .then(() => {
      const activeDir = (counter < 10) ? 1 : 0

      cam.turn(dirs[activeDir], 1500)
        .then(() => {})
        .catch(() => {})
    })
    .catch(() => {})
}

// Move the camera
moveCamera()

// Keep moving the camera at regular intervals
setInterval(moveCamera, moveInterval)