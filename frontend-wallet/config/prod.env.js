'use strict'
require('dotenv').config()

const baseUrl = process.env.PROD_BASE_URL || "http://localhost"; 
const basePort = process.env.PROD_BASE_PORT || 3002;
const socketPort = process.env.PROD_SOCKET_PORT || 75

module.exports = {
  NODE_ENV: '"production"',
  API_URL: `"${baseUrl}:${basePort}"`,
  SOCKET_URL:`"${baseUrl}:${socketPort}"`
}
