var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
var randomstring = require("randomstring");
const pathMongodb = require("./pathDb");

router.get('/', function(req, res, next) {
	function redirectAPI(app, db) {
		try {
			var queryNetwork = {
				"isNetwork" : true
			}
			var strRandom = randomstring.generate();
			db.collection('network').findOne(queryNetwork, function(err,result){
				assert.equal(null,err);
				if(!err){
					if(result.NetworkList.length!==0){
						for(let x = 0; x < result.NetworkList.length; x++){
							if(app.nameNetworkSet.toLowerCase().indexOf(result.NetworkList[x].name.toLowerCase())!==-1){
								var link = `${app.urlSet}+&${result.NetworkList[x].postback}=${strRandom}`;
									res.redirect(link);
								break;
							}
						}
					}
				}else{
					res.send("error")
				}
				assert.equal(null,err);
				db.close();
			});
		} catch(e) {
			console.log(e);
		}
	}
	if(req.query.offer_id!==undefined&&!(isNaN(req.query.offer_id))){
		mongo.connect(pathMongodb,function(err,db){
			assert.equal(null,err);
			var querySearchOffer = {
				"index" : Number(req.query.offer_id)
			}
			db.collection('offer').findOne(querySearchOffer, (err,result)=>{
				if(!err){
					redirectAPI(result, db);
				}else{
					res.redirect("/")
				}
			})
			assert.equal(null,err);
		});
	}else {
		res.send("error");
	}
});

module.exports = router;
