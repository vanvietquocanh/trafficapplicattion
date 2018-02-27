var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
var randomstring = require("randomstring");

const pathMongodb = require("./pathDb");

router.get('/', function(req, res, next) {
	function save(dataUpdate, link) {
		var queryUpdate = {
			"isReportClick" : true
		}
		mongo.connect(pathMongodb, (err, db)=>{
			assert.equal(null,err);
			db.collection('userlist').updateOne(queryUpdate, dataUpdate, {upsert:true}, function(err,result){
				res.redirect(link)
				res.end();
			assert.equal(null,err);
			db.close();
		})		
	})
	}
	try {
		function checkPostback(app, person) {
			if(person.request.length>0){
				var data = person.request.filter(function(items) {
					return items.app.index === req.query.offer_id&&items.adConfirm === "true";
				});
				if(data.length === 0){
					res.redirect("/");
				}else{
					var queryNetwork = {
						"isNetwork" : true
					}
					var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
					var today = new Date();
					var strToday = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()} - ${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;
					var strRandom = randomstring.generate();
					var dataUpdate = {
						$push : {
							"report" : {
								"appName"   : data[0].app.nameSet,
								"name"	 	: person.profile.displayName,
					            "idOffer"   : req.query.offer_id,
					            "id"	 	: req.query.aff_id,
					            "time"		: strToday,
					            "country"   : data[0].app.countrySet,
					            "ip"		: ip,
					            "agent"		: req.headers['user-agent'],
					            "key" 		: strRandom,
					            "pay"	  	: data[0].app.paySet,
					            "platfrom"	: data[0].app.platformSet
							}
						}
					}
					mongo.connect(pathMongodb,function(err,db){
						assert.equal(null,err);
							db.collection('userlist').findOne(queryNetwork, function(err,result){
								if(!err){
									if(result.NetworkList.length!==0){
										for(let x = 0; x < result.NetworkList.length; x++){
											if(app.nameNetworkSet.indexOf(result.NetworkList[x].name)!==-1){
												var link = `${app.urlSet}+&${result.NetworkList[x].postback}=${strRandom}`
													save(dataUpdate,link)
												break;
											}
										}
									}
								}
							assert.equal(null,err);
							db.close();
						});
					});
				}
			}else{
				res.redirect("/");
			}
		}
	} catch(e) {
		console.log(e);
	}
	function checkApp(profile, db) {
		var querySearchOffer = {
			"dataAPITrackinglink" : true
		}
		db.collection('userlist').findOne(querySearchOffer, function(err,result){
				checkPostback(result.offerList[req.query.offer_id], profile)
			assert.equal(null,err);
			db.close();
		})
	}
	try {
		var query = {
			"idFacebook" : req.query.aff_id
		}
		mongo.connect(pathMongodb,function(err,db){
			assert.equal(null,err);
				db.collection('userlist').findOne(query, function(err,result){
					if(!err){
						if(result.profile){
							checkApp(result, db)
						}else{
							res.redirect("/")
						}
					}else{
						res.redirect("/")
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
