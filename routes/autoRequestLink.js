var express = require('express');
var router = express.Router();
var request = require("request");
const mongo = require('mongodb');
const assert = require('assert');
const fs = require("fs");
const countryList = require("./listcountry");
const pathMongodb = require("./pathDb");
var gplay = require('google-play-scraper');

router.post('/', function(req, res, next) {
	var requestApi = new RequestAPI();
	function RequestAPI() {
		this.arrayDataPushToDatabase = [];
		this.countCustomInNetwork = 0;
		this.textWrite = "";
		this.lengthOfNet = 0;
		this.totalArray = [];
		this.max = 0;
		this.index = -1;
		this.arIndexDel = [];
		this.allNetwork;
		this.network;
		this.HaskeyObject;
		this.checkIcon = [];
		this.countRequest = 0;
		this.dataHasOffer;
		this.conditionPush = true;
		this.url = /(http(s?))\:\/\//
		this.regex = /[A-Z]{2}\/[A-Z]{2}/
		this.regex2 = /[A-Z]{2}\,[A-Z]{2}/
		this.regex3 = /[A-Z]{2}\*|[A-Z]{2}\*\*/
		this.regexPlatform = new RegExp("android", "i")
		this.regularAndroid = new RegExp(/market|play.google.com/,"i");
		this.regularIOS = new RegExp("itunes|apple","i");
	}
	RequestAPI.prototype.loopOrder = function(respon, network) {
		var value = false;
		if(respon.body!==undefined){
			var data = JSON.parse(respon.body);
			network.custom.data.split(",").forEach( function(element, index) {
				if(data[`${element}`].length>0||Object.keys(data[`${element}`]).length>0){
					requestApi.dataOffer = data[`${element}`];
					requestApi.keyObject = Object.keys(data[`${element}`]);
					value = true;
				}else{
					value = false;
				}
				data = data[`${element}`];
			});
		}
		return value;
	};
	RequestAPI.prototype.changeKeyOject = function(dataChecker, network, max) {
		requestApi.dataSave = dataChecker;
		for(let z = 0; z < dataChecker.length; z++){
			dataChecker[z].nameNetworkSet = network.name.toLowerCase();
			for(var j = 1; j < Object.keys(network.custom).length; j++){
				var objectCustom = network.custom[Object.keys(network.custom)[j]].trim().split(",");
				var dataLead = dataChecker[z];
				if(objectCustom.length>1){
					for (let i = 0; i < objectCustom.length; i++) {
						if(dataLead!==undefined){
							dataLead = dataLead[objectCustom[i]];
						}else{
							dataLead = "";
						}
					}
				}else{
					dataLead = dataChecker[z][`${network.custom[Object.keys(network.custom)[j]].trim()}`];
				}
				if(dataLead==null||dataLead===undefined){
					switch (Object.keys(network.custom)[j].trim()) {
						case "imgSet":
							if(dataChecker[z].APP_ID){
								dataLead = dataChecker[z].APP_ID;
							}else if(dataChecker[z].package_name){
								dataLead = (Object.keys(network.custom)[j-1].trim().toLowerCase()==="android"||/id/.test(dataChecker[z].package_name))?dataChecker[z].package_name:"id"+dataChecker[z].package_name;
							}else{
								dataLead = requestApi.checkApp(dataChecker[z][`${network.custom[Object.keys(network.custom)[j+8]]}`]);
							}
							break;
						case "categorySet":
							dataLead = "";
							break;
						case "countrySet":
							requestApi.conditionPush = false;
							break;
						case "platformSet":
							if(requestApi.regexPlatform.test(dataChecker[z][`${network.custom[Object.keys(network.custom)[j-1]].trim()}`])){
								dataLead = "android";
							}else if(requestApi.regularIOS.test(dataChecker[z][`${network.custom[Object.keys(network.custom)[j-1]].trim()}`])){
								dataLead = "ios";
							}else{
								requestApi.conditionPush = false;
							}
							break;
					}
				}
				dataChecker[z][`${Object.keys(network.custom)[j].trim()}`] = dataLead;
				// delete dataChecker[z][`${network.custom[Object.keys(network.custom)[j]].trim()}`];
			}
			max++;
			dataChecker[z].index = max;
			dataChecker[z].isNetwork = true;
			if(requestApi.conditionPush){
				dataChecker[z].countrySet = dataChecker[z].countrySet.toUpperCase();
				requestApi.arrayDataPushToDatabase.push(dataChecker[z])
			}else{
				requestApi.conditionPush = true;
			}
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
							countryFix = element.countrySet.toString().split("|").join(',');
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
	RequestAPI.prototype.insertNewDB = function(db, data) {
		if(data.length>0){
			db.collection("offer").find().sort({index:-1}).limit(1).toArray((err, result)=>{
				if(!err){
					if(result.length>0){
						data.forEach( function(element, i) {
							result[0].index++;
							data[i].index = result[0].index;
						});
					}else{
						var index = 0;
						data.forEach( function(element, i) {
							index++;
							data[i].index = index;
						});
					}
					db.collection("offer").insert(data, { ordered: false }, (err,result)=>{
						mongo.connect(pathMongodb, (err, db)=>{
							requestApi.writeFileText(db);
						})
					})		
				}						
			})
		}else{
			res.send("No Change");
		}
	};
	RequestAPI.prototype.callRequestAppflood = (network, db, method) =>{
		try {
			request[method.toLowerCase()]({
			    url: network.link
			}, function (err, respon) {
				if(respon.body.indexOf("<html>")===-1){
					if(requestApi.loopOrder(respon, network)){
						let data = JSON.parse(respon.body);
						let dataChecker = data;
						for(let i = 0; i < network.custom.data.split(",").length; i++){
							dataChecker = dataChecker[`${network.custom.data.split(",")[i].trim()}`];
						}
				   		requestApi.changeData(network, db, dataChecker);
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
		if(path!==undefined){
			if(path.indexOf("market://")!==-1||path.indexOf("play.google.com")!==-1){
	 			if(!(/\%3D/.test(path))){
	 				if(path.indexOf("market://")!==-1){
		 				id += path.split("id=")[1].split("&")[0];
		 			}else{
		 				id += path.split("id=")[1].split("&")[0];
		 			}
	 			}else{
	 				if(/referrer/.test(path)){
	 					if(path.split(/\?id=/).length>1){
	 						id += path.split(/\?id=/)[1].split(/\&/)[0];
	 					}else{
	 						id += path.split(/\&id=/)[1].split(/\&/)[0];
	 					}
	 				}else{
	 					id += path.split(/\%3D/)[1].split(/\%26/)[0];
	 				}
	 			}
				return id;
			}else if (path.indexOf("itunes.apple.com")!==-1){
				if(path.match(/id([0-9])+/)){
					id += path.match(/id([0-9])+/)[0];
				}else if(path.match(/([0-9])+/)){
					id += path.match(/([0-9])+/)[0]
				}
				return id;
			}else{
				return "error==="+path;
			}
		}
	};
	RequestAPI.prototype.changeDataHasOffer = function(db, network) {
		requestApi.network = network;
		requestApi.HaskeyObject.forEach( function(element, index) {
			if(!(/APK/.test(requestApi.dataHasOffer[element].Offer.name))){
				var dataOffer = {
					"offeridSet"  	 : requestApi.dataHasOffer[element].Offer.id,
					"platformSet"    : (requestApi.regularAndroid.test(requestApi.dataHasOffer[element].Offer.preview_url))?"android":"ios",
					"nameSet"    	 : requestApi.dataHasOffer[element].Offer.name,
					"urlSet"	 	 : network.custom.urlSet.split("{")[0]+requestApi.dataHasOffer[element].Offer.id+network.custom.urlSet.split("}")[1],
					"paySet" 		 : requestApi.dataHasOffer[element].Offer.default_payout,
					"countrySet"     : requestApi.dataHasOffer[element].Offer.name.split("[").join("").split("]").join("").split("\t").join(" ").split(" "),
					"prevLink" 	 	 : requestApi.dataHasOffer[element].Offer.preview_url,
					"descriptionSet" : "",
					"nameNetworkSet" : network.name.toLowerCase(),
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
				requestApi.checkIconApp(requestApi.checkIcon, requestApi.max);
			}else{
				res.send("error")
			}
		})
	};
	function checkGoogleApp(id, maxIndex) {
		gplay.app({appId: id})
		.then(data=>{
			requestApi.checkIcon[requestApi.index].imgSet = data.icon;
			requestApi.checkIconApp(requestApi.checkIcon, maxIndex);
		})
		.catch(err=>{
			requestApi.checkIcon[requestApi.index].imgSet = `http://${req.headers.host}/assets/images/android-big.png`;
			requestApi.checkIconApp(requestApi.checkIcon, maxIndex);
		})
	}
	function checkAppleApp(dataApp, id, country, maxIndex) {
		var path = `https://itunes.apple.com/${country.split(",")[0]}/lookup?id=${id}`;
		request.get(path ,(err, res, data)=>{
			if(data&&JSON.parse(data).resultCount!==0){
				dataApp[requestApi.index].imgSet = JSON.parse(data).results[0].artworkUrl100;
			}else{
				dataApp[requestApi.index].imgSet = `./assets/images/apple-big.png`;
			}
			requestApi.checkIconApp(dataApp, maxIndex);
		})
	}
	RequestAPI.prototype.checkIconApp = function(data, maxIndex) {
		requestApi.index++;
		if(requestApi.index===data.length){
			mongo.connect(pathMongodb, (err, db)=>{
				if(!err){
					requestApi.insertNewDB(db, data);
				}
			})
		}else{
			if(requestApi.url.test(data[requestApi.index].imgSet)&&data[requestApi.index].imgSet!==data[requestApi.index].prevLink){
				requestApi.checkIconApp(data, maxIndex++);
			}else{
				if (/[0-9]+/.test(data[requestApi.index].imgSet)) {
					if(data[requestApi.index].imgSet.match(/[0-9]+/)){
						checkAppleApp(data, data[requestApi.index].imgSet.match(/[0-9]+/)[0], data[requestApi.index].countrySet, maxIndex);
					}else{
						data[requestApi.index].imgSet = `./assets/images/apple-big.png`;
						requestApi.checkIconApp(data, maxIndex);
					}
				}else{
					checkGoogleApp(data[requestApi.index].imgSet, maxIndex);
				}
			}
		}
	};
	RequestAPI.prototype.changeData = (network, db, dataChecker) =>{
		requestApi.countCustomInNetwork++;
		db.collection("offer").find().sort({index:-1}).limit(1).toArray((err, result)=>{
			if(!err){
				requestApi.max = 0;
				if(result.length===0&&requestApi.countCustomInNetwork===1){
					requestApi.max = 0;
					requestApi.changeKeyOject(dataChecker, network, requestApi.max);
					requestApi.checkIcon = requestApi.arrayDataPushToDatabase;
					requestApi.checkIconApp(requestApi.checkIcon, requestApi.max)
				}else{
					if(requestApi.countCustomInNetwork===1){
						requestApi.max = Number(result[0].index);
					}
					requestApi.changeKeyOject(dataChecker, network, requestApi.max);
					requestApi.checkIcon = requestApi.arrayDataPushToDatabase;
					requestApi.checkIconApp(requestApi.checkIcon, requestApi.max)
				}						
			}
		})
	}
	// function function_name(db, result) {
	// 	if(result.length===0){
	// 		db.collection("offer").insert(requestApi.arrayDataPushToDatabase, { ordered: false }, (err, result)=>{
	// 			requestApi.writeFileText(db);
	// 		})
	// 	}else{
	// 		var indexOfferNext = Number(result[0].index);
	// 		requestApi.max = Number(result[0].index);
	// 		requestApi.insertNewDB(db, requestApi.arrayDataPushToDatabase, requestApi.max);
	// 	}
	// }
	RequestAPI.prototype.callRequestHasOffer = (network, db, method) =>{
		try {
			request[method.toLowerCase()]({
			    url: network.link
			}, function (err, respon) {
				if(respon.body){
					requestApi.HaskeyObject = Object.keys(JSON.parse(respon.body).response.data);
					requestApi.dataHasOffer = JSON.parse(respon.body).response.data;
					requestApi.changeDataHasOffer(db, network);
				}else{
					res.send("error");
				}
			});
		} catch(e) {
			res.send("error");
		}
	}
	RequestAPI.prototype.callRequestAppaniac = function(network, db, method) {
		try {
			request[method.toLowerCase()]({
			    url: network.link
			}, function (err, respon) {
				if(respon.body.indexOf("<html>")===-1){
					if(requestApi.loopOrder(respon, network)){
						let dataChange = [];
						requestApi.keyObject.forEach( function(element, index) {
							dataChange.push(requestApi.dataOffer[element]);
						});
				   		requestApi.changeData(network, db, dataChange);
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
	};
	RequestAPI.prototype.requestEmpty = (network, db) =>{
		requestApi.lengthOfNet++;
		switch (network[req.body.index].type) {
			case "appflood":
				if(network[req.body.index].custom.data!==undefined){
					requestApi.callRequestAppflood(network[req.body.index], db, network[req.body.index].method)
				}else{
					res.send("plase enter Custom")
				}
				break;
			case "hasoffer":
				requestApi.callRequestHasOffer(network[req.body.index], db, network[req.body.index].method)
				break;
			case "appaniac":
				if(network[req.body.index].custom.data!==undefined){
					requestApi.callRequestAppaniac(network[req.body.index], db, network[req.body.index].method)
				}else{
					res.send("plase enter Custom")
				}
				break;
			case "adattract":
				if(network[req.body.index].custom.data!==undefined){
					requestApi.callRequestAppaniac(network[req.body.index], db, network[req.body.index].method)
				}else{
					res.send("plase enter Custom")
				}
				break;
			default:
				res.send("Plase add type new network!")
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