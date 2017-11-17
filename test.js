const NC450 = require('./src/nc450')

const cam = new NC450({
    baseUrl: 'http://192.168.1.220',
    username: 'admin',
    password: 'humcam.',
})

cam.login()
    .then(() => {
        console.log('Logged in')
        cam.turn('n', 10000)
            .then(() => {
                console.log('Turned')
            })
            .catch()
    })
    .catch(err => console.log(err))