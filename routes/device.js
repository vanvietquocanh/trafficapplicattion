var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:value', function(req, res, next) {
	if(req.params.value==="mobile"){
		try {
			if(req.query.version>>0>=9){
				mongo.connect(pathMongodb, (err, db)=>{
					assert.equal(null, err);
					var queryDevice = {
						"isDevice" : true
					}
					db.collection("device").findOne(queryDevice, (err, result)=>{
						var deviceReq = result.device.filter(function(version) {
							return version.OSVersion.split(".")[0] === req.query.version;
						});
						var wifiName = result.wifiName[Math.floor((Math.random() * deviceReq.length))];
						var deviceMaxRandom = Math.floor((Math.random() * deviceReq.length));
						var OSVersionValue = deviceReq[deviceMaxRandom];
						var modelName = deviceReq[deviceMaxRandom].ModelName;
						var modelRandom = modelName[Math.floor((Math.random() * modelName.length))];
						var carrier = result.networkMobile[Math.floor((Math.random() * deviceReq.length))];
						var stringResponse = `name=${wifiName}|version=${OSVersionValue.OSVersion}|carrier=${carrier.Network}|buildversion=${OSVersionValue.Build}|model=${modelRandom}`;
						res.send(stringResponse);
						res.end();
						assert.equal(null,err);
						db.close();
					})					
				})
			}
		} catch(e) {
			console.log(e);
		}
	}
});

module.exports = router;
