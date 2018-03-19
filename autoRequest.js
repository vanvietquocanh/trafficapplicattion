var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
const request = require("request");

const pathMongodb = require("./routes/pathDb");
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
	RequestAPI.prototype.callRequestGet = (network, db) =>{
		try {
			request.get({
			    url: network.link
			}, function (err, respon) {
				if(requestApi.loopOrder(respon, network)){
			   		requestApi.changeData(network, db, respon.body)
				}else{
					requestApi.callRequestGet(network, db);
				}
			});
		} catch(e) {
			requestApi.callRequestGet(network, db);
		}
	}
	RequestAPI.prototype.changeData = (network, db, respon) =>{
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
				// fs.writeFile("OfferList.txt", requestApi.textWrite, (err)=>{
				// 	if(err) throw err;
				// });
			    try{
					var dataSave = {
						""
			    		"offerList": requestApi.arrayDadaPushToDatabase 
			    	}
					db.collection('userlist').insertOne(dataSave,(err,result)=>{
						if(!err){
							assert.equal(null,err);
							db.close();
							res.send("Successfully saved MongoDB data!");
						};
					})
				}catch(e){
					assert.equal(null,err);
					db.close();
					res.send("Error connect Database. Please retry!!!")
				}
			}

		}
	}
	RequestAPI.prototype.callRequestPost = (network, db) =>{
		try {
			request.post({
			    url: network.link
			}, function (err, respon) {
				countRequestAuto++;
				if(requestApi.loopOrder(respon, network)){
			   		requestApi.changeData(network, db, respon.body)
				}else{
					requestApi.callRequestPost(network, db);
				}
			});
		} catch(e) {
			requestApi.callRequestPost(network, db);
		}
	}
	RequestAPI.prototype.requetEmpty = (network ,db) =>{
		if(!err){
			network.forEach((api, index)=>{
				if(api.custom){
					requestApi.countCustomInNetwork++;
					switch (api.method) {
						case "GET":
								requestApi.callRequestGet(api, db)
							break;
						case "POST":
								requestApi.callRequestPost(api, db)
							break;
					}
				}
			})
		}
	}
	try{
		RequestAPI.prototype.findLinkAPI = () =>{
			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
					let query = {
						"isNetwork" : true
					}
				db.collection("userlist").findOne(query, (err, result)=>{
					requestApi.requetEmpty(result.NetworkList, db)
				})
			});
		}
	}catch(e){
		res.redirect("/")
		res.end();
	}

module.exports = requestAuto;