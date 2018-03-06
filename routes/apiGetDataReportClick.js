var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
	if(req.user){
		try {
			function changeTime(data) {
				var date = data.split(" - ")[0].split(":").concat(data.split(" - ")[1].split("/"));
				return new Date(date[5], date[4]-1, date[3], date[0], date[1], date[2]).getTime();
			}
			function orderRes(val, condition) {
				var conditionDate;
				if(req.body.startDate!==""||req.body.endDate!==""){
					conditionDate = req.body.endDate>=changeTime(val.time)
								 && req.body.startDate<= changeTime(val.time);
				}else {
					conditionDate = true;
				}
				if(condition){
					return val.platfrom.toString().toLowerCase().indexOf(req.body.platform.toLowerCase())!==-1 
						&& val.country.toString().toLowerCase().indexOf(req.body.country.toLowerCase())!==-1
						&& val.name.toLowerCase().indexOf(req.body.member)!==-1
						&& (val.appName.toString().toLowerCase().indexOf(req.body.querySearch)!==-1 || val.idOffer.indexOf(req.body.querySearch)!==-1)
						&& conditionDate
				}else{
					return val.id == req.user.id
						&& val.platfrom.toString().toLowerCase().indexOf(req.body.platform.toLowerCase())!==-1 
						&& val.country.toString().toLowerCase().indexOf(req.body.country.toLowerCase())!==-1
						&& val.name.toString().toLowerCase().indexOf(req.body.member)!==-1
						&& (val.appName.toString().toLowerCase().indexOf(req.body.querySearch)!==-1 || val.idOffer.indexOf(req.body.querySearch)!==-1)
						&& conditionDate;
				}
			}
			function responseReportClick(condition) {
				var query = {
					"isReportClick": true
				}
				mongo.connect(pathMongodb,function(err,db){
					assert.equal(null,err);
						db.collection('userlist').findOne(query, (err,result)=>{
							var dataResponse = [];
							result.report.forEach(function(val, index) {
								if(orderRes(val, condition)){
									dataResponse.push(val)
								}
							});
							res.send(dataResponse.splice(req.body.countStart, 500))
						assert.equal(null,err);
						db.close();
					});
				});
			}
			var userRequest = {
				"idFacebook" : req.user.id
			}
			mongo.connect(pathMongodb, (err, db)=>{
				assert.equal(null, err);
					db.collection("userlist").findOne(userRequest, (err,result)=>{
						if(result.admin){
							responseReportClick(result.admin)
						}else {
							responseReportClick(result.admin)
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
