var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
const country = require("./country");

var platform = ["android", "ios"];

const pathMongodb = require("./pathDb");

router.post('/:param', function(req, res, next) {
	var query = {
		"idFacebook" : req.user.id
	}
	try{
		mongo.connect(pathMongodb, (err, db)=>{
			if(req.params.param === "liveoffer"){
				db.collection("userlist").findOne(query, (err, result)=>{
					if(!err){
						var count = 0;
						if(result.admin){
							country.forEach( function(element, index) {
								platform.forEach( function(os, index) {
									db.collection(element+os).drop((err,result)=>{
										if(!err){
											count++;
										}
									});
								});
								if(country.length*2 === count){
									res.send("ok");
								}
							});
						}else{
							res.send("error")
						}
					}else{
						res.send("error")
					}
				})
			}else if(req.params.param === "alloffer"){
				db.collection("offer").drop((err, result)=>{
					if(!err){
						res.send("ok")
					}else{
						res.send(err)
					}
				});
			}else{
				res.redirect("/")
			}
		})
	}catch(e){
		res.send(e)
		res.end();
	}
});

module.exports = router;
