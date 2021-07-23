const express = require('express');
const addressRouter = express.Router();
const omniClient = require('../ltc_client');


addressRouter.post('/addr', (req, res) => {

    const { addr } = req.body;

   const searchBalanceArr = [];

    omniClient.cmd('tl_getallbalancesforaddress', addr, (err, addressData) => {
        console.log('addressData: ', addressData);
        
        if(addressData && addressData.length > 0) {
            console.log('addressData: ', addressData);
            console.log('addressDataLength: ', addressData.length);

            omniClient.cmd('tl_check_kyc', addr, (err, kycResultData) => {

                if(kycResultData) {
		

                    console.log('kycResultData: ', kycResultData);

                    var kycResult = {
                        propertyid: "",
                        balance: kycResultData["result: "],
                        reserve: "",
                    }


                    addressData.push(kycResult);

                    setTimeout(() => {return null}, 600);

                    console.log('addressData: ', addressData);

                  addressData.map((addressDataProp, index) => {

                        // searchBalanceArr.push(addressDataProp);

                        const propertyId = addressDataProp.propertyid;

                        omniClient.cmd('tl_getunvested', addr, (err, unvestedData) => {

                            omniClient.cmd('tl_getproperty', propertyId, (err, propertyData) => {

                                if(propertyData) {
    
                                    var creationTxId = propertyData.creationtxid;
    
                                    omniClient.cmd('tl_gettransaction', creationTxId, (err, transaction) => {


                                        if(transaction) {
                                        
                                            let balance = {
                                                divisible: transaction.divisible,
                                                frozen: "",
                                                id: propertyId.toString(),
                                                pendingneg: "",
                                                pendingpos: "",
                                                propertyinfo: {
                                                    ...transaction,
                                                    category: propertyData.category,
                                                    creationtxid: propertyData.creationtxid,
                                                    ecosystem: "",
                                                    fixedissuance: propertyData.fixedissuance,
                                                    flags: {},
                                                    freezingenabled: "",
                                                    issuer: propertyData.issuer,
                                                    managedissuance: "",
                                                    name: propertyData.name,
                                                    rdata: "",
                                                    registered: "",
                                                    subcategory: propertyData.subcategory,
                                                    totaltokens: propertyData.totaltokens,
                                                    url: propertyData.url,
                                                    checkkyc: kycResultData['result: '],
                                                    unvested: parseInt(unvestedData.unvested) !== 0 ? unvestedData.unvested: "",
                                                },
                                                reserved: addressDataProp.reserve,
                                                symbol: `LC${propertyId}`,
                                                value: addressDataProp.balance
                                            }
                                            console.log('balance: ', balance);
    
                                            searchBalanceArr.push(balance);
                                        }else {
                                            
                                            let balance = {};
    
                                            searchBalanceArr.push(balance);
                                        }
                                    })
                                }
                            })
                        })
                    })
                }else {

                    console.log('kycResultErrorData: ', err);
                }
            })

           setTimeout(() => {
            res.json({
                balance: searchBalanceArr
            })
           }, 600);
        }
       /* res.json({
            isData: false,
        })*/
    })
})



addressRouter.get('/addr/:address', (req, res) => {

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

                                    let balanceObjRes = {
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
                }else {

                    let balanceObjRes = {[address]: {}};

                    res.json(balanceObjRes);
                }
            })
        }
    })
})

module.exports = addressRouter;
