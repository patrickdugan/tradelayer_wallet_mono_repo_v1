var tl = require('./TradeLayerRPCAPI.js').tl

var loops = 0

var property1 = 6 // add property 1
var property2 = 4 // add property 2
var address1 = "mo6tiBAybTJDgiwapTRstiBYd52tUKNoyS" // add address 1
var address2 = "myvUzqHGmc9M9RGXm2wvBXzVirSjkymEU9" // add address 2 
var deleteCount = 50

var intervalMs = 300000

function tradeBot(){
    setInterval(function(){
            loops +=1
            var amount =  Math.random()>=0.5 ? 0.01 : 0.025
            //var amount = parseFloat((Math.random()*0.02).toFixed(4))
            // var address = loops%2==0 ? address1 : address2
            // var propertyId = loops%2==0 ? property1 : property2
            var params = {
                address1: address1,
                address2: address2,
                id: property1,
                amount,
            };
            console.log(`loop number: ${loops}`);
            tl.send(params.address1, params.address2, params.id, params.amount.toString(), function(data, err){
                if(err) {
                    console.log("There is an error with Trade!!!\n", params, err)
                } else {
                    console.log("Successful Trade: \n", data)
                }

            })
           /* if(loops%deleteCount==0){tl.sendCancelAllTrades(address, function(data, err){
                if (err) {
                    console.log("There is an error with trade cancelation !!!\n", err)

                } else {
                    console.log("Successful Trade Cancelation: \n", data)

                }
            })}*/
        }, intervalMs);
}

tradeBot()
