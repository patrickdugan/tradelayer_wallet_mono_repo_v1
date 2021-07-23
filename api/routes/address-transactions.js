const express = require('express');
const addressTransactionsRouter = express.Router();
const { blockTransactionsModule } = require('./modules/block-transactions-module');
const { redisClient } = require('../redis_client');
const blockTxnModule = require('./modules/blockTxn-module');
const omniClient = require('../ltc_client');

addressTransactionsRouter.post('/:currentPage', (req, res) => {

    const { currentPage } = req.params;
    const { addr } = req.body;

    const blockTransactionArr = [];

    omniClient.cmd('tl_getallbalancesforaddress', addr, (err, addressData) => {

        if(addressData) {

            let addressObj = addressData[0];

           omniClient.cmd('tl_getproperty', addressObj.propertyid, (err, propertyData) => {

                if(propertyData) {

                    let propertyBlock = propertyData['creation block'];

                    omniClient.cmd('tl_listblocktransactions', parseInt(propertyBlock), (err, blockTransactions) => {

                        omniClient.cmd('getblockhash', parseInt(propertyBlock), (err, blockHash) => {
                
                            if(blockTransactions && blockHash) {
                                console.log('block transactions: ', blockTransactions);

                               blockTransactions.map((blockTxId, index) => {
                                    omniClient.cmd('tl_gettransaction', blockTxId, (err, blockTransaction) => {
                
                                        if(blockTransaction) {
                
                                            blockTransactionArr.push(blockTransaction)
                                        }
                                    })
                                })
                
                                setTimeout(() => {
                                    res.json({
                                        address: addr,
                                        current_page: currentPage,
                                        pages: currentPage,
                                        transactions: blockTransactionArr,
                                        txcount: blockTransactions.length,
                                    })
                                }, 600)
                            }
                
                        })
                    })
                }
            })
        }else {

	//res.json({data: 'nothing came out'});
}
    })
})



addressTransactionsRouter.get('/unconfirmed/:address', (req, res) => {

    const { address } = req.params;

    const blockTransactionArr = [];

    omniClient.cmd('tl_getallbalancesforaddress', address, (err, addressData) => {

        if(addressData) {

            let addressObj = addressData[0];

            omniClient.cmd('tl_getproperty', addressObj.propertyid, (err, propertyData) => {

                if(propertyData) {

                    let propertyBlock = propertyData['creation block'];

                    omniClient.cmd('tl_listblocktransactions', parseInt(propertyBlock), (err, blockTransactions) => {

                        omniClient.cmd('getblockhash', parseInt(propertyBlock), (err, blockHash) => {
                
                            if(blockTransactions && blockHash) {
                                blockTransactions.map((blockTxId, index) => {
                                    omniClient.cmd('tl_gettransaction', blockTxId, (err, blockTransaction) => {
                
                                        if(blockTransaction.confirmations === 0) {
                
                                            blockTransactionArr.push(blockTransaction)
                                        }
                                    })
                                })
                
                                setTimeout(() => {
                                    res.json({
                                        address,
                                        data: blockTransactionArr
                                    })
                                }, 600)
                            }
                
                        })
                    })
                }
            })
        }
    })
})

module.exports = addressTransactionsRouter;
