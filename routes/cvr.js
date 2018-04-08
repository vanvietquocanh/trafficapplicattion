var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:value', function(req, res, next) {
	if(req.params.value==="cvr"){
		try {
			var cvr = new CVR();
			function CVR(){
				this.conversion = [];
				this.listOffer = [];
				this.click = [];
				this.savedata = [];
				this.check = [];
			}
			CVR.prototype.connectMongo = function() {
				mongo.connect(pathMongodb, (err, db)=>{
					assert.equal(null, err);
					db.collection("offer").find().toArray((err, result)=>{
						if(!err){
							result.forEach(function(element, index) {
								cvr.listOffer.push(element)
							});
							db.collection("conversion").find().toArray((err,result)=>{
								if(!err){
									result.forEach(function(element, index) {
										cvr.conversion.push(element)
									});
									db.collection("report").find().toArray((err, result)=>{
										if(!err){
											result.forEach(function(element, index) {
												cvr.click.push(element)
											});
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
					if(arrayCheck[arrayCheck.length-1].click!==0){
						var cvrNumber = parseFloat(countCVR/arrayCheck[arrayCheck.length-1].click*100);
						cvrNumber = Math.round(cvrNumber*100)/100;
						arrayCheck[arrayCheck.length-1].cvr = cvrNumber+"%";
						arrayValue.push(arrayCheck[arrayCheck.length-1])
					}
					if(j===data.length-1){
						cvr.checkLinkApp(arrayValue)
					}
				}
			};
			CVR.prototype.unique = function(value, index, self) {
				return self.indexOf(value) === index;
			};
			CVR.prototype.checkLinkApp = function(data) {
				var dataCheckClick = [];
				data.forEach(function(element, index) {
					cvr.listOffer.forEach( function(ele, i) {
						if(cvr.orderLead(element,ele)){
							element.link = `https://${req.headers.host}/checkparameter/?offer_id=${i}&aff_id={FacebookID}`
							dataCheckClick.push(element);
						}
					});
				});
				var unique = dataCheckClick.filter(cvr.unique);
				res.send(unique);
			};
			CVR.prototype.checkInConversion = function(){
				cvr.conversion.forEach( function(element, index) {
					var count = 0;
					cvr.click.forEach( function(click, index) {
						if(click.appName===element.appName&&click.idOffer===element.idOffer&&click.platfrom===element.platfrom&&click.networkName===element.networkName){
							count++;
						}
					});
					cvr.conversion[index].click = count;
				});
				cvr.checkReplace(cvr.conversion)
			}
			cvr.connectMongo();
		} catch(e) {
			console.log(e);
		}
	}else{
		res.send("error")
	}
});

module.exports = router;
