var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
	if(req.user){
		try {
			var query = {
				"isOfferCustom": true
			}
			var querySearchOffer = {
				"dataAPITrackinglink" : true
			}
			function updateDB(db) {
				var dataOffer = 0;
				db.collection('offer').find(querySearchOffer).toArray((err,resultOfferList)=>{
					if(!err){
						resultOfferList.forEach( function(list, index) {
							list.offerList.forEach( function(app, i) {
								if(dataOffer < app.index){
									dataOffer = app.index;
								}
							});
						});
						var dataSet;
						if(req.body.data !== undefined){
							req.body.data.forEach( function(element, index) {
								if(element.index===undefined){
									element.index = new Number(dataOffer)+1;
								}
							});
							dataSet = {
								$set : {
									offerList : req.body.data
								}
							}
						}else{
							dataSet = {
								$set : {
									offerList : []
								}
							}
						}
						db.collection('offer').updateOne(query, dataSet,(err,result)=>{
							if(!err){
								res.send(req.body)
							}else{

							}
						});
					}
				});
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
