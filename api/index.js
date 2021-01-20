const config = require('./config');
// const helpers = require('./helpers');
const { base64encode, base64decode } = require('nodejs-base64')

var omniClient = require('./ltc_client.js')
var tl = require('./bot/TradeLayerRPCAPI')

omniClient.getNetworkHashPs(function(err, hashps) {
	if (err) console.error(err);
	console.log('Network Hash Rate: ' + hashps);
});
//connect to express
var express = require('express');        // call express
var app = express();                 // define our app using express
var cors = require("cors")
var bodyParser = require('body-parser');
var asynco = require('async');
var dns = require("dns");
var exec = require('child_process').exec;
const execSync = require('child_process').execSync;
var dgram = require('dgram');
var udpserver= dgram.createSocket('udp4');
var fs = require('fs')
var http = require('http').Server(app);
var io = require('socket.io')(75, {
	cors: {
	  origin: "*",
	  methods: ["GET", "POST"]
	}
  });
var path= config.TLPATH
var datadir = config.TLDATADIR
var morgan = require('morgan')
// var store_dir = datadir + '/sessions/'
const handleIoConnection = require('./sockets/index.js');
const handleIoConnection_simple = require('./sockets/simple');
const { getInfo } = require('./scripts/getInfo');
const { findNewBlockTask } = require('./jobs');
const { redisClient } = require('./redis_client');

app.use(cors())
//SOCKET IO
io.on('connection', handleIoConnection_simple)

//UDP server
udpserver.on('error', (err) => {
	  //console.log(`server error:\n${err.stack}`);
	  udpserver.close();
});

udpserver.on('listening', () => {
	  const address = udpserver.address();
	  //console.log(`server listening ${address.address}:${address.port}`);
});
udpserver.bind(666);

const configureRoutes = require('./routes');


// app.omniClient = omniClient

app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

config.LOGGER && app.use(morgan())
//****LAST PROP CODE
var lastBlock = 0
var firstTime = true;

// set the omniClient  to the request object
app.use((req, res, next)  => {
	// give routes access to omniClient
	req.omniClient = omniClient;
	req.tlClient = tl
	next()
})

// function getInfo(){
// 	var command = path+'/litecoin-cli -datadir='+ datadir +' tl_getinfo'
// 	return (new Promise((resolve, reject) => {
// 		exec(command, function (error2, stdout2, stderr2) {
// 			//console.log("ERR "+ error2)
// 			if (error2) return resolve(false);
// 			resolve(stdout2);
// 		});
// 	}));
// }

// function createContract(blocks){
// 	    firstTime=false
// 	    console.log("Creando contrato "+ propertyId)
// 		var command = path+'/litecoin-cli -datadir='+ datadir +' tl_createcontract QQi279Fm1d8Fji3283C61XoFucAXdzeHvs 1 4 "ALL '+ String(propertyId) +'18" '+ blocks +' 1 3 1'
// 	  	console.log("Command "+ command)
// 		exec(command, function (error, stdout, stderr) {
// 			//console.log("ERR "+ error)
// 			if (error === null) {
// 				                                console.log("TRX "+ stdout)
// 								propertyId++;
// 								console.log("OK CONTRACT ")
// 								setLastProp()
// 					}
// 				})
// }

// function createContractFirstTime(){
//
// 	    console.log("CREANDO PRIMEROS CONTRATOS "+ propertyId)
// 		var command = path+'/litecoin-cli -datadir='+ datadir +' tl_createcontract QQi279Fm1d8Fji3283C61XoFucAXdzeHvs 1 4 "ALL '+ String(propertyId) +'18" 5 1 3 1'
//
// 		console.log("Command1 "+ command)
// 		exec(command, function (error, stdout, stderr) {
// 			//console.log("ERR1 "+ error)
// 			if (error === null) {
// 						console.log("TRX "+ stdout)
// 						propertyId++;
// 						var command2 = path+'/litecoin-cli -datadir='+ datadir +' tl_createcontract QQi279Fm1d8Fji3283C61XoFucAXdzeHvs 1 4 "ALL '+ String(propertyId) +'18" 10 1 3 1'
// 						console.log("Command2 "+ command2)
// 						exec(command2, function (error2, stdout2, stderr2) {
// 						//console.log("ERR2 "+ error2)
// 						if (error === null) {
// 									console.log("TRX "+ stdout2)
// 									propertyId++;
// 									console.log("OK FIRST CONTRACT ")
//
// 								}
// 							})
// 					}
// 				})
// }

//$SRC/litecoin-cli -datadir=$DATADIR tl_gettradehistory ${CONTRACT_ID}

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
app.get('/api/index', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// ROUTES FOR OUR API
// =============================================================================
configureRoutes(app);


// getInfo()
// .then(response => console.log(response))
// .catch(err => console.log(err.message))
// Call the redis client to cache the getInfo

const getInfoRedisKey = 'getInfo';
    const blocksInfoRedisKey = 'blocksInfo';
    redisClient.get(getInfoRedisKey, (err, getInfo) => {

        redisClient.get(blocksInfoRedisKey, (err, blocksInfo) => {

            if(getInfo && blocksInfo) {
console.log('get info: ', getInfo)
console.log('blocks info: ', blocksInfo)
}
})
})
const getInfoParams = {
	omniClient,
}
getInfo(getInfoParams);

// start the cron job
findNewBlockTask.start();
// redisClient.cl


//redisClient.flushdb( function (err, succeeded) {
  //  console.log(succeeded); // will be true if successfull
//});


// START THE SERVER
// =============================================================================
// app.listen();
var port = process.env.PORT || 3002;        // set our port
var socketPort = process.env.SOCKET_PORT || 75; 

app.listen(port, function(){
  console.log('Magic happens on port ' + port);
});
