const omniClient = require('../ltc_client');
const { redisClient } = require('../redis_client');
// const { blockchainInfo } = require('../scripts/blockchainInfo');


const findNewBlocks = () => {

    const getInfoArr = [];

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
                var valueArr = [0, [0]];
                const rate_usd = 1.0;

                omniClient.cmd('tl_getinfo', (err, response) => {
    
                    if(response) {
                        console.log('response', response)
                        const { block } = response;
                        const newBlocks = block;
                        const blocksDiff = (newBlocks - oldBlocks);
                        var oldBlock = oldBlocks;
    
                        // get block hash using the loop
                        for(i = 0; i < blocksDiff; i++) {
                            oldBlock += i
    
                            omniClient.cmd('getblockhash', (oldBlock), (err, getBlockHash) => {
    
                                if(getBlockHash) {

                                    omniClient.cmd('getblock', getBlockHash, (err, blocksObj) => {
                                        
                                        if(blocksObj) {
                                            console.log('blocksObj', blocksObj)

                                            omniClient.cmd('tl_listblocktransactions', oldBlock, (err, blockTransactions) => {

                                                if(blockTransactions) {

                                                    blockTransactions.map((blockTransaction, index) => {

                                                        omniClient.cmd('tl_gettransaction', blockTransaction, (err, blockTransaction) => {

                                                            if(blockTransaction) {
                                                                var value = {
                                                                    details: {
                                                                        [blockTransaction.propertyId]: {
                                                                            flags: null,
                                                                            invalid: 0,
                                                                            name: blockTransaction.propertyname,
                                                                            rate_usd,
                                                                            tx_count: blockTransactions.length,
                                                                            value_usd_rounded: "",
                                                                            volume: "",
                                                                        }
                                                                    },
                                                                    total_usd: "",
                                                                    value_24hr: "",
                                                                }

                                                                valueArr[0] = value;
                                                                valueArr[1] += blockTransaction.amount;
                                                            }
                                                        })
                                                    })
                                                }
                                            })

                                            const blocksInfoObj = {
                                                block: blocksObj.height,
                                                block_hash: blocksObj.hash,
                                                timestamp: blocksObj.time,
                                                omni_tx_count: blocksObj.tx.length,
                                                value: {
                                                    ...valueArr[0],
                                                    'details.value_usd_rounded': Math.ceil((valueArr[1] * rate_usd)),
                                                    'details.volume': valueArr[1],
                                                    total_usd: Math.ceil((valueArr[1] * rate_usd)),
                                                }
                                            }

                                            setTimeout(() => {
                                                redisClient.setex(blocksInfoRedisKey, 3600, JSON.stringify(blocksInfoArr.concat(blocksInfoObj)));
                                            }, 600)
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