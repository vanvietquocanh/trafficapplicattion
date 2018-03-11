var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:value', function(req, res, next) {
	if(req.params.value==="data"){
		try {
			var queryConversion = {
				"isConversion" : true
			}
			var queryClick = {
				"isReportClick": true
			}
			var offerList = {
				"dataAPITrackinglink" : true
			}
			var cvr = new CVR();
			function CVR(){
				this.conversion;
				this.listOffer;
				this.click;
				this.savedata = [];
				this.check = [];
			}
			CVR.prototype.connectMongo = function() {
				mongo.connect(pathMongodb, (err, db)=>{
					assert.equal(null, err);
					db.collection("userlist").findOne(offerList, (err, result)=>{
						if(!err){
							cvr.listOffer = result.offerList;
							db.collection("userlist").findOne(queryConversion, (err,result)=>{
								if(!err){
									cvr.conversion = result.conversion;
									db.collection("userlist").findOne(queryClick, (err, result)=>{
										if(!err){
											cvr.click = result.report;
											cvr.checkInConversion()
										}
										assert.equal(null,err);
										db.close();
									})
								}
							})
						}
					})					
				})
			};
			CVR.prototype.order = function(app, element){
 				return app.appName === element.appName
					 &&app.country === element.country
					 &&app.platform=== element.platform
					 &&app.idOfferNet=== element.idOfferNet
					 &&app.networkName === element.networkName;
			};
			CVR.prototype.orderLead = function(app, element){
				return app.appName === element.nameSet
					&& app.idOfferNet === element.offeridSet
					&& app.country === element.countrySet
					&& app.platfrom === element.platformSet
					&& app.networkName === element.nameNetworkSet
			};
			CVR.prototype.checkReplace = function(data) {
				var arrayValue = [];
				var arrayCheck = [];
				for(var j = 0; j < data.length; j++){
					var countCVR = 0;
					if(arrayCheck.length>0){
						if(cvr.order(data[j],arrayCheck[arrayCheck.length-1])){
						}else{
							arrayCheck.push(data[j])
						}
					}else{
						arrayCheck.push(data[j])
					}
					for(var i =0; i < data.length; i++){
						if(cvr.order(data[i],arrayCheck[arrayCheck.length-1])){
							countCVR++;
						}
					}
					arrayCheck[arrayCheck.length-1].cvr = parseFloat(Math.round(countCVR/arrayCheck[arrayCheck.length-1].click*100000)/1000)+"%";
					if(j===data.length-1){
						cvr.checkLinkApp(arrayCheck)
					}
				}
			};
			CVR.prototype.checkLinkApp = function(data) {
				var dataResponClient = [];
				data.forEach( function(element, index) {
					cvr.listOffer.forEach( function(ele, i) {
						if(cvr.orderLead(element,ele)){
							element.link = `https://${req.headers.host}//checkparameter/?offer_id=${i}&aff_id={FacebookID}`
							dataResponClient.push(element)
						}
					});
				});
				res.send(dataResponClient)
			};
			CVR.prototype.checkInConversion = function(){
				var data = cvr.conversion;
				data.forEach( function(element, index) {
					var count = 0;
					cvr.click.forEach( function(click, index) {
						if(click.appName===element.appName&&click.idOfferNet===element.idOfferNet&&click.platfrom===element.platfrom&&click.networkName===element.networkName&&click.country===element.country){
							count++;
						}
					});
					data[index].click = count;
				});
				cvr.checkReplace(data)
			}
			cvr.connectMongo();
		} catch(e) {
			console.log(e);
		}
	}
});

module.exports = router;
