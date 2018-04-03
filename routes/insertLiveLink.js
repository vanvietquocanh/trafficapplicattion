var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

router.post('/:param', function(req, res, next) {
	if(req.params.param === "links"){
		try{
			var query = {
				"index" : req.body.url.split("?offer_id=")[1].split("&")[0],
			};
			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null, err);
					db.collection(`${req.body.os}${req.body.country}`).findOne({isCount:true},(err, re)=>{
						if(!re){
							db.collection(`${req.body.os}${req.body.country}`).insertOne({isCount:true, count:0})
						}
						db.collection(`${req.body.os}${req.body.country}`).updateOne(query, req.body, { upsert:true }, function(err,result){
								if(!err){
									res.send("ok");
									res.end();
								}
							assert.equal(null, err);
							db.close();
						});
					})
			});
		}catch(e){
			res.send(e)
			res.end();
		}
	}
});

module.exports = router;
