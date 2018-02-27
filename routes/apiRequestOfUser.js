var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');


const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
	try {
		var queryAPp = {
			dataAPITrackinglink : true
		}
		var query = {
			"idFacebook" : req.user.id
		}
		var today = new Date();
 		var strToday = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()} - ${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;
		mongo.connect(pathMongodb,function(err,db){
			assert.equal(null,err);
				db.collection('userlist').findOne(queryAPp,function(err,result){
					if(!err){
						var dataSet = {
							$push : {
								"request" : {
									affId    : req.user.id,
									avatar   : req.user.photos[0].value,
									name 	 : req.user.displayName,
									offerId  : req.body.offerId,
									app 	 : result.offerList[req.body.offerId],
									time     : strToday,
									adConfirm: "false"
								}
							}
						}
						db.collection('userlist').updateOne(query, dataSet, function(err,result){
							if(!err){
								res.send("ok")
							}else{
								res.send(err);
							}
						});
					}else{
						res.send(err);
					}
				assert.equal(null,err);
				db.close();
			});
		});
	} catch(e) {
		res.redirect("/");
		res.end();
	}
});

module.exports = router;
