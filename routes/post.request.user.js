var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');


const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
	
	  	try {
 			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
						console.log(req.body)
						db.collection("useradd").findOne(req.body, (err, result)=>{
							if(result){
								res.send(true)
							}else{
								res.send(false)
							}
						})				
					
					assert.equal(null,err);
					db.close();
				});
		} catch(e) {
			res.redirect("/")
		}
});

module.exports = router;
