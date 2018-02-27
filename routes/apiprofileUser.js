var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');


const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
	if(req.user){
		try{
				var query = {
					"isConversion": true
 				}
			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
					db.collection('userlist').findOne(query,function(err,result){
						result.user = req.user.id;
						console.log(result)
						res.send(result)	
					assert.equal(null,err);
					db.close();
					});
			});
		}catch(e){
			res.redirect("/")
			res.end();
		}
	}else{
		res.redirect("/")
		res.end();
	}
});

module.exports = router;
