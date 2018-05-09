var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

router.get('/:value', function(req, res, next) {
	if(req.params.value === "api"){
		mongo.connect(pathMongodb,(err,db)=>{
			if(req.body){
				db.collection(req.query.platform).findOne(req.body ,(err,result)=>{
					if(!err){
						if(result){
							res.send(result);
						}else{
							res.send("Sorry this application has not been updated by us");
						}
					}
				})
			}else{
				res.send("error")
			}
		})
	}else{
		res.send("error");
	}
});

module.exports = router;
