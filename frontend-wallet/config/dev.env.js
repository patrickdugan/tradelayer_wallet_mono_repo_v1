'use strict'
require('dotenv').config()
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

const baseUrl = process.env.DEV_BASE_URL || "http://localhost"; 
const basePort = process.env.DEV_BASE_PORT || 3002;
const socketPort = process.env.DEV_SOCKET_PORT || 75

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_URL: `"${baseUrl}:${basePort}"`,
  SOCKET_URL:`"${baseUrl}:${socketPort}"`
})
