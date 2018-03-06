var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
	if(req.user){
		try {
			var dataOffer;
			var query = {
				"isOfferCustom": true
			}
			var querySearchOffer = {
				"dataAPITrackinglink" : true
			}
			function updateDB(db) {
				db.collection('userlist').findOne(querySearchOffer, (err,resultOfferList)=>{
					if(!err){
						dataOffer = resultOfferList;
					}
				});
				var dataSet;
				if(req.body.data !== undefined){
					dataSet = {
						$set : {
							listOffer : req.body.data
						}
					}
				}else{
					dataSet = {
						$set : {
							listOffer : []
						}
					}
				}
				db.collection('userlist').updateOne(query, dataSet,(err,result)=>{
					if(!err){
						checkRequest(db);
					}else{

					}
				});
			}
			function saveAS(db){
				var dataSet = {
					$set: {
						offerList: dataOffer.offerList
					}
				}
				db.collection("userlist").updateOne(querySearchOffer, dataSet, (err, resultUpdate)=>{
					if(!err){
						res.send(req.body)
					}
				})
			}
			function checkRequest(db) {
				switch (req.body.method) {
					case "edit":
						db.collection('userlist').findOne(query, (err,result)=>{
							if(!err){
								var indexFix = dataOffer.offerList.length - result.listOffer.length + new Number(req.body.index);
								dataOffer.offerList[indexFix].offeridSet = req.body.data[req.body.index].offeridSet;
								dataOffer.offerList[indexFix].platformSet = req.body.data[req.body.index].platformSet;
								dataOffer.offerList[indexFix].imgSet = req.body.data[req.body.index].imgSet;
								dataOffer.offerList[indexFix].urlSet = req.body.data[req.body.index].urlSet;
								dataOffer.offerList[indexFix].paySet = req.body.data[req.body.index].paySet;
								dataOffer.offerList[indexFix].capSet = req.body.data[req.body.index].capSet;
								dataOffer.offerList[indexFix].countrySet = req.body.data[req.body.index].countrySet;
								dataOffer.offerList[indexFix].categorySet = req.body.data[req.body.index].categorySet;
								dataOffer.offerList[indexFix].offerType = req.body.data[req.body.index].offerType;
								dataOffer.offerList[indexFix].prevLink = req.body.data[req.body.index].prevLink;
								dataOffer.offerList[indexFix].descriptionSet = req.body.data[req.body.index].descriptionSet;
								dataOffer.offerList[indexFix].nameNetworkSet = req.body.data[req.body.index].nameNetworkSet;
								saveAS(db);
							}
						});
						break;
					case "add":
						db.collection("userlist").findOne(query,(err, result)=>{
							if(!err){
								if(result.listOffer.length>0){
									result.listOffer[result.listOffer.length-1].index = dataOffer.offerList.length;
									dataOffer.offerList.push(result.listOffer[result.listOffer.length-1]);
									saveAS(db)
								}
							}
						})
						break;
					case "delete":
						db.collection('userlist').findOne(query, (err,result)=>{
							if(result.listOffer){
								var indexDel = dataOffer.offerList.length-result.listOffer.length+new Number(req.body.index)-1;
								dataOffer.offerList.splice(indexDel, 1);
							}
							saveAS(db)
						});
						break;
				}
			}
			var userRequest = {
				"idFacebook" : req.user.id
			}
			mongo.connect(pathMongodb, (err, db)=>{
				assert.equal(null, err);
					db.collection("userlist").findOne(userRequest, (err,result)=>{
						if(result.admin){
						 updateDB(db)
						}else {
							res.redirect("/")
						}
					})
			})
		} catch(e) {
			console.log(e);
		}
	}else{
		res.redirect("/")
	}
});

module.exports = router;
