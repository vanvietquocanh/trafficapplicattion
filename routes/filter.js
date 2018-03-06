var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');


const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
	try {
		var query1 = {
			"dataAPITrackinglink" : true
		}
		function responData(db, isAdmin) {
			db.collection('userlist').findOne(query1,(err, result)=>{
				var dataFilter = [];
				result.offerList.forEach( function(items, index) {
					if(items.platformSet.toLowerCase().indexOf(req.body.OS.toLowerCase())!==-1 && items.countrySet.toLowerCase().indexOf(req.body.country)!== -1&&index>=req.body.start&&index<req.body.end){
						items.index = index;
						dataFilter.push(items)
					}
				});
				var dataRes = {
					admin  	 : {
						isAdmin  : isAdmin.admin,
						isID 	 : isAdmin.idFacebook,
						pending  : isAdmin.request,
						approved : isAdmin.approved
					},
					offerList: dataFilter
				}
				res.send(dataRes)
			})
		}
		var query = {
			"idFacebook" : req.user.id
		}
		mongo.connect(pathMongodb,function(err,db){
			assert.equal(null,err);
				db.collection('userlist').findOne(query, function(err,result){
					// if(result.admin){
						responData(db,result)
					// }
				assert.equal(null,err);
				db.close();
			});
		});
	} catch(e) {
		res.redirect("/");
		res.end();
	}
});

module.exports = router;