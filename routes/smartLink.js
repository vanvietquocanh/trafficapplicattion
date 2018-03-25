var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
const country = require('./country').toString().split(",");
const request = require("request");

const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:value', function(req, res, next) {
	if(req.params.value === "links"&&req.query.country!== undefined&&req.query.platform!==undefined){
		if(country.indexOf(req.query.country!==-1)){
			try {
				var query = {
					"dataAPITrackinglink" : true
				}
				var arrayCountry = [];
				var dataCheck = [];
				mongo.connect(pathMongodb,function(err,db){
					assert.equal(null,err);
					db.collection('userlist').find(query).toArray((err, result)=> {
						result.forEach( function(element, index) {
							element.offerList.forEach( function(el, i) {
								if(el.countrySet.indexOf(req.query.country.toUpperCase())!==-1){
									arrayCountry.push(el)
								};
							});
						});
						if(arrayCountry.length>0){
							arrayCountry.forEach( function(element, index) {
								if(element.platformSet.toLowerCase() === req.query.platform.toLowerCase()){
									dataCheck.push(element)
								};
							});
							if(dataCheck.length>0){
								var i = 0;
								function testLead() {
									var opts = {
										url : 'http://159.89.206.69:5000/api/Offer',
										headers : {
											'content-type': 'application/json'
										},
										data: {
											"Url"     : `http://${req.headers.host}/checkparameter/?offer_id=${dataCheck[i].index}&aff_id=181879769070526`,
											"Os"      : `${dataCheck[i].platformSet}`,
											"Country" : `${req.query.country}`,
											"User"    : "vanvietquocanh",
	  										"Pass"    : "0985142073"
										}
									};
									request.post(opts,(err, res, body)=>{
										console.log(err, res, body)
										// i++;
										// testLead()
									});
								}
								testLead();
							}
						}
					});
				});
			} catch(e) {
				res.redirect("/");
				res.end();
			}
		}else{
			res.redirect("/");
		}
	}else{
		res.redirect("/");
	}
});

module.exports = router;