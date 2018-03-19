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
		function preFixCountry(country1, country2){
			console.log();
			if (country2.split("|").length===2){
				return country1.trim().toLowerCase().indexOf(country2.split("|")[0]) !== -1
					|| country1.trim().toLowerCase().indexOf(country2.split("|")[1]) !== -1;		
			}else{
				return country1.trim().toLowerCase().indexOf(country2) !== -1;
			}
		}
		function responData(db, isAdmin) {
			db.collection('userlist').find(query1).toArray((err, result)=>{
				var dataFilter = [];
				result.forEach( function(app, index) {
					app.offerList.forEach( function(items, i) {
						if(items.platformSet.toLowerCase().indexOf(req.body.OS.toLowerCase())!==-1 && preFixCountry(items.countrySet, req.body.country)){
							dataFilter.push(items)
						}
					});
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