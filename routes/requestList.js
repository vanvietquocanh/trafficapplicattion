var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");


/* GET home page. */
router.post('/', function(req, res, next) {
	function order(ele) {
		if("query" in req.body){
			if(isNaN(req.body.query)){
				return ele.app.nameSet.toLowerCase().indexOf(req.body.query)!==-1;
			}else{
				return ele.app.index.indexOf(req.body.query)!==-1;
			}
		}else{
			return  ele.app.countrySet.indexOf(req.body.filterCountry)!==1
				 && ele.app.platformSet.indexOf(req.body.filterPlatform)!==-1
				 && ele.name.indexOf(req.body.filterName)!==-1;
		}
	}
	try {
		if(req.user){
			var query = {
				"idFacebook": req.user.id
					}
				mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
					db.collection('userlist').findOne(query,function(err,result){
						if(result.admin){
							let queryRequest = {
								$or: [{"member" : true}, {"master":true}]
							}
							var data = [];
							db.collection('userlist').find(queryRequest).toArray((err, result)=> {
								result.forEach(function(element, index) {
									if(element.request!==undefined&&element.request.length>0){
										element.request.forEach( function(ele, i) {
											if(req.body.start<=i&&req.body.end>i){
												if(order(ele)){
													data.push(ele)
												}

											}
										});
									}else{
										data = [];
									}
								});	
								var dataRes = {
									mes : true,
									data: data
								}
								res.send(dataRes)
								assert.equal(null,err);
								db.close();
							});
						}else{
							res.redirect("/")
						}
						assert.equal(null,err);
						db.close();
					});
			});
		}else{
			res.redirect("/")
		}
	} catch(e) {
		console.log(e);
	}
});

module.exports = router;
