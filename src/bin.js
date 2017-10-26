#!/usr/bin/env node
'use strict'

import discover from './discover'

discover(10000).then(found => console.log(found))
