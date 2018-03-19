var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

router.get('/:parameter', function(req, res, next) {
	if(req.params.parameter==="eventdata"&&req.query.transaction_id!==undefined){
		try {
			function savePostback(data, db) {
				let dataConversion = {
					"isConversion" : true,
					"seconds"	   : new Date().getTime(),
					"conversion"   : data
				}
				db.collection("userlist").insertOne(dataConversion, (err, result)=>{
						if(!err){
							res.send(JSON.stringify({"message": "Ok!"}))
						}
					assert.equal(null,err);
					db.close();
				})
			}
			var query = {
				"isReportClick" : true
			}
			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
					db.collection('userlist').find(query).toArray((err,result)=>{
						var dataResponse = [];
						result.forEach( function(element, index) {
							if(element.report.length!==undefined){
								element.report.forEach( function(click, i) {	
									dataResponse.push(click)
								});
							}else{
								dataResponse.push(element.report)
							}
						});
						var search = dataResponse.filter(function(item) {
							return item.key.trim() === req.query.transaction_id.trim();
						});
						if(search.length>0){
							savePostback(search, db)
						}
				});
			});
		} catch(e) {
			console.log(e);
		}
	}else{
		res.end();
	}
});

module.exports = router;
