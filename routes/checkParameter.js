var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
var randomstring = require("randomstring");

const pathMongodb = require("./pathDb");

router.get('/', function(req, res, next) {
	function getClientAddress(request){ 
	    with(request)
	        return (req.headers["X-Forwarded-For"] ||
            req.headers["x-forwarded-for"] ||
            '').split(',')[0] ||
           	req.client.remoteAddress;
	}
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
	function redirectAPI(app, data, person) {
		var queryNetwork = {
			"isNetwork" : true
		}
		var ip = getClientAddress(req);
		var today = new Date();
		var strToday = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()} - ${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;
		var strRandom = randomstring.generate();
		if(person.master){
			data.paySet = Math.round((data.paySet/100*20)*100)/100;
		}
		var dataUpdate = {
			$push : {
				"report" : {
					"appName"   : data.nameSet,
					"name"	 	: person.profile.displayName,
		            "idOffer"   : req.query.offer_id,
		            "id"	 	: req.query.aff_id,
		            "time"		: strToday,
		            "country"   : data.countrySet,
		            "ip"		: ip,
		            "agent"		: req.headers['user-agent'],
		            "key" 		: strRandom,
		            "pay"	  	: data.paySet,
		            "platfrom"	: data.platformSet
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
	try {
		function checkPostback(app, person) {
			if(person.member){
				if(person.request.length>0){
					let data = person.request.filter(function(items) {
						return items.app.index === req.query.offer_id&&items.adConfirm === "true";
					});
					if(data.length === 0){
						res.redirect("/");
					}else{
						redirectAPI(app, data[0].app, person)
					}
				}else{
					res.redirect("/");
				}
			}else if(person.master){
				let data = app;
				redirectAPI(app, data, person)
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
