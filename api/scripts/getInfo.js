const { redisClient } = require('../redis_client');

const getInfo = (getInfoParams) => {
    const { omniClient } = getInfoParams;
    const getInfoRedisKey = 'getInfo';
    const blocksInfoRedisKey = 'blocksInfo';
    const blockTxnRedisKey = 'blockTxnRedisKey';

    redisClient.on('error', (err) => {
        console.log('Error', err);
    })

    redisClient.del(blockTxnRedisKey);

    // first check if blockchainInfo and blocksInfo exist on redis
    redisClient.get(getInfoRedisKey, (err, getInfo) => {

        redisClient.get(blocksInfoRedisKey, (err, blocksInfo) => {

            if(getInfo && blocksInfo) {
                console.log('tl_getInfo', JSON.parse(getInfo))
                console.log('getBlocksInfo', JSON.parse(blocksInfo))
                return {
                    source: 'cache',
                    data: {
                        getInfo: JSON.parse(getInfo),
                        blocksInfo: JSON.parse(blocksInfo)
                    }
                }
            }
    
            omniClient.cmd('tl_getinfo', (err, response) => {
    
                if(response) {
                    redisClient.setex(getInfoRedisKey, 36000, JSON.stringify(response));
                    redisClient.setex(blocksInfoRedisKey, 36000, JSON.stringify([]));
                    console.log('getInfo', JSON.parse(getInfo))
                    console.log('blocksInfo', JSON.parse(blocksInfo))
                    return {
                        source: 'cache',
                        data: {
                            getInfo: JSON.parse(getInfo),
                            blocksInfo: JSON.parse(blocksInfo)
                        }
                    }
                }
            })
        })
    })
}

module.exports = {
    getInfo
}
