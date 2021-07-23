const app = require('express');
const omniClient = require('../ltc_client');

const identityRegistrarsRouter = app.Router();

identityRegistrarsRouter.get('/', (req, res) => {

    omniClient.cmd('tl_listkyc', (err, kycData) => {

        if(kycData) {
            res.json({
                data: kycData
            })
        }else {
            res.json({
                data: null
            })
        }
    })
})

module.exports = identityRegistrarsRouter;
