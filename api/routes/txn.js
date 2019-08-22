const express = require('express')
const txnRouter = express.Router()
const request = require('request')

const {Txn} = require('../models/index.js') 

txnRouter.post('/', (req,res)=>{
    const {rawTxn} = req.body
    req.omniClient.cmd('sendrawtransaction', rawTxn, (err, data)=>{
        if(err) res.status(500).send('error')
        
        res.send(data)
    })
})

txnRouter.post('/utxos', (req, res)=>{
    const {txnData, address} = req.body
    
    getUTXOsForManyTxns(txnData, req.omniClient, (utxos)=>{
        res.send(
            utxos.filter((utxo)=> utxo.scriptPubKey.addresses.includes(address))
        )
    })
    

})

txnRouter.get('/', (req,res)=>{
    Txn.findAll({raw:true}).then((data)=>{
        res.send(data)

    })
    
})
const getUTXOsForManyTxns = async (txnDataArray, omniClient, next)=>{
    let allUTXOs = []
    const dbTxnsArray = await Txn.findAll({
                where: {
                txid: txnDataArray.map((txObj)=>txObj.txid),
                allSpent: true
            }})
    const dbTxnsMapping = {}
    dbTxnsArray.forEach((txn)=>{dbTxnsMapping[txn.dataValues.txid] = true})
            
    const txnsToQuery = txnDataArray.filter((txn)=> !dbTxnsMapping[txn.txid])
    if (txnsToQuery.length === 0){
        return next([])
    }
    
    const getUTXOsForManyTxnsRecur = (index = 0)=>{
        if(index >= txnsToQuery.length){
            return next(allUTXOs)
        }
        // todo: ensure vout is right name:
        const {txid, outsCount} = txnsToQuery[index]
        getAllUTXOs(txid, outsCount, omniClient, (utxoData)=>{
            allUTXOs = [...allUTXOs, ...utxoData]
            getUTXOsForManyTxnsRecur(index + 1 )
        })

    }
    getUTXOsForManyTxnsRecur()
}

/**
*/

const getAllUTXOs = async (txid, vOutCount, omniClient, next, options={})=>{
    const allUTXOs = []

    // check if txn is already flagged as spent only if option is given)
    if (options.checkDB){
       const res = await Txn.findOne({
           where:{
               txid, allSpend:true
           }
       })
       if(res){
           next([])
       } 
    }



    const getAllUTXOsRecur = async  (txid, vOutIndex) =>{
        if(vOutIndex < 0){

            if(allUTXOs.length === 0){
                return Txn.markAsSpent(txid, ()=>{
                    next(allUTXOs)
                })
            }

            return next(allUTXOs)
        }
        getUTXO(txid, vOutIndex, omniClient, (data)=>{
            if(data){
                allUTXOs.push(data)
            }
            getAllUTXOsRecur(txid, vOutIndex- 1)
        })
    }
    getAllUTXOsRecur(txid, vOutCount)
}

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