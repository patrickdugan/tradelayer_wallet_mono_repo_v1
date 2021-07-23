
const omniClient = require('../../ltc_client');
const asset = [];
const searchModule = {
    property: (query, res) => {

        omniClient.cmd('tl_getproperty', parseInt(query), (err, queryData) => {

            if(queryData) {
              
              return res.json({
                data: {
                  address: {},
                  asset: [
                    [
                      queryData.propertyid,
                      queryData.name,
                      queryData.issuer,
                      "null"
                    ]
                  ],
                  tx: {}
                },
                query,
                status: 200
              })
            }else {
              return res.json({
                data: {
                  address: {},
                  asset: [
                    []
                  ],
                  tx: {}
                },
                query,
                status: ""
              })
            }
        })
    },
    properties: (res) => {

        omniClient.cmd('tl_listproperties', (err, propertiesData) => {

            if(propertiesData) {

                propertiesData.map((propertyData, index) => {

                    omniClient.cmd('tl_getproperty', propertyData.propertyid, (err, getPropertyData) => {

                        if(getPropertyData) {
                            
                            asset.push({
                                propertyid: getPropertyData.propertyid,
                                name: getPropertyData.name,
                                issuer: getPropertyData.issuer,
                                registered: "null"
                            })
                        }
                    })
                })

                setTimeout(() => {

                    return res.json({
                        data: {
                          address: {},
                          asset,
                          tx: {}
                        },
                        query: '',
                        status: 200
                    })
                }, 600)
            }else {
                return res.json({
                  data: {
                    address: {},
                    asset: [
                      []
                    ],
                    tx: {}
                  },
                  query: "",
                  status: ""
                })
            }
        })
    },
    address: (query, res) => {

        const searchBalanceArr = [];

        omniClient.cmd('tl_getallbalancesforaddress', query, (err, addressData) => {
            console.log('addressData: ', addressData);
            
            if(addressData && addressData.length > 0) {
                console.log('addressData: ', addressData);
                console.log('addressDataLength: ', addressData.length);

                omniClient.cmd('tl_check_kyc', query, (err, kycResultData) => {

                    if(kycResultData) {
    
                        console.log('kycResultData: ', kycResultData);
    
                        addressData.map((addressDataProp, index) => {
    
                            const propertyId = addressDataProp.propertyid;

                            omniClient.cmd('tl_getunvested', query, (err, unvestedData) => {

                                omniClient.cmd('tl_getproperty', propertyId, (err, propertyData) => {
    
                                    if(propertyData) {
        
                                        var creationTxId = propertyData.creationtxid;
        
                                        omniClient.cmd('tl_gettransaction', creationTxId, (err, transaction) => {
        
                                            if(transaction) {
                                                
                                                var balance = {
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
                    return res.json({
                        data: {
                            address: {
                                balance: searchBalanceArr
                            },
                            asset: [],
                            tx: {}
                        },
                        query,
                        checkkyc: searchBalanceArr['checkkyc'],
                        status: 200
                    })
                }, 600)
            }else {
                return res.json({
                    data: {
                        address: {},
                        asset: [
                            []
                        ],
                        tx: {}
                    },
                    query,
                    status: ""
                })
            }
        /* res.json({
                isData: false,
            })*/
        })
    },
    tx: (query, res) => {

        omniClient.cmd('tl_gettransaction', query, (err, txData) => {

            if(txData) {
                return res.json({
                    data: {
                        address: {},
                        asset: [],
                        tx: txData
                    },
                    query,
                    status: 200
                })
            }else {
                return res.json({
                    data: {
                        address: {},
                        asset: [
                            []
                        ],
                        tx: {}
                    },
                    query,
                    status: ""
                })
            }
        })
    }
}

module.exports = searchModule;
