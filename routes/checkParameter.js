var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
var randomstring = require("randomstring");
const pathMongodb = require("./pathDb");
var request = require("request");
var geoip = require('geoip-lite');
router.get('/', function(req, res, next) {
	function getClientAddress(request){ 
	    with(request)
	        return req.headers["x-real-ip"];
	}
	function save(dataUpdate, link) {
		var data = {
			"isReportClick" : true,
			"seconds" 	    : new Date().getTime(),
			"report" 	 	: dataUpdate
		}
			mongo.connect(pathMongodb, (err, db)=>{
				assert.equal(null,err);
				db.collection('userlist').insertOne(data, function(err,result){
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
			data.paySet = Math.round((data.paySet/100*7)*100)/100;
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
            "idOfferNet" : data.offeridSet
		}
		mongo.connect(pathMongodb,function(err,db){
			assert.equal(null,err);
				db.collection('userlist').findOne(queryNetwork, function(err,result){
					if(!err){
						if(result.NetworkList.length!==0){
							for(let x = 0; x < result.NetworkList.length; x++){
								if(app.nameNetworkSet.toLowerCase().indexOf(result.NetworkList[x].name.toLowerCase())!==-1){
									var link = `${app.urlSet}+&${result.NetworkList[x].postback}=${strRandom}`;
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
		db.collection("userlist").find({"isConversion":true}).toArray((err, result)=>{
			var data = [];
			var equalsCVR = [];
			result.forEach( function(element, i) {
				element.conversion.forEach( function(ele, index) {
					data.push(ele)
				});
			});
			if(data.length>0){
				data.forEach( function(ele, index) {
					if(ele.idOffer == req.query.offer_id && ele.ip == req.headers["x-real-ip"]){
						equalsCVR.push(ele)
					}
					if(data.length-1===index){
						if(equalsCVR.length === 0){
							checkPostback(app, person, db);
						}else{
							res.send("This blacklisted ip is already banned from our system. Please contact to your ISP for re-cleaning it")
						}
					}
				});
			}else{
				checkPostback(app, person, db);
			}
		})
	}
	function checkApp(profile, db) {
		var querySearchOffer = {
			"dataAPITrackinglink" : true
		}
		db.collection('userlist').find(querySearchOffer).toArray((err,result)=>{
			if(!err){
				for(var j = 0; j<result.length;j++){
					for(var i =0; i<result[j].offerList.length; i++){
						if(result[j].offerList[i].index == req.query.offer_id){
							checkInCvr(result[j].offerList[i], profile, db);
						}
					}
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
						if(result.profile){
							checkApp(result, db)
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
