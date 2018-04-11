var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
var assert = require("assert")
const pathMongodb = require("./pathDb");


/* GET home page. */
router.get('/', function(req, res, next) {
	try {
		var query = {
			isNetwork : true
		}
		mongo.connect(pathMongodb,function(err,db){
			assert.equal(null,err);
				db.collection('network').findOne(query,function(err,result){
					if(!err){
						var dataRes = []
						result.NetworkList.forEach( function(element, index) {
							if(dataRes.indexOf(element.name)===-1){
								dataRes.push(element.name)							
							}
						});
						res.send(dataRes.toString())
					}
				assert.equal(null,err);
				db.close();
				});
		});
	} catch(e) {
		res.send(e);
	}	
});

module.exports = router;
