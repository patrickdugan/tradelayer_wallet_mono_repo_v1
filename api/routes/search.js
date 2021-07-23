const express = require('express');
const searchRouter = express.Router();
const searchModules = require('./modules/search-module');
const omniClient = require('../ltc_client');


searchRouter.post('/', (req, res) => {

    const { query } = req.body;

    const queryArr = query.split('');

console.log('queryArr: ', queryArr);

    if((queryArr) && (queryArr.length > 15) && (queryArr.length < 40)) {

console.log('queryArr: ', queryArr);
        
        searchModules.address(query, res);
    
    }else if((queryArr) && (queryArr.length > 40)) {

        searchModules.tx(query, res)

    }else if((queryArr) && (queryArr.length < 15)) {

        searchModules.property(query, res);
    }
})

searchRouter.get('/:address', (req, res) => {
    const { address } = req.params;
    var balanceObj = {};

    omniClient.cmd('tl_getallbalancesforaddress', address, (err, balance) => {
        
        if(balance) {
            balanceObj = balance[0];

            omniClient.cmd('getreceivedbyaddress', address, (err, received) => {

                if(received) {

                    omniClient.cmd('tl_getproperty', balanceObj.propertyid, (err, property) => {

                        if(property) {

                            omniClient.cmd('tl_listblocktransactions', parseInt(property['creation block']), (err, transactions) => {

                                if(transactions) {

                                    var balanceObjRes = {
                                        [address]: {
                                            final_balance: balanceObj.balance,
                                            n_tx: transactions.length,
                                            total_received: received
                                        }
                                    }

                                    res.json(balanceObjRes);
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

module.exports = searchRouter;
