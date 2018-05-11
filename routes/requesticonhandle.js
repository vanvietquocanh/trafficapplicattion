var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
  	try {
  		if(req.user){
  			mongo.connect(pathMongodb, (err, db)=>{
  				db.collection("userlist").findOne({"idFacebook" : req.user.id}, (err, result)=>{
  					if(!err&&result){
  						if(result.admin){
  							try {
  								var query = {
  									imgSet : {
  										$not : new RegExp("(http(s?))\:\/\/", "i")
  									}
  								};
  								if(req.body.country){
  									query.countrySet = new RegExp(req.body.country, "i");
  								}
  								if(req.body.platform){
  									query.platformSet = new RegExp(req.body.platform, "i");
  								}
  								if(req.body.network){
  									query.nameNetworkSet = new RegExp(req.body.network, "i");
  								}
				  				db.collection("offer").find(query).toArray((err, result)=>{
					  				if(!err){
					  					console.log(result)
					  					res.send(result);
					  				}else {
					  					res.send("error");
					  				}
					  			})
				  			} catch(e) {
				  				res.send("error");
				  			}
  						}else{
							res.send("error");
  						}
  					}else{
						res.send("error");
  					}
  				})
  			})
  		}else{
  			res.send("fuck u :))");
  		}
	} catch(e) {
		res.send("error");
	}
});

module.exports = router;