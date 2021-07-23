const express = require('express');
const transactionRouter = express.Router();
const omniClient = require('../ltc_client');

transactionRouter.get('/tx/:tx', (req, res) => {

    const { tx } = req.params;

    omniClient.cmd('tl_gettransaction', tx, (err, transactionData) => {

        if(transactionData) {

            res.json(transactionData)
        }
        res.json({})
    })
})

module.exports = transactionRouter;
