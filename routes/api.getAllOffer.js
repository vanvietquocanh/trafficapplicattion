var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
const fs = require("fs");
const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:value', function(req, res, next) {
	try{
		if(req.params.value==="get"&&req.query.platform!==undefined){
			var query = {};
			if(req.body.platform){
				query.platformSet = req.query.platform.toLowerCase();
			}
			if(req.body.netWork){
				query.nameNetworkSet = new RegExp(req.body.netWork,"i");
			}
			mongo.connect(pathMongodb, (err, db)=>{
				db.collection('offer').find(query).toArray((err, result)=>{
					if(!err){
						db.close();
						res.send(result)
					}
				})
			})
		}
	} catch(e) {
		res.redirect("/");
		res.end();
	}
});

module.exports = router;