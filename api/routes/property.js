const express = require('express')
const propertyRouter = express.Router()
const searchModules = require('./modules/search-module');

propertyRouter.get('', (req, res) => {
  
  searchModules.properties(res);
})

propertyRouter.get('/listproperties', (req,res)=>{
    req.omniClient.cmd('tl_listproperties', (err, properties)=>{
        req.omniClient.cmd('tl_getinfo', (err, info)=>{
        console.log(err, properties);
        var obj = {'block':info.block,'blocktime':info.blocktime,'properties':properties}
        res.send(obj)
        })
    })
})

propertyRouter.get('/listNatives', (req,res)=>{
    req.omniClient.cmd('tl_list_natives', (err, contracts)=>{
        if(err){
            res.send(err.toString())
        } else {
            res.send(contracts)
        }       
    })
})

propertyRouter.get('/listOracleContracts', (req,res)=>{
    req.omniClient.cmd('tl_list_oracles', (err, contracts)=>{
        if(err){
            res.send(err.toString())
        } else {
            res.send(contracts)
        }       
    })
})

propertyRouter.get('/getproperty/:id', (req, res)=>{
    let {id} = req.params
    id = +id    
    req.omniClient.cmd('tl_getproperty', id, (err, properties)=>{

	
        newProperties = {
          ...properties,
          flags: {
            registered: true,
          },
          registered: true,
          managedissuance: false,
        }
        res.send(newProperties)
    }) 
})

propertyRouter.get('/getNativeInsuranceFund/:id', (req, res)=>{
  let {id} = req.params;
  id = +id
  const {omniClient} = req; 
  omniClient.cmd('tl_getcache', id, (err, insurance )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(insurance)
    }
  })
})

propertyRouter.get('/getOracleInsuranceFund/:id', (req, res)=>{
  let {id} = req.params;
  id = +id
  const {omniClient} = req; 
  omniClient.cmd('tl_getoraclecache', id, (err, insurance )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(insurance)
    }
  })
})

propertyRouter.get('/getKYCRegistarList', (req, res)=>{
  const {omniClient} = req; 
  omniClient.cmd('tl_listkyc', (err, data )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(data)
    }
  })
})

propertyRouter.get('/checkKYC/:address', (req, res)=>{
  let {address} = req.params;
  address = +address
  const {omniClient} = req; 
  omniClient.cmd('tl_check_kyc', address, (err, data )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(data)
    }
  })
})

propertyRouter.get('/getActivations', (req, res)=>{
  const {omniClient} = req; 
  omniClient.cmd('tl_getactivations', (err, data )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(data)
    }
  })
})
  
propertyRouter.get('/getCurrencyTotal/:id', (req, res)=>{
  let {id} = req.params;
  id = +id
  const {omniClient} = req; 
  omniClient.cmd('tl_getcurrencytotal', id, (err, data )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(data)
    }
  })
})
                
propertyRouter.get('/getALLPrice', (req, res)=>{
  const {omniClient} = req; 
  omniClient.cmd('tl_getallprice', (err, data )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(data)
    }
  })
})

propertyRouter.get('/getContractPrice/:id', (req, res)=>{
  let {id} = req.params;
  id = +id
  const {omniClient} = req; 
  omniClient.cmd('tl_getmarketprice', id, (err, data )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(data)
    }
  })
})

propertyRouter.get('/getSpotTokenVolume/:id1/:id2/:startblock/:endblock', (req, res)=>{
  let {id1, id2, startblock, endblock} = req.params;
  id1 = +id1
  id2 = +id2
  startblock = +startblock
  endblock = +endblock
  const {omniClient} = req; 
  omniClient.cmd('tl_getmdexvolume', id1, id2, startblock, endblock, (err, volume )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(volume)

    }
  })
})
  
propertyRouter.get('/getTotalLTCVolume/:id/:startblock/:endblock', (req, res)=>{
  let {id, startblock, endblock} = req.params;
  id = +id
  startblock = +startblock
  endblock = +endblock  
  const {omniClient} = req; 
  omniClient.cmd('tl_getdexvolume', id, startblock, endblock, (err, volume )=>{
    if(err){
      res.send(err.toString())
    } else {
      res.send(volume)

    }
  })
})

module.exports =  propertyRouter 
