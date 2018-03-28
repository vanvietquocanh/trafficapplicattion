var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
const country = require('./country');
const fetch = require("node-fetch");

const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:value', function(req, res, next) {
	if(req.params.value === "links"){
		try {
			var indexKey = 0;
			var indexOfArr = 0;
			var count = 0;
			var keyCheck = [];
			var dataSave = [];
			var start = 0;
			var end = 5;
			var dataAllOffer = [];
			var arrayCountry = [];
			var dataCheck = {};
			var query = {
				"dataAPITrackinglink" : true
			}
			function converPost(ele) {
				var data = {
					"Url"	   : `http://${req.headers.host}/checkparameter/?offer_id=${ele.data.index}&aff_id=181879769070526`,
					"Os"	   : ele.data.platformSet,
					"Country"  : ele.data.countrySet,
					"User"	   : "vanvietquocanh",
					"Pass"	   : "aksjdhqwlwrhoqihewna",
					"Ipaddress": "159.89.206.69"
				};
				fetch('http://159.89.206.69:5000/api/Offer', { 
				    method : 'POST',
				    body   :    JSON.stringify(data),
				    headers: { 
				    	'Content-Type': 'application/json'
				    },
				})
				.then(res => res.json())
				.then(json => {
					callback(json)
				});
			}
			function callback(data) {
				console.log(data)
				dataSave.push(data);
				if(dataSave.length%5===0){
					indexKey++;
					console.log(indexKey, keyCheck.length, indexKey%keyCheck.length);
					if(indexKey%keyCheck.length!==0){
						indexKey = 0;
						start+=5;
						end+=5;
					}
				}
				loopFive(dataCheck[keyCheck[indexKey]])
			}
			function loopFive(array){
				array.splice(start%array.length, end%array.length).forEach( function(element, index) {
					converPost(element)
				});
			}
			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
				db.collection('offer').find(query).toArray((err, result)=> {
					result.forEach( function(element, index) {
						element.offerList.forEach( function(el, i) {
							dataAllOffer.push(el)
						});
					}); 
					dataAllOffer.forEach( function(element, index) {
						country.forEach( function(countryCode, ind) {
							if(element.countrySet.indexOf(countryCode.toUpperCase())!==-1&&arrayCountry.indexOf(index)){
								dataAllOffer[index].countrySet = countryCode.toLowerCase();
								arrayCountry.push(element)
							};
						});
					});
					arrayCountry.forEach( function(element, index) {
						if(dataCheck[`${element.countrySet}-${element.platformSet}`]===undefined){
							dataCheck[`${element.countrySet}-${element.platformSet}`] = [];
						}	
						dataCheck[`${element.countrySet}-${element.platformSet}`].push({
							"isCheckLead" : true,
							"count"       : 0,
							"data"  	  : element
						})
					});
					for (let i = 0; i < Object.keys(dataCheck).length; i++) {
						keyCheck.push(Object.keys(dataCheck)[i]);
					}
					loopFive(dataCheck[keyCheck[indexKey]])
				});
			});
		} catch(e) {
			res.redirect("/");
			res.end();
		}
	}else{
		res.redirect("/");
	}
});

module.exports = router;