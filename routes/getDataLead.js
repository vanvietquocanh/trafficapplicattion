var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:parameter', function(req, res, next) {
	if(req.params.parameter==="live"){
		mongo.connect(pathMongodb,(err,db)=>{
			var query = {};
			query.statusLead = true;
			if(req.query.platform !== undefined&& req.query.platform != null){
				query.platform = new RegExp(req.query.platform, "i");
			}
			if(req.query.country !== undefined && req.query.country != null){
				query.country = new RegExp(req.query.country, "i");
			}
			db.collection("offerLead").find(query).toArray((err, result)=>{
				if(!err){
					res.send(result);
				}
			})
		})
	}
});

module.exports = router;
