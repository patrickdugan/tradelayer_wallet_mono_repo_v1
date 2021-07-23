const {balanceRouter, balanceApi} = require('./balance');
const propertyRouter = require('./property');
const orderbookRouter= require('./orderbook');
const txnRouter = require('./txn');
const positionRouter = require('./position');
const blocklistRouter = require('./blocklists');
const searchRouter = require('./search');
const addressRouter = require('./address');
const blockTransactionsRouter = require('./block-transactions');
const addressTransactionsRouter = require('./address-transactions');
const transactionRouter = require('./transactions');
const identityRegistrarsRouter = require('./identity-registrars');
const {dcurrencyApi, dcurrencyRouter} = require('./dcurrency')
const orderbookApi =require('./orderbook')
const priceApi = require('./price')
const tradeApi = require('./trade')
const userApi = require('./user')
const express = require('express');
const apiRoutes = express();
const systemRouter = require('./system')
const configureRoutes = app => {
  // app.use gives the prefix to all routes; all routes should probably use this syntax eventually
  app.use('/api/balances', balanceRouter)
  app.use('/api/properties', propertyRouter)
  app.use('/api/orderbooks', orderbookRouter)
  app.use('/api/txn', txnRouter)
  app.use('/api/positions', positionRouter)
  app.use('/api/dcurrency', dcurrencyApi)
  app.use('/api/blocklist', blocklistRouter);
  app.use('/api/block-transactions', blockTransactionsRouter);
  app.use('/api/address-transactions', addressTransactionsRouter);
  app.use('/api/transaction', transactionRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/address', addressRouter);
  app.use('/api/system', systemRouter);
  app.use('/api/identity-registrars', identityRegistrarsRouter);
  // balanceApi(app)
  dcurrencyApi(app)
  priceApi(app)
  tradeApi(app)
  userApi(app)
}

// // app.use gives the prefix to all routes; all routes should probably use this syntax eventually
// apiRoutes.use('/balances', balanceRouter)
// apiRoutes.use('/properties', propertyRouter)
// apiRoutes.use('/orderbooks', orderbookRouter)
// apiRoutes.use('/txn', txnRouter)
// apiRoutes.use('/positions', positionRouter)

module.exports = configureRoutes
