var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
var geoip = require('geoip-lite');
var MobileDetect = require('mobile-detect');
var fetch = require("node-fetch");
var index = 0;
var reguAli = /alibaba/i;
var lead = /market|play.google.com|itunes.apple.com/i;

const pathMongodb = require("./pathDb");

/* GET home page. */
function redirect(db, query, res, req) {
	var arr = [];
	var dbname = query.country.toLowerCase()+query.platform.toLowerCase();
	db.collection(dbname).find({"status" : "success"}).toArray((err, result)=>{
		if(!err){
			if(result.length===0){
				res.send("NO MORE OFFERS FROM THIS COUNTRY....")
			}else{
				db.collection(dbname).findOne({isCount: true}, (err, countValue)=>{
					
					var path = `http://rockettraffic.org/checkparameter/?offer_id=${result[countValue.count%result.length].index}&aff_id=181879769070526`;
					db.collection(dbname).updateOne({isCount:true},{$set:{isCount:true, count: countValue.count+1}});
					res.redirect(path);
				})
			}
		}
	})
}
router.get('/:parameter', function(req, res, next) {
	if(req.params.parameter === "request"){
		var geo = geoip.lookup(req.headers["x-real-ip"]).country;
		var md = new MobileDetect(req.headers["user-agent"]);
		mongo.connect(pathMongodb,(err,db)=>{
			var query = {};
			query.statusLead = true;
			query.country = geo;
			if(md.os() === "AndroidOS"){
				query.platform = "android";
				redirect(db, query, res)
			}else if(md.os() === "iOS"){
				query.platform = "ios";
				redirect(db, query, res, req)
			}else{
				res.send("error")
			}
		})
	}
});

module.exports = router;