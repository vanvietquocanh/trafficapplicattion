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
			db.collection('userlist').find(query1).toArray((err, result)=>{
				var dataFilter = [];
				var dataArray = [];
				result.forEach( function(element, index) {
					element.offerList.forEach( function(el, i) {
						dataArray.push(el);
					});
				});
				for(var k = new Number(req.body.start); k < new Number(req.body.end); k++){
					if(dataArray[k]){
						dataFilter.push(dataArray[k])
					}else{
						break;
					}
				}
				var dataRes = {
					mes : true,
					admin  	 : {
						isMaster : (isAdmin.master||isAdmin.admin)?true:false,
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
			});
		});
	} catch(e) {
		res.redirect("/");
		res.end();
	}
});

module.exports = router;
