var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

router.get('/:parameter', function(req, res, next) {
	if(req.params.parameter==="eventdata"&&req.query.transaction_id!==undefined){
		try {
			function savePostback(data, db) {
				let queryConversion = {
					"isConversion" : true
				}
				let dataUpdate = {
					$push : {
						"conversion" : data[0]
					}
				};
				console.log(data)
				db.collection("userlist").updateOne(queryConversion,dataUpdate, (err, result)=>{
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
					db.collection('userlist').findOne(query, (err,result)=>{
						var search = result.report.filter(function(item) {
							return item.key === req.query.transaction_id;
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
