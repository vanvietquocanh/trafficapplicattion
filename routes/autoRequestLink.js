var express = require('express');
var router = express.Router();
var request = require("request");
const mongo = require('mongodb');
const assert = require('assert');
const fs = require("fs");

const pathMongodb = require("./pathDb");

router.post('/', function(req, res, next) {
	var requestApi = new RequestAPI();
	function RequestAPI() {
		this.countRequest = 0;
		this.countCustomInNetwork = 0;
		this.arrayDadaPushToDatabase = [];
		this.arIndexDel = [];
		this.dataSave;
		this.textWrite = "";
		this.dataTotal = [];
		this.lengthArray = 0;
		this.totalArray = [];
	}
	RequestAPI.prototype.loopOrder = function(respon, network) {
		var value;
		network.custom.data.split(",").forEach( function(element, index) {
			if(JSON.parse(respon.body)[`${element}`].length>0){
				value = true;
			}else{
				value = false;
			}
		});
		return value;
	};
	RequestAPI.prototype.callRequestGet = (network, db, query) =>{
		try {
			request.get({
			    url: network.link
			}, function (err, respon) {
				if(requestApi.loopOrder(respon, network)){
			   		requestApi.changeData(network, db, query, respon.body)
				}else{
					requestApi.callRequestGet(network, db, query);
				}
			});
		} catch(e) {
			requestApi.callRequestGet(network, db, query);
		}
	}
	RequestAPI.prototype.changeKeyOject = function(respon, network, indexOfferNext) {
		requestApi.arrayDadaPushToDatabase = [];
		requestApi.countRequest++;
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
			dataChecker[z].index = new Number(indexOfferNext) + z;
			requestApi.arrayDadaPushToDatabase.push(dataChecker[z])
		}//this is loop change keys of value;
	};
	RequestAPI.prototype.changeData = (network, db, query, respon) =>{
			db.collection("userlist").find({"dataAPITrackinglink":true}).toArray((err, result)=>{
				var date = new Date().getTime();
				var indexOfferNext = 0;
		    	if(result.length>0){
		    		result.forEach( function(element, index) {
			    		element.offerList.forEach( function(app, i) {
							if(indexOfferNext < app.index){
								indexOfferNext = app.index;
							}
			    		});
			    	});
		    	}
				if(!err){
					if(result.length>1){
						if(result[0].offerList.length>0||result[1].offerList.length>0){
							result.forEach( function(element, index) {
								element.offerList.forEach( function(app, i) {
									requestApi.totalArray.push(app);
								});
							});
							requestApi.dataSave = requestApi.totalArray;
							requestApi.changeKeyOject(respon, network, indexOfferNext);
							requestApi.arrayDadaPushToDatabase.forEach((items, index)=>{ 
								requestApi.dataSave.forEach((el, i)=>{
									if(items.offeridSet === el.offeridSet&&items.nameNetworkSet === el.nameNetworkSet&& items.nameSet === el.nameSet){
										requestApi.arIndexDel.push(index);
									}
								})
							})
							for(var i = requestApi.arIndexDel.length; i >= 0; i--){
								requestApi.arrayDadaPushToDatabase.splice(requestApi.arIndexDel[i], 1)
							}
							var countLengthOfferList = requestApi.dataSave.length;
							var dataSave = {
								"dataAPITrackinglink" : true,
								"time" : date,
								"isOfNetWork" : true,
								"netWorkName" : network.name,
					    		"offerList" : requestApi.arrayDadaPushToDatabase
					    	}
					    	db.collection('userlist').insertOne(dataSave, (err,result)=>{
					    		if(!err){
					    			if(requestApi.countRequest===requestApi.countCustomInNetwork){
										db.collection("userlist").find({"dataAPITrackinglink" : true}).toArray((err, result)=>{
											if(result.length>1){
												result.forEach( function(element, index) {
													element.offerList.forEach( function(app, id) {
														var countryFix;
														if(app.countrySet.length>3){
															countryFix = app.countrySet.split("|").join(',');
														}else{
															countryFix = app.countrySet;
														}
														requestApi.textWrite += `http://${req.headers.host}/checkparameter/?offer_id=${app.index}&aff_id=${req.user.id}|${countryFix}|${app.platformSet.toUpperCase()}\r\n`;
													});
												});
											}
											fs.writeFile("OfferList.txt", requestApi.textWrite, (err)=>{
												if(err) throw err;
											});
											res.send("Successfully saved MongoDB data!");
										})
									}
					    		}else{
					    			res.send("Error connect Database. Please retry!!!")
					    		}
							})
						}
					}else{
						if(respon!==undefined){
						    try{
								requestApi.changeKeyOject(respon, network, indexOfferNext);
								var dataSave = {
						    		"dataAPITrackinglink" : true,
									"time" : date,
									"netWorkName" : network.name,
						    		"offerList": requestApi.arrayDadaPushToDatabase
						    	}
								db.collection('userlist').insertOne(dataSave ,(err,result)=>{
									if(!err){
										if(requestApi.countRequest===requestApi.countCustomInNetwork){
											db.collection("userlist").find({"dataAPITrackinglink" : true}).toArray((err, result)=>{
												if(result.length>1){
													result.forEach( function(element, index) {
														element.offerList.forEach( function(app, id) {
															var countryFix;
															if(app.countrySet.length>3){
																countryFix = app.countrySet.split("|").join(',');
															}else{
																countryFix = app.countrySet;
															}
															requestApi.textWrite += `http://${req.headers.host}/checkparameter/?offer_id=${app.index}&aff_id=${req.user.id}|${countryFix}|${app.platformSet.toUpperCase()}\r\n`;
														});
													});
												}
												fs.writeFile("OfferList.txt", requestApi.textWrite, (err)=>{
													if(err) throw err;
												});
												res.send("Successfully saved MongoDB data!");
											})
										}
									}
								})
							}catch(e){
								res.send("Error connect Database. Please retry!!!")
							}
							
						}
					}
				}
		})
	}
	RequestAPI.prototype.callRequestPost = (network, db, query) =>{
		try {
			request.post({
			    url: network.link
			}, function (err, respon) {
				countRequestAuto++;
				if(requestApi.loopOrder(respon, network)){
			   		requestApi.changeData(network, db, query, respon.body)
				}else{
					requestApi.callRequestPost(network, db, query);
				}
			});
		} catch(e) {
			requestApi.callRequestPost(network, db, query);
		}
	}
	RequestAPI.prototype.requetEmpty = (network, db) =>{
		var query = {
						"dataAPITrackinglink" : true
					}
		network.forEach((api, index)=>{
			if(api.custom){
				requestApi.countCustomInNetwork++;
				switch (api.method) {
					case "GET":
							requestApi.callRequestGet(api, db, query)
						break;
					case "POST":
							requestApi.callRequestPost(api, db, query)
						break;
				}
			}
		})
	}
	try{
		RequestAPI.prototype.findLinkAPI = (db) =>{
			let query = {
				"isNetwork" : true
			}
			db.collection("userlist").findOne(query, (err, result)=>{
				requestApi.requetEmpty(result.NetworkList, db)
			})
		}
		var query = {
			"idFacebook" : req.user.id
		}
		mongo.connect(pathMongodb,function(err,db){
			assert.equal(null,err);
				db.collection('userlist').findOne(query,function(err,result){
					if(result.admin){
						requestApi.findLinkAPI(db)
					}else{
						res.send("Mày đéo phải admin");
					}
				assert.equal(null,err);
			});
		});
	}catch(e){
		res.redirect("/")
		res.end();
	}
});

module.exports = router;
