# TP-Link NC450 camera API for Node.js

This package provides a lightweight Javascript API class for controlling a TP-Link NC450 camera.

## Installing

Install the the `npm` module:

```bash
$ npm install nc450
```

Import the module in your application:

```js
var NC450 = require('nc450');
```

## Example

```js
var NC450 = require('nc450');
var camera = new NC450({
  username: 'admin',
  password: 'password',
  host: 'nc450.local.dev'
})
camera.login()
  .then(function () {
    camera.turn('w', 3000)
  })
  
```

## NC450

The following methods are available on the NC450 class instance:

### turn
### login
### reboot
### setLed // TODO
### getLed // TODO
### scanWifi // TODO
### getWifiStatus // TODO
### setWifi // TODO
### getWifi // TODO
### setEthernet // TODO
### getEthernet // TODO
### setPtz // TODO
### getPtz // TODO

### Discovery

The module also exports a handy camera discovery function that uses Bonjour service discovery to probe available HTTP 
servers on the network and find NC450 cameras.

Usage:
```js
var discover = require('nc450').discover

discover(30000, function (host) {
  // Executed per discovered camera
})
.then(function (hostList) {
  // Executed when discover timeout occurs and returns full list of discovered cameras.
})
```

## Author
Jawish Hameed
