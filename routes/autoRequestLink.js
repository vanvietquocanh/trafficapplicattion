var express = require('express');
var router = express.Router();
var request = require("request");
const mongo = require('mongodb');
const assert = require('assert');
const fs = require("fs");
const countryList = require("./listcountry");
const pathMongodb = require("./pathDb");
var gplay = require('google-play-scraper');
var store = require('app-store-scraper');

router.post('/', function(req, res, next) {
	var requestApi = new RequestAPI();
	function RequestAPI() {
		this.arrayDadaPushToDatabase = [];
		this.countCustomInNetwork = 0;
		this.textWrite = "";
		this.lengthArray = 0;
		this.lengthOfNet = 0;
		this.totalArray = [];
		this.max = 0;
		this.netIndex = 0;
		this.index = -1;
		this.arIndexDel = [];
		this.allNetwork;
		this.dataSave = [];
		this.HaskeyObject;
		this.checkIcon = [];
		this.countRequest = 0;
		this.dataHasOffer;
		this.regex = /[A-Z]{2}\/[A-Z]{2}/
		this.regex2 = /[A-Z]{2}\,[A-Z]{2}/
		this.regex3 = /[A-Z]{2}\*|[A-Z]{2}\*\*/
		this.regularAndroid = new RegExp(/market|play.google.com/,"i");
	}
	RequestAPI.prototype.loopOrder = function(respon, network) {
		var value = false;
		if(respon.body!==undefined){
			network.custom.data.split(",").forEach( function(element, index) {
				if(JSON.parse(respon.body)[`${element}`].length>0){
					value = true;
				}else{
					value = false;
				}
			});
		}
		return value;
	};
	RequestAPI.prototype.changeKeyOject = function(respon, network, max) {
		var data = JSON.parse(respon);
		var dataChecker = data;
		requestApi.lengthArray += data.length;
		for(let i = 0; i < network.custom.data.split(",").length; i++){
			dataChecker = dataChecker[`${network.custom.data.split(",")[i].trim()}`];
		}
		for(let z = 0; z < dataChecker.length; z++){
			dataChecker[z].nameNetworkSet = network.name;
			for(var j = 1; j < Object.keys(network.custom).length; j++){
				dataChecker[z][`${Object.keys(network.custom)[j].trim()}`] = dataChecker[z][`${network.custom[Object.keys(network.custom)[j]].trim()}`];
				delete dataChecker[z][`${network.custom[Object.keys(network.custom)[j]].trim()}`];
			}
			max++;
			dataChecker[z].index = max;
			dataChecker[z].isNetwork = true; 
			requestApi.arrayDadaPushToDatabase.push(dataChecker[z])
		}//this is loop change keys of value;
		requestApi.countRequest++;
		requestApi.max = max;
	};
	RequestAPI.prototype.writeFileText = function(db) {
		db.collection("offer").find().toArray((err, result)=>{
			if(!err){
				if(result!==undefined){
					result.forEach( function(element, index) {
						var countryFix;
						if(element.countrySet.length>3){
							countryFix = element.countrySet.split("|").join(',');
						}else{
							countryFix = element.countrySet;
						}
						requestApi.textWrite += `http://${req.headers.host}/click/?offer_id=${element.index}|${countryFix}|${element.platformSet.toUpperCase()}|${element.nameNetworkSet.toLowerCase()}\r\n`;
					});
				}
				fs.writeFile("OfferList.txt", requestApi.textWrite, (err)=>{
					if(err){
						throw err;
					}else {
						res.send("Successfully saved MongoDB data!");
					}
				});
				db.close();
			}
		})
	};
	RequestAPI.prototype.insertNewDB = function(db, data, index) {
		if(data.length>0){
			data.forEach( function(element, i) {
				index++;
				data[i].index = index;
			});
			db.collection("offer").insertMany(data, (err,result)=>{
				if(!err){
					db.collection("offerTest").drop();
					mongo.connect(pathMongodb, (err, db)=>{
						requestApi.writeFileText(db);
					})
				}
			})									
		}else{
			db.close();
			res.send("No Change");
		}
	};
	RequestAPI.prototype.checkduplicate = function(db, query, newData, index) {
		db.collection("offer").find(query).toArray((err, data)=>{
			if(!err){
				if(data.length>0){
					db.collection("offerTest").createIndex({"offeridSet" : 1}, {unique: true}, err=>{
						db.collection("offerTest").insertMany(data, err=>{
							db.collection("offerTest").insertMany(newData, (err, result)=>{
								db.collection("offerTest").find().skip(data.length).toArray((err,result)=>{
									requestApi.insertNewDB(db, result, index)
								})
							})
						})
					});
				}else{
					requestApi.insertNewDB(db, newData, index);
				}
			}
		})	
	};
	RequestAPI.prototype.callRequestPostAppflood = (network, db) =>{
		try {
			request.post({
			    url: network.link
			}, function (err, respon) {
				countRequestAuto++;
				if(requestApi.loopOrder(respon, network)){
			   		requestApi.changeData(network, db, respon.body)
				}else{
					res.send("No Data")
				}
			});
		} catch(e) {
			res.send("error");
		}
	}
	RequestAPI.prototype.callRequestGetAppflood = (network, db) =>{
		try {
			request.get({
			    url: network.link
			}, function (err, respon) {
				if(respon.body.indexOf("<html>")===-1){
					if(requestApi.loopOrder(respon, network)){
				   		requestApi.changeData(network, db, respon.body);
					}else{
						res.send("No Data")
					}
				}else{
					res.send("error");
				}
			});
		} catch(e) {
			res.send("error");
		}
	}
	RequestAPI.prototype.checkApp = function(path) {
 		let id = "";
		if(path.indexOf("market://")!==-1||path.indexOf("play.google.com")!==-1){
 			if(!(/\%3D/.test(path))){
 				if(path.indexOf("market://")!==-1){
	 				id += path.split("id=")[1].split("&")[0];
	 			}else{
	 				id += path.split("id=")[1].split("&")[0];
	 			}
 			}else{
 				if(/referrer/.test(path)){
 					id += path.split(/\?id=/)[1].split(/\&/)[0];
 				}else{
 					id += path.split(/\%3D/)[1].split(/\%26/)[0];
 				}
 			}
			return id;
		}else if (path.indexOf("itunes.apple.com")!==-1){
			if(/apple-store/.test(path)||/id\/app/.test(path)){
				id += path.split("?mt")[0].split("store/")[1];
			}else {
				id += path.split("id")[1].split("?")[0];
			}
			return id;
		}else{
			return "error==="+path;
		}
	};
	RequestAPI.prototype.changeDataHasOffer = function(db) {
		requestApi.HaskeyObject.forEach( function(element, index) {
			if(!(/APK/.test(requestApi.dataHasOffer[element].Offer.name))){
				var dataOffer = {
					"offeridSet"  	 : requestApi.dataHasOffer[element].Offer.id,
					"platformSet"    : (requestApi.regularAndroid.test(requestApi.dataHasOffer[element].Offer.preview_url))?"android":"ios",
					"nameSet"    	 : requestApi.dataHasOffer[element].Offer.name,
					"urlSet"	 	 : `http://50mango.go2cloud.org/aff_c?offer_id=${requestApi.dataHasOffer[element].Offer.id}&aff_id=2837`,
					"paySet" 		 : requestApi.dataHasOffer[element].Offer.default_payout,
					"countrySet"     : requestApi.dataHasOffer[element].Offer.name.split("[").join("").split("]").join("").split("\t").join(" ").split(" "),
					"prevLink" 	 	 : requestApi.dataHasOffer[element].Offer.preview_url,
					"descriptionSet" : requestApi.dataHasOffer[element].Offer.description,
					"nameNetworkSet" : "hasoffer",
					"capSet"	     : requestApi.dataHasOffer[element].Offer.payout_cap,
					"isNetwork"		 : true,
					"offerType" 	 : requestApi.dataHasOffer[element].Offer.payout_type,
					"imgSet"	 	 : requestApi.checkApp(requestApi.dataHasOffer[element].Offer.preview_url)
				}
				var country = dataOffer.countrySet.filter( function(element, index) {
					return countryList.indexOf(element)!==-1;
				});
				if(country.length===0){
					if(dataOffer.countrySet.indexOf("UAE")!==-1){
						country = "AE";
					}else if(dataOffer.countrySet.indexOf("WW")!==-1){
						country = countryList.toString();
					}else if(requestApi.regex3.test(dataOffer.countrySet)){
						dataOffer.countrySet.forEach((el, index)=>{
							if(requestApi.regex3.test(el)){
								country = el.split("*").join("").split("*").join("");
							}
						})
					}else{
						countryList.forEach( function(element, index) {
							for (var i = 0; i < dataOffer.countrySet.length; i++) {
								if(requestApi.regex.test(dataOffer.countrySet[i])||requestApi.regex2.test(dataOffer.countrySet[i])){
									if(requestApi.regex.test(dataOffer.countrySet[i])){
										country = dataOffer.countrySet[i].split("/").join("|");
										break;
									}else{
										country = dataOffer.countrySet[i].split(",").join("|");
										break;
									}
								}
							}
						});
					}
				}
				dataOffer.countrySet = country.toString();
				if(dataOffer!==undefined){
					requestApi.checkIcon.push(dataOffer);
				}
			}
		});
		db.collection("offer").find().sort({index:-1}).limit(1).toArray((err, result)=>{
			if(!err){
				if(result.length===0){
					requestApi.max = 0;
				}else{
					requestApi.max = Number(result[0].index);
				}
				requestApi.checkIconApp(requestApi.max);
			}else{
				res.send("error")
			}
		})
	};
	function checkGoogleApp(id, maxIndex) {
		gplay.app({appId: id})
		.then(data=>{
			requestApi.checkIcon[requestApi.index].imgSet = data.icon;
			requestApi.checkIconApp(maxIndex);
		})
		.catch(err=>{
			requestApi.checkIcon[requestApi.index].imgSet = `http://${req.headers.host}/assets/images/android-big.png`;
			requestApi.checkIconApp(maxIndex);
		})
	}
	function checkAppleApp(id, maxIndex) {
		store.app({	"id" : id })
		.then(data=>{
			requestApi.checkIcon[requestApi.index].imgSet = data.icon;
			requestApi.checkIconApp(maxIndex);
		})
		.catch((err)=>{
			requestApi.checkIcon[requestApi.index].imgSet = `http://${req.headers.host}/assets/images/apple-big.png`;
			requestApi.checkIconApp(maxIndex);
		})
	}
	RequestAPI.prototype.checkIconApp = function(maxIndex) {
		requestApi.index++;
		if(requestApi.index===requestApi.checkIcon.length){
			mongo.connect(pathMongodb, (err, db)=>{
				if(!err){
					var query = {
						"nameNetworkSet" : "hasoffer"
					}
					requestApi.checkduplicate(db, query, requestApi.checkIcon, maxIndex);
				}
			})
		}else{
			if (isNaN(requestApi.checkIcon[requestApi.index].imgSet)) {
				checkGoogleApp(requestApi.checkIcon[requestApi.index].imgSet, maxIndex);
			}else{
				checkAppleApp(requestApi.checkIcon[requestApi.index].imgSet, maxIndex);
			}
		}
	};
	RequestAPI.prototype.changeData = (network, db, respon) =>{
		requestApi.countCustomInNetwork++;
		db.collection("offer").find().sort({index:-1}).limit(1).toArray((err, result)=>{
			if(!err){
				if(result.length===0&&requestApi.countCustomInNetwork===1){
					requestApi.max = 0;
					requestApi.changeKeyOject(respon, network, requestApi.max);
				}else{
					if(requestApi.countCustomInNetwork===1){
						requestApi.max = Number(result[0].index);
					}
					requestApi.changeKeyOject(respon, network, requestApi.max);
				}
				if(requestApi.lengthOfNet === requestApi.countRequest){
					if(result.length===0){
						db.collection("offer").insertMany(requestApi.arrayDadaPushToDatabase, (err, result)=>{
							if(!err){
								requestApi.writeFileText(db);
							}
						})
					}else{
						var indexOfferNext = Number(result[0].index);
						var query = {
							"nameNetworkSet" : network.name
						}
						requestApi.max = Number(result[0].index);
						requestApi.checkduplicate(db, query, requestApi.arrayDadaPushToDatabase, requestApi.max)
					}
				}
			}
		})
	}
	RequestAPI.prototype.callRequestGetHasOffer = (network, db) =>{
		try {
			request.get({
			    url: network.link
			}, function (err, respon) {
				if(respon.body){
					requestApi.HaskeyObject = Object.keys(JSON.parse(respon.body).response.data);
					requestApi.dataHasOffer = JSON.parse(respon.body).response.data;
					requestApi.changeDataHasOffer(db);
				}else{
					res.send("error");
				}
			});
		} catch(e) {
			res.send("error");
		}
	}
	RequestAPI.prototype.requestEmpty = (network, db) =>{
		requestApi.lengthOfNet++;
		switch (network[req.body.index].method) {
			case "GET":
				if(network[req.body.index].type==="appflood"){
					if(network[req.body.index].custom.data!==undefined){
						requestApi.callRequestGetAppflood(network[req.body.index], db)
					}else{
						res.send("plase enter Custom")
					}
				}else{
					requestApi.callRequestGetHasOffer(network[req.body.index], db)
				}
				break;
			case "POST":
				if(network[req.body.index].type==="appflood"){
					if(network[req.body.index].custom.data!==undefined){
						requestApi.callRequestPostAppflood(network[req.body.index], db)
					}
				}
				break;
		}
	}
	RequestAPI.prototype.findLinkAPI = (db) =>{
		db.collection("network").find().toArray((err, result)=>{
			if(!err){
				requestApi.allNetwork = result;
				requestApi.requestEmpty(result, db);
			}else{
				res.send("error");
			}
		})
	}
	try{
		var query = {
			"idFacebook" : req.user.id
		}
		mongo.connect(pathMongodb,function(err,db){
			assert.equal(null,err);
				db.collection('userlist').findOne(query,function(err,result){
					if(!err){
						if(result.admin){
							requestApi.findLinkAPI(db);
						}else{
							res.send("Mày đéo phải admin");
						}
					}else{
						res.send("error")
					}
				assert.equal(null,err);
			});
		});
	}catch(e){
		res.send("error")
		res.end();
	}
});

module.exports = router;