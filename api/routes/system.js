const express = require('express');
const systemRouter = express.Router();
const omniClient = require('../ltc_client');

systemRouter.get('/status', (req, res) => {

    omniClient.cmd('tl_getvesting_info', (err, vestingInfo) => {

        if(vestingInfo) {


            omniClient.cmd('tl_getinfo', (err, blockInfo) => {

                if(blockInfo) {

                    
                }
            })

            res.json({
                amount_of_wallets: 88065,
                block_time: "2020-12-17 13:22:55",
                last_block: 661746,
                last_parsed: "2020-12-17 13:32:09",
                omni_btc: 0.000126095390362873,
                omni_usd: 2.850686406181808,
                properties_count: 846,
                test_properties_count: 523,
                txcount_24hr: 3284,
                txdaily: [
                    {
                        "count": 4144,
                        "date": "2020-12-16",
                        "value_24hr": 31562535
                    },
                    {
                        "count": 4260,
                        "date": "2020-12-15",
                        "value_24hr": 41349782
                    },
                ],
                vestingInfo,
            })
        }
    })
})

module.exports = systemRouter
