var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:parameter', function(req, res, next) {
	if(req.params.parameter==="live"&&req.query.country!==undefined&&req.query.platform!==undefined){
		mongo.connect(pathMongodb,(err,db)=>{
			var query = {};
			var skip = 0;
			query.status = "success";
			if(req.query.start !== undefined&&Number(req.query.start)!==NaN){
				skip = Number(req.query.start);
			}
			if(req.query.network!== undefined){
				query[`dataOffer.nameNetworkSet`] = req.query.network;
			}
			db.collection(req.query.country+req.query.platform).find(query).skip(skip).limit(500).toArray((err, result)=>{
				if(!err){
					res.send(result);
				}
			})
		})
	}else{
		res.redirect("/")
	}
});

module.exports = router;
