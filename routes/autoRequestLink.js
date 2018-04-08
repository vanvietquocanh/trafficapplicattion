var express = require('express');
var router = express.Router();
var request = require("request");
const mongo = require('mongodb');
const assert = require('assert');
const fs = require("fs");

const pathMongodb = require("./pathDb");


router.post('/', function(req, res, next) {
	req.io.sockets.emit("offerlive123", "hello123");
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
		this.arIndexDel = [];
		this.allNetwork;
		this.dataSave = [];
		this.countRequest = 0;
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
	RequestAPI.prototype.callRequestGet = (network, db) =>{
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
			requestApi.callRequestGet(network, db);
		}
	}
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
			if(result!==undefined){
				result.forEach( function(element, index) {
					var countryFix;
					if(element.countrySet.length>3){
						countryFix = element.countrySet.split("|").join(',');
					}else{
						countryFix = element.countrySet;
					}
					requestApi.textWrite += `http://${req.headers.host}/checkparameter/?offer_id=${element.index}&aff_id=${req.user.id}|${countryFix}|${element.platformSet.toUpperCase()}\r\n`;
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
					requestApi.writeFileText(db);
					db.collection("offerTest").drop();
				}
			})									
		}else{
			res.send("No Change");
		}
	};
	RequestAPI.prototype.checkduplicate = function(db, query, newData, index) {
		db.collection("offer").find(query).toArray((err, data)=>{
			db.collection("offerTest").createIndex({"offeridSet" : 1}, {unique: true}, err=>{
				db.collection("offerTest").insertMany(data, err=>{
					db.collection("offerTest").insertMany(newData, (err, result)=>{
						db.collection("offerTest").find().skip(data.length).toArray((err,result)=>{
							requestApi.insertNewDB(db, result, index)
						})
					})
				})
			});
		})	
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
	RequestAPI.prototype.callRequestPost = (network, db) =>{
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
			requestApi.callRequestPost(network, db);
		}
	}
	RequestAPI.prototype.requetEmpty = (network, db) =>{
		if(network[req.body.index].custom.data!==undefined){
			requestApi.lengthOfNet++;
			switch (network[req.body.index].method) {
				case "GET":
						requestApi.callRequestGet(network[req.body.index], db)
					break;
				case "POST":
						requestApi.callRequestPost(network[req.body.index], db)
					break;
			}
		}
	}
	try{
		RequestAPI.prototype.findLinkAPI = (db) =>{
			let query = {
				"isNetwork" : true
			}
			db.collection("network").findOne(query, (err, result)=>{
				requestApi.allNetwork = result.NetworkList;
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
						requestApi.findLinkAPI(db);
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