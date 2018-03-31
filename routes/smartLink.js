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
function redirect(db, query, res) {
	var arr = [];
	db.collection("offerLead").find(query).toArray((err, result)=>{
		if(!err){
			if(result.length===0){
				res.send("error")
			}else{
				result.forEach( function(element, index) {
					if(element.countRequest!==undefined){
						// res.redirect(`http://rockettraffic.org/checkparameter/?offer_id=${result[result.length-1].index}&aff_id=181879769070526`);
					}
				});
			}
		}
	})
}
// function converPost(result, query, db) {
// 	var ele = result[index];
// 	var data = {
// 		"Url"	   : `http://rockettraffic.org/checkparameter/?offer_id=${ele.index}&aff_id=181879769070526`,
// 		"Os"	   : ele.platform,
// 		"Country"  : ele.country,
// 		"User"	   : "vanvietquocanh",
// 		"Pass"	   : "aksjdhqwlwrhoqihewna",
// 		"Ipaddress": "128.199.163.213"
// 	};
// 	fetch('http://159.89.206.69:5000/api/Offer', { 
// 	    method : 'POST',
// 	    body   :    JSON.stringify(data),
// 	    headers: { 
// 	    	'Content-Type': 'application/json'
// 	    },
// 	})
// 	.then(response => response.json())
// 	.then(json => {
// 		callBack(json, ele)
// 	});
// }
// function callBack(json, ele) {
// 	console.log(json.message, ele.index);
// 	if(!reguAli.test(json.message)&&lead.test(json.message)){
// 		res.redirect(`http://rockettraffic.org/checkparameter/?offer_id=${ele.index}&aff_id=181879769070526`);
// 		res.end();
// 	}else{
// 		index++;
// 		converPost(result, query, db);
// 	}
// }
router.get('/:parameter', function(req, res, next) {
	if(req.params.parameter === "request"){
		var geo = geoip.lookup(req.headers["x-real-ip"]).country;
		var md = new MobileDetect(req.headers["user-agent"]);
		mongo.connect(pathMongodb,(err,db)=>{
			var query = {};
			query.statusLead = true;
			query.country = new RegExp(geo, "i");
			if(md.os() === "AndroidOS"){
				query.platform = new RegExp("android", "i");
				redirect(db, query, res)
			}else if(md.os() === "iOS"){
				query.platform = new RegExp("ios", "i");
				redirect(db, query, res)
			}else{
				res.send("error")
			}
		})
	}
});

module.exports = router;