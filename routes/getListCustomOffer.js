var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
	if(req.user){
		try {
			function orderRes(val) {
				return val.platformSet.toLowerCase().indexOf(req.body.filter.platform.toLowerCase())!==-1 
					&& val.countrySet.toLowerCase().indexOf(req.body.filter.country.toLowerCase())!==-1
					&& val.nameSet.toLowerCase().indexOf(req.body.search)!==-1
			}
			function responseReportClick(db) {
				var query = {
					"isOfferCustom": true
				}
				db.collection('offer').findOne(query, (err,result)=>{
					var dataResponse = [];
					if(result!==null&&result.offerList.length>0){
						result.offerList.forEach(function(val, index) {
							if(orderRes(val)){
								dataResponse.push(val)
							}
						});
						res.send(dataResponse.splice(req.body.start, 500))
					}else{
						res.send("")
					}
					assert.equal(null,err);
					db.close();
				});
			}
			var userRequest = {
				"idFacebook" : req.user.id
			}
			mongo.connect(pathMongodb, (err, db)=>{
				assert.equal(null, err);
					db.collection("userlist").findOne(userRequest, (err,result)=>{
						if(result.admin){
							responseReportClick(db)
						}else {
							res.redirect("/")
						}
					})
			})
		} catch(e) {
			console.log(e);
		}
	}else{
		res.redirect("/")
	}
});

module.exports = router;
