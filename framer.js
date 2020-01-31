'use strict' 

const fs = require('fs')
const cg = require('./config.js')
const spanSource = require('./js/markdown.js')
const format = require('./js/format.js')

const source = fs.readFileSync('card.md', 'utf8')
format(spanSource(source), cg)

