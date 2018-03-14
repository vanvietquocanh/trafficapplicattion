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
		this.itemLead = 0;
		this.arrayDadaPushToDatabase = [];
		this.textWrite = "";
		this.lengthArray = 0;
	}
	RequestAPI.prototype.loopOrder = function(respon, network) {
		var value;
		network.custom.data.split(",").forEach( function(element, index) {
			if(typeof JSON.parse(respon.body)[`${element}`] !== "Array"&&JSON.parse(respon.body)[`${element}`].length>0){
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
	RequestAPI.prototype.changeData = (network, db, query, respon) =>{
		if(respon!==undefined){
			requestApi.countRequest++;
			var data = JSON.parse(respon);
			var dataChecker = data;
			requestApi.lengthArray += data.length;
			for(let i = 0; i < network.custom.data.split(",").length; i++){
				dataChecker = dataChecker[`${network.custom.data.split(",")[i].trim()}`];
			}
			for(let z = 0; z < dataChecker.length; z++){
				// let dataNew = new Object();
				// dataNew.nameNetworkSet = network.name;
				// dataNew.index = z;
				dataChecker[z].nameNetworkSet = network.name;
				dataChecker[z].index = requestApi.itemLead;
				for(var j = 1; j < Object.keys(network.custom).length; j++){
					// dataNew[`${Object.keys(network.custom)[j].trim()}`] = dataChecker[z][`${network.custom[Object.keys(network.custom)[j]].trim()}`];
					dataChecker[z][`${Object.keys(network.custom)[j].trim()}`] = dataChecker[z][`${network.custom[Object.keys(network.custom)[j]].trim()}`];
					delete dataChecker[z][`${network.custom[Object.keys(network.custom)[j]].trim()}`];
				}
				requestApi.textWrite+= `https://${req.headers.host}/checkparameter/?offer_id=${z}&aff_id=${req.user.id}|${dataChecker[z].countrySet}|${dataChecker[z].platformSet.toUpperCase()}\r\n`;
				requestApi.arrayDadaPushToDatabase.push(dataChecker[z])
				requestApi.itemLead ++;
			}//this is loop change keys of value;
			if(requestApi.countRequest===requestApi.countCustomInNetwork){
				db.collection("userlist").findOne({"isOfferCustom":true}, (err, result)=>{
					if(result.listOffer!==null){
						result.listOffer.forEach( function(element, index) {
							requestApi.textWrite+= `https://${req.headers.host}/checkparameter/?offer_id=${requestApi.arrayDadaPushToDatabase.length}&aff_id=${req.user.id}|${element.countrySet}|${element.platformSet.toUpperCase()}\r\n`;
							element.index = requestApi.itemLead;
							requestApi.arrayDadaPushToDatabase.push(element);
							requestApi.itemLead++;
						});
					}
					fs.writeFile("OfferList.txt", requestApi.textWrite, (err)=>{
						if(err) throw err;
					});
				    try{
						var dataSave = {
				    		$set:{
				    			"offerList": requestApi.arrayDadaPushToDatabase 
				    		}
				    	}
						db.collection('userlist').updateOne(query,dataSave,{upsert: true},(err,result)=>{
							if(!err){
								res.send("Successfully saved MongoDB data!");
							}
						})
						mongo.connect(pathMongodb,function(err,db){
							assert.equal(null,err);
						});	
					}catch(e){
						res.send("Error connect Database. Please retry!!!")
					}
				})
			}
		}
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
	RequestAPI.prototype.requetEmpty = (network) =>{
		var query = {
						"dataAPITrackinglink" : true
					}
		var reset = {
			$set : {
				"offerList" : []
			}
		}
		mongo.connect(pathMongodb,function(err,db){
			assert.equal(null,err);
			db.collection("userlist").updateOne(query, reset, (err, result)=>{
				if(!err){
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
			})
		})
	}
	try{
		RequestAPI.prototype.findLinkAPI = (db) =>{
			let query = {
				"isNetwork" : true
			}
			db.collection("userlist").findOne(query, (err, result)=>{
				requestApi.requetEmpty(result.NetworkList)
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
				db.close();
			});
		});
	}catch(e){
		res.redirect("/")
		res.end();
	}
});

module.exports = router;
