const omniClient = require('../ltc_client');
const { redisClient } = require('../redis_client');
// const { blockchainInfo } = require('../scripts/blockchainInfo');


const findNewBlocks = () => {

    const getInfoArr = [];
    var valueArr = [{}, 0, ''];
   // var propertyId = '';
    const rate_usd = 1.0;

    // first check if getInfo exist on redis
    const getInfoRedisKey = 'getInfo';
    const blocksInfoRedisKey = 'blocksInfo';
    redisClient.get(getInfoRedisKey, (err, getInfo) => {

        redisClient.get(blocksInfoRedisKey, (err, blocksInfo) => {

            if(getInfo && blocksInfo) {
                const blocksInfoArr = JSON.parse(blocksInfo);
                console.log(getInfo)
                const { block } = JSON.parse(getInfo);
                const oldBlocks = block;

                omniClient.cmd('tl_getinfo', (err, response) => {
    
                    if(response) {
                        console.log('response', response)
                        const { block } = response;
                        const newBlocks = block;
                        const blocksDiff = (newBlocks - oldBlocks);
    
                        // get block hash using the loop
                        for(i = 0; i < blocksDiff; i++) {
                            console.log('blocksDiff: ', blocksDiff)
                            console.log('i: ', i)
                            var hashBlock = (oldBlocks + i);
                            console.log('hashBlock: ', hashBlock)
    
                            omniClient.cmd('tl_listblocktransactions', hashBlock, (err, blockTransactions) => {

                                console.log('oldBlocks: ', hashBlock)
                                console.log('blockTransactions: ', blockTransactions)
                                if((blockTransactions) && (blockTransactions !== undefined) && (blockTransactions.length >= 1)) {

                                    console.log('block transaction length: ', blockTransactions.length)


                                    omniClient.cmd('getblockhash', hashBlock, (err, getBlockHash) => {
    
                                        if(getBlockHash) {
        
                                            omniClient.cmd('getblock', getBlockHash, (err, blocksObj) => {
        
                                                if(blocksObj) {
                                                    console.log('blocksObj', blocksObj)
                                                    console.log('heights: ', blocksObj.height)
        
                                                    
                                                    blockTransactions.map((blockTransaction, index) => {
                                                        console.log('blockTransaction: ', blockTransaction)
                                                    
                                                        omniClient.cmd('tl_gettransaction', blockTransaction, (err, transaction) => {
                                                            console.log('transaction: ', transaction)
                                                            if(transaction) {
                                                    
                                                                console.log('transaction: ', transaction)
                                                    
                                                             var propertyData = transaction.propertyid !== ''? omniClient.cmd('tl_getproperty', transaction.propertyid, (err, propertyData) => propertyData) : false;
                                                    
                                                                console.log('property data: ', propertyData);
                                                    
                                                                var value = {
                                                                    details: {
                                                                        [transaction.propertyid !== ''? transaction.propertyid: ""]: {
                                                                            flags: null,
                                                                            invalid: 0,
                                                                            name: transaction.propertyname !== ''? transaction.propertyname : "",
                                                                            rate_usd,
                                                                            tx_count: blockTransactions.length,
                                                                            value_usd_rounded: "",
                                                                            volume: "",
                                                                        }
                                                                    },
                                                                    total_usd: "",
                                                                    value_24hr: propertyData !== undefined ? propertyData['last 24h Token volume'] : "",
                                                                }
                                                                valueArr[0] = value;
                                                                valueArr[1] += parseFloat(transaction.amount !== undefined ? transaction.amount: 0);
                                                                valueArr[2] = transaction.propertyid !== ''? transaction.propertyid: "";
                                                    
                                                                setTimeout(() => {
                                                                  console.log('value arr: ', valueArr)  
                                                                }, 800)
                                                    
                                                            }else{
                                                                console.log('no transaction: ', err)
                                                            }
                                                        })
                                                    })
                                                    
                                                    setTimeout(() => {
                                                    
                                                        console.log('value array: ', {...valueArr[0]});
                                                        console.log('property id: ', valueArr[2]);
                                                        const blocksInfoObj = {
                                                            block: blocksObj.height,
                                                            block_hash: blocksObj.hash,
                                                            timestamp: blocksObj.time,
                                                            omni_tx_count: valueArr[2] !== ''? valueArr[0]['details'][valueArr[2]].tx_count : '',
                                                            value: {
                                                                ...valueArr[0],
                                                                details: valueArr[2] !== ''?  {
                                                                    [valueArr[2]]: {
                                                                        ...valueArr[0]['details'][valueArr[2]],
                                                                        value_usd_rounded: Math.ceil((valueArr[1] * parseFloat(rate_usd))),
                                                                        volume: valueArr[1],
                                                                        total_usd: Math.ceil((valueArr[1] * parseFloat(rate_usd))),
                                                                    }
                                                                }: '',
                                                                //total_usd: Math.ceil(valueArr[1] * valueArr[0]['details'][valueArr[2]]['rate_usd'])
                                                            }
                                                        }
                                                        //blocksInfoArr.concat(blocksInfoObj);
                                                        redisClient.setex(blocksInfoRedisKey, 1060000, JSON.stringify(blocksInfoArr.concat(blocksInfoObj).sort((a, b) => { return a.block - b.block}).filter((blocksInfoFilObj, index, self) => index === self.findIndex(t => t.block === blocksInfoFilObj.block))));
                                                    }, 800)

                                                }
                                            })
                                        }
                                    })
                                    
                                }
                            })
                        }
                    }
                })
                console.log('blocksInfoArr', blocksInfoArr);
            }
        })
    })
}

module.exports = {
    findNewBlocks,
}
