var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
var randomstring = require("randomstring");
const pathMongodb = require("./pathDb");
var request = require("request");
var geoip = require('geoip-lite');

router.get('/', function(req, res, next) {
	function save(dataUpdate, link) {
		mongo.connect(pathMongodb, (err, db)=>{
			assert.equal(null,err);
			db.collection('report').insert(dataUpdate, { ordered: false }, function(err,result){
				res.redirect(link)
				res.end();
			db.close();
			})		
		})
	}
	function redirectAPI(app, data, person) {
		var queryNetwork = {
			"isNetwork" : true
		}
		var ip = req.headers["x-real-ip"];
		var today = new Date();
		var strToday = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()} - ${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;
		var strRandom = randomstring.generate();
		if(person.master){
			data.paySet = Math.round((data.paySet)*100)/100;
		}
		var dataUpdate = {
			"appName"    : data.nameSet,
			"name"	 	 : person.profile.displayName,
            "idOffer"    : req.query.offer_id,
            "id"	 	 : req.query.aff_id,
            "time"		 : strToday,
            "seconds"    : today.getTime(),
            "country"    : data.countrySet,
            "ip"	 	 : ip,
            "agent"		 : req.headers['user-agent'],
            "key" 		 : strRandom,
            "pay"	  	 : data.paySet,
            "platfrom"	 : data.platformSet,
            "networkName": data.nameNetworkSet,
            "idOfferNet" : data.offeridSet,
            "previewLink": data.prevLink,
		}
		if(req.query.transaction_id){
			dataUpdate.transaction_2 = req.query.transaction_id
		}
		try {
			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
					db.collection('network').find().toArray( function(err,result){
						if(!err){
							if(result.length!==0){
								for(let x = 0; x < result.length; x++){
									if(app.nameNetworkSet.toLowerCase().indexOf(result[x].name.toLowerCase())!==-1){
										var link = `${app.urlSet}&${result[x].postback}=${strRandom}`;
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
		} catch(e) {
			console.log(e);
		}
	}
	try {
		function checkIpAddress(app, geoVal){
			return app.countrySet.indexOf(geoVal)!==-1;
		}
		function checkPostback(app, person, db) {
			var geo = geoip.lookup(req.headers["x-real-ip"]).country;
			if(checkIpAddress(app, geo)){
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
				}else if(person.master||person.admin){
					redirectAPI(app, app, person)
				}
			}else{
				res.send("We're sorry, this offer is not currently available. Please try again later or contact customer support for further information")
			}
		}
	} catch(e) {
		console.log(e);
	}
	function checkInCvr(app, person, db) {
		var query = {
			ip  	: req.headers["x-real-ip"],
			idOffer : req.query.offer_id,
			enable  : false
		}
		db.collection("conversion").find(query).toArray((err, result)=>{
			if(result.length === 0&&app!==null){
				checkPostback(app, person, db);
			}else{
				res.send("This blacklisted ip is already banned from our system. Please contact to your ISP for re-cleaning it")
			}
		})
	}
	function checkApp(profile, db) {
		var querySearchOffer = {
			"index" : Number(req.query.offer_id)
		}
		db.collection('offer').findOne(querySearchOffer, (err,result)=>{
			if(!err){
				if(result){
					checkInCvr(result, profile, db);
				}
			}else{
				res.redirect("/")
			}
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
						if(result){
							if(result.profile !== undefined&&!(isNaN(req.query.offer_id))){
								checkApp(result, db)
							}else{
								res.redirect("/")
							}
						}else{
							res.redirect("/")
						}
					}else{
						res.redirect("/")
					}
				assert.equal(null,err);
			});
		});
	} catch(e) {
		res.redirect("/");
		res.end();
	}
});

module.exports = router;
