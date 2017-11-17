#!/usr/bin/env node
'use strict'

const discover = require('./discover')

discover(10000).then(found => console.log(found))
