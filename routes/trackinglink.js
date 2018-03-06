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
				result.offerList.forEach( function(element, index) {
					if(req.body.start<=index&&req.body.end>index){
						dataFilter.push(element)
					}
				});
				var dataRes = {
					mes : true,
					admin  	 : {
						isMaster : isAdmin.master,
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
					responData(db,result)
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
