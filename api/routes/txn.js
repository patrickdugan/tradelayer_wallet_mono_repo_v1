const express = require('express')
const txnRouter = express.Router()
const request = require('request')

// const {Txn} = require('../models/index.js') 

txnRouter.post('/', (req,res)=>{
    const {rawTxn} = req.body
    req.omniClient.cmd('sendrawtransaction', rawTxn, (err, data)=>{
        //if(err) res.status(500).send('error')
        
        res.send(data)
    })
})
/**
     * Checks if any utxos remain for a given array of transactions (ids are all that are technically needed); spent txns are cached in the db to prevent redudant lookups
     * callback / recursion chain is: from many transactions, check each transactions, for all of it's utxos, and if it turns out all the utxos were spent, mark it as such
     */

txnRouter.post('/utxos', (req, res)=>{
    const {txnData, address} = req.body
    
    getUTXOsForManyTxns(txnData, req.omniClient, (utxos)=>{
        res.send(
            utxos.filter((utxo)=> utxo.scriptPubKey.addresses.includes(address))
        )
    })
    

})

// --> commented out models
// txnRouter.get('/', (req,res)=>{
//     Txn.findAll({raw:true}).then((data)=>{
//         res.send(data)

//     })
    
// })

txnRouter.get('/getinfo/', (req,res)=>{
    req.omniClient.cmd('tl_getinfo', (err, data)=>{
        //if(err) res.status(500).send('error')
        
        res.json(data)
    })
})


txnRouter.get('/getblocktx/:block', (req,res)=>{
    let {block} = req.params
    block = +block
    req.omniClient.cmd('tl_getalltxonblock', block, (err, data)=>{
        if(err) res.status(500).json('error')
        
        res.json(data)
    })
})

txnRouter.get('/gettx/:txid', (req,res)=>{
    const {txid} = req.params
    req.omniClient.cmd('tl_gettransaction', txid, (err, data)=>{
        if(err) res.status(500).send('error')
        
        res.json(data)
    })
})

txnRouter.get('/buildRawTx', async (req,res) => {
    // const { fromAddress, toAddress, payload} = req.query
    // const { omniClient, tlClient } = req;
    // const validateAddress = await new Promise ((res,rej) => {
    //     omniClient.cmd("validateaddress", toAddress, (err, result) => {
    //         if (err) {
    //             rej(err)
    //             return;
    //         }
    //         res(result)
    //     });
    // });
    // if(!validateAddress.isvalid) {
    //     res.send({message: 'Invalid "Send to" Address'})
    //     return;
    // }
    // omniClient.cmd("listunspent", 1, 9999999, [fromAddress], false, {minimumAmount:0.0002}, async (err, result) => {
    //     if (err) {
    //         console.log(err)
    //         return;
    //     }
    //     if (result.length < 1) {
    //         res.send({message:'Not Enaught Litecoins For this transaction or you dont have access to this address'})
    //         return
    //     }
    //     const buildRawOptions = {
    //         unspent: result[0],
    //         payload: payload,
    //         refAddress: toAddress,
    //     }
    //     const finalTX = await tlClient.tl.buildRawFromUnspent(buildRawOptions)
    //     res.send({message: finalTX})
    // })
})

txnRouter.get('/buildRawSimpleSendTx', async (request, response) => {
    const { fromAddress, toAddress, quantity, propertyId} = request.query
    const { omniClient, tlClient } = request;
    const validateAddress = await new Promise ((res,rej) => {
        omniClient.cmd("validateaddress", toAddress, (err, result) => {
            if (err) return rej(err);
            return res(result)
        });
    });
    if (!validateAddress.isvalid) {
        response.send({message: 'Invalid "Send to" Address'})
        return;
    }
    omniClient.cmd("listunspent", 1, 9999999, [fromAddress], false, {minimumAmount:0.0002}, async (err, result) => {
        if (err) return console.log(err);
        if (result.length < 1) {
            response.send({ message:'Not Enaught Litecoins For this transaction or you dont have access to this address' });
            return;
        }
        const payload = await new Promise ((res,rej) => {
            tlClient.tl.createpayload_simpleSend(propertyId, quantity, (err, data) => {
                if (err) return rej(err);
                return res(data);
            })
        })
        tlClient.tl.buildRawAsync(result, payload, toAddress, (finalTX) => {
            response.send({ message: finalTX })
        })
    })
})
// --> commented out models
// const getUTXOsForManyTxns = async (txnDataArray, omniClient, next)=>{
//     let allUTXOs = []
//     const dbTxnsArray = await Txn.findAll({
//                 where: {
//                 txid: txnDataArray.map((txObj)=>txObj.txid),
//                 allSpent: true
//             }})
//     const dbTxnsMapping = {}
//     dbTxnsArray.forEach((txn)=>{dbTxnsMapping[txn.dataValues.txid] = true})
            
//     const txnsToQuery = txnDataArray.filter((txn)=> !dbTxnsMapping[txn.txid])
//     if (txnsToQuery.length === 0){
//         return next([])
//     }
    
//     const getUTXOsForManyTxnsRecur = (index = 0)=>{
//         if(index >= txnsToQuery.length){
//             return next(allUTXOs)
//         }
//         const {txid, outsCount} = txnsToQuery[index]
//         getAllUTXOs(txid, outsCount, omniClient, (utxoData)=>{
//             allUTXOs = [...allUTXOs, ...utxoData]
//             getUTXOsForManyTxnsRecur(index + 1 )
//         })

//     }
//     getUTXOsForManyTxnsRecur()
// }

/**
*/

// --> commented out models
// const getAllUTXOs = async (txid, vOutCount, omniClient, next, options={})=>{
//     const allUTXOs = []

//     // check if txn is already flagged as spent only if option is given)
//     if (options.checkDB){
//        const res = await Txn.findOne({
//            where:{
//                txid, allSpend:true
//            }
//        })
//        if(res){
//            next([])
//        } 
//     }


//     const getAllUTXOsRecur = async  (txid, vOutIndex) =>{
//         if(vOutIndex < 0){

//             if(allUTXOs.length === 0){
//                 return Txn.markAsSpent(txid, ()=>{
//                     next(allUTXOs)
//                 })
//             }

//             return next(allUTXOs)
//         }
//         getUTXO(txid, vOutIndex, omniClient, (data)=>{
//             if(data){
//                 allUTXOs.push(data)
//             }
//             getAllUTXOsRecur(txid, vOutIndex- 1)
//         })
//     }
//     getAllUTXOsRecur(txid, vOutCount)
// }

/** 
* get one utxo; queries node 
* @param txid {string}
* @param vOutN {number}: target index of UTXO
* @param omniClient {litecoin.Client object}
* @param next {callback func}
returns via cb chain: utxo data or null
*/
const getUTXO = (txid, vOutN, omniClient, next)=>{
    omniClient.cmd('gettxout', txid, vOutN, (err, data)=>{

        next( data ? Object.assign(data, {txid, outputIndex:vOutN}): data )
    })
}


module.exports =  txnRouter 
