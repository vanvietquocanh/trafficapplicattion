var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:parameter', function(req, res, next) {
	if(req.params.parameter==="live"){
		mongo.connect(pathMongodb,(err,db)=>{
			db.collection("offerLead").find().toArray((err, result)=>{
				if(!err){
					res.send(result)
				}
			})
		})
	}
});

module.exports = router;
