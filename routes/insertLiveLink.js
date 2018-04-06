var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

router.post('/:param', function(req, res, next) {
	if(req.params.param === "links"){
		try{
			var regexAndroid = /market|play.google.com/;
			var regexIOS = /itunes.apple.com/;
			var index = req.body.url.split("?offer_id=")[1].split("&")[0];
			console.log(index, req.body.url);
			var query = {
				"index" : Number(index),
			};
			mongo.connect(pathMongodb,function(err,db){
				var namedb = req.body.country.concat(req.body.os).split(/\r?\n|\r/)[0];
				assert.equal(null, err);
				console.log(query);
				db.collection("offer").findOne(query,(err, offer)=>{
					db.collection(namedb).find({isCount:true}).toArray((err, re)=>{
						if(re.length<1){
							db.collection(namedb).insertOne({isCount:true, count:0})
						}
						if(req.body.status === "success"){
							console.log(offer)
							if(regexAndroid.test(req.body.lead)&&regexAndroid.test(offer.prevLink)){
								if(req.body.lead.indexOf("id=")!==-1){
									if(req.body.lead.split("id=")[1].split(" ")[0].indexOf(offer.prevLink.split("id=")[1].split("&")[0])!==-1){
									}else{
										if(offer.prevLink.split("id=")[1].split("&")[0].indexOf(req.body.lead.split("id=")[1].split(" ")[0].split(".")[1])!==-1){

										}else{
											req.body.status = "fail";
										}
									};
								}
							}else if(regexIOS.test(offer.prevLink)&&regexIOS.test(req.body.lead)){
								if(req.body.lead.indexOf("id")!==-1){
									if(req.body.lead.split("id")[1].split("?")[0].indexOf(offer.prevLink.split("id")[1].split("&")[0])!==-1){
									}else{
										req.body.status = "fail";
									}
								}
							}else{
								req.body.status = "fail";
							}
						}
						console.log(req.body.lead);
						req.body.lead = req.body.lead.split(".");
						req.body.url = req.body.url.split(" ").join("&");
						req.body.dataOffer = offer;
						req.body.index = query.index;
						db.collection(namedb).updateOne(query, req.body, { upsert:true }, function(err,result){
								if(!err){
									res.send("ok");
									res.end();
								}
							assert.equal(null, err);
							db.close();
						});
					})
				})
			});
		}catch(e){
			res.send(e)
			res.end();
		}
	}
});

module.exports = router;
