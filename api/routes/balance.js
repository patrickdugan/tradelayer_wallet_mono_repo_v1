// var { dbconnect } = require('../dbconnect')
const config = require('../config')
var path= config.TLPATH
var datadir = config.TLDATADIR
var exec = require('child_process').exec;
const express = require('express')
const balanceRouter = express.Router()
const axios = require('axios')
const tl = require('../bot/TL-RPC-API-ASYNC');

//const {Address, Balance} = require('../models/index.js') 

balanceRouter.get('/address/:address', (req, res)=>{
  let {address} = req.params;
  const {omniClient} = req; 
  omniClient.cmd('tl_getallbalancesforaddress', address, (err, balance )=>{
    if(err) {
      res.json(err)
    }
    res.json(balance)
  })
})

balanceRouter.get('/allbalancesofproperty', (req, res)=>{
  let {propertyID} = req.query;
  propertyID = parseInt(propertyID);
  const {omniClient} = req; 
  omniClient.cmd('tl_getallbalancesforid', propertyID, (err, balance )=>{
    if(err) {
      res.json(err)
    }
    res.json(balance);
  })
})

balanceRouter.get('/byid', (req, res)=>{
  let {address, propertyID} = req.query;
  propertyID = parseInt(propertyID);
  const {omniClient} = req; 
  omniClient.cmd('tl_getbalance', address, propertyID, (err, balance )=>{
    if(err) {
      res.json(err)
    }
    res.json(balance);
  })
})

balanceRouter.get('/bytx',  (req, res)=> {
  let txid = req.query;
  const {omniClient} = req; 
  omniClient.cmd('tl_gettransaction', txid, (err, balance)=>{
    if(err){
      res.json(err)
    }
    res.json(balance)
  })
})

/*balanceRouter.get('/getBalances/',  async  (req, res)=> {
  // todo: optional prop arg
  const {address, propId} = req.query;
  if (address){
    const result = await Balance.findAll({
      include: [
        {
          model: Address,
          where: {
            address
          }
        }
      ]
    });

    res.json(result);
  } else {
      req.omniClient.cmd("listreceivedbyaddress", 0, true, async function( err, addresses,resHeaders) {
        const result = await Balance.findAll({
          include: [
            {
              model: Address,
              where: {
                address: addresses.map( (obj)=> obj.address)
              }
            }
          ]
        });
        res.json(result)
      })
    }



  })
*/


balanceRouter.get('/getBalancePegged', function(req, res){
  var address = req.query.address
  var contractID = req.query.contractID

  var balanceCommand = path+"/litecoin-cli -datadir="+ datadir +" tl_getbalance "+address.toString()+" "+ contractID;
  console.log('get balance pegged command line ', balanceCommand)
  var options = { env : process.env }

  exec(balanceCommand, options, function (error, stdout2, stderr) {
      if (error === null) {
        var balance = JSON.parse(stdout2).balance
        res.json(balance);
      }
      else {
        console.log('balance not greater than 0', stderr)
        res.json(stderr)
      }
  })
})

balanceRouter.get('/getBalanceALL', function(req, res){
  var address = req.query.address.toString();
  var contractID = req.query.contractID;
  const {omniClient} = req;
  var sellObj = "";
  var buyObj = "";

  var balanceCommand = path+"/litecoin-cli -datadir="+ datadir +" tl_getbalance "+address.toString()+" "+ parseInt(contractID);
  var options = { env : process.env }

  exec(balanceCommand, options, function (error, stdout2, stderr) {
      if (error === null) {
        var balances = [];
        var balance = JSON.parse(stdout2).balance;

        if(Number(balance) > 0){
          var balanceObj = {'name' : 'ALL', 'balance' : balance };
          balances.push(balanceObj);
          console.log('balances are' + balances)
            if (balances.length > 0){
              //after getting all balance, then get Vesting token balance
              omniClient.cmd('tl_getbalance', address, 3, function whenOK(err, vesting, resHeaders){
                if(err === null){
                  console.log('this is vesting balance ', vesting.balance)
                  balances.push({'name' : 'Vesting', 'balance' : vesting.balance})
                  console.log('this is balance in vesting ', balances  )
                  omniClient.cmd('tl_getbalance', address, 1, function whenOK(err, vested, resHeaders){
                    if(err === null){
                      console.log('this is vested ALL ', vested.balance)
                      balances.push({'name' : 'Vested ALL', 'balance' : vested.balance})
                      console.log('this is balance in vested all ', balances  )

                      res.json(balances);
                    } else {
                      console.log('something went wrong in calling balance of vested ALL ', err)
                      res.json(err)
                    }
                  })
                } else {
                  console.log('something went wrong in vesting balance ', err)
                  res.json(err)
                }
              })
            }
            else {
              res.json('problem parsing balance' + balances)
            }
         }
         else {
           res.json('empty balances')
           console.log('balance not greater than 0')
        }
      } //end if balance command executes successfulluy
      else {
        res.json(stderr)
          console.log('balance command error', stderr)
      } //end balance command execution
  });
})

const getBalance = async (address) => {
  const network = 'LTCTEST';
  const apiUrl = `https://sochain.com/api/v2/get_address_balance/${network}`;
  const res = await axios.get(`${apiUrl}/${address}`);
  return res.data.data
};

const getTokens = async (address) => {
  const equityRes = await tl.getallbalancesforaddress(address);
  const proprArray = equityRes.data || [];

  const equityArray = [];
  for (let i=0; i < proprArray.length; i++) {
    const propertyid = proprArray[i].propertyid;
    const balance = parseFloat(proprArray[i].balance);
    const reserve = parseFloat(proprArray[i].reserve);
    const sum = balance + reserve;
    const getLtcvolumeRes = await tl.getLtcvolume(propertyid);
    const ltcVolumePerToken = parseFloat(getLtcvolumeRes.data.volume) || 0;
    const ltcVolume = ltcVolumePerToken * sum;
    const data = { propertyid, sum, ltcVolumePerToken, ltcVolume};
    equityArray.push(data);
  }
  return equityArray;
};

balanceRouter.get('/getAvailableBalance', async (req, res) => {
  try {
  const addresses = req.query.addresses;
  if (!addresses || !addresses.length) res({error: `No provided Addresses`});
  const result = [];
  for (let i=0; i < addresses.length; i++) {
    const _result = await getBalance(addresses[i]);
    _result.tokens = await getTokens(addresses[i]);
    _result.equity = (_result.tokens.map(e => e.ltcVolume).reduce((acc, val) => acc + val, 0)) + parseFloat(_result.confirmed_balance);
    result.push(_result);
  }

  const sum = {
    address: 'sum',
    confirmed_balance: result.map(_ => parseFloat(_.confirmed_balance)).reduce((acc, val) => acc + val, 0),
    unconfirmed_balance: result.map(_ => parseFloat(_.unconfirmed_balance)).reduce((acc, val) => acc + val, 0),
    // equity: result.map(_ => _.equity).reduce((acc, val) => acc + val, 0),
    equity: 0,
  }
  result.push(sum);
  res.send(result);
  } catch(error) {
    res.send(error.message);
  }
})

balanceRouter.get('/getEquity', function(req, res){
  var address = req.query.address.toString();
  var contractIDALL = req.query.contractIDALL;
  var contractID = req.query.contractID;
  var sellObj = "";
  var buyObj = "";
  var balances = [];
  var balance = 0.0
  var available = 0.0
  var balanceCommand = path+"/litecoin-cli -datadir="+ datadir +" tl_getbalance "+address.toString()+" "+ parseInt(contractIDALL);
  var options = { env : process.env }

  exec(balanceCommand, options, function (error, stdout2, stderr) {
      if (error === null) {
        var name = 'ALL';
        balance = parseFloat(JSON.parse(stdout2).balance)
        balance += parseFloat(JSON.parse(stdout2).reserve)
        var myBalance = {
          'balance': balance,
          'available': available
        }
        res.json(myBalance)
        // after getting all balance, then get Contract Reserve balance
        // omniClient.cmd('tl_getcontract_reserve', address, parseInt(contractIDALL), function whenOK(err, reserve, resHeaders){
        //         if (err === null) {
        //           console.log('this is reserve ', reserve)
        //           console.log('this is reserve balance ', reserve['contract reserve'])
        //           balance += parseFloat(reserve['contract reserve'])
        //           console.log('this is balance incl reserve ', balance  )
        //           var myBalance = {
        //             'balance': balance,
        //             'available': available
        //           }
        //           res.send(myBalance)
        //         } else {
        //           console.log('something went wrong in reserve balance ', err)
        //           res.send(err)
        //         }
        //      })
      } //end if balance command executes successfulluy
      else {
        console.log('balance command error', stderr)
        res.json(stderr)
      } //end of else error is null
  }) // balance command execution
})


// const balanceApi = ({omniClient, ...app}) => {
//   return app
// }

module.exports = {
  // balanceApi,
  balanceRouter
}
