var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');

const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/:value', function(req, res, next) {
	if(req.params.value==="cvr"){
		try {
			mongo.connect(pathMongodb, (err, db)=>{
				db.collection("conversion").aggregate([{$group : {"_id" : {idOfferNet: "$idOfferNet", networkName:"$networkName"}}}], (err,result)=>{
					if(!err){
						for (var i = 0; i < result.length; i++) {
							result[i] = {$and : [{"idOfferNet" : result[i]._id.idOfferNet}, {"networkName" : result[i]._id.networkName}]};
						}
						db.collection("report").aggregate([{$match:{$or:result}}, {$group:{_id: "$idOffer", count :{$sum:1}}}],(err, report)=>{
							db.collection("conversion").aggregate([{$match:{$or:result}}, {$group:{_id: "$idOffer", count :{$sum:1}}}],(err, conversion)=>{
								var dataResponse = [];
								for (let i = 0; i < conversion.length; i++) {
									for(let j = 0; j < report.length; j++){
										if(conversion[i]._id===report[j]._id){
											dataResponse.push({"index" : conversion[i]._id, "cvr" : parseFloat(Math.round(conversion[i].count/report[j].count*100))+"%"})
											break;
										}
									}
								}
								var queryFindInfoApp = [];
								for (let i = 0; i < dataResponse.length; i++) {
									queryFindInfoApp.push(Number(dataResponse[i].index));
								}
								db.collection("offer").find({"index" : {$in: queryFindInfoApp}}).toArray((err, data)=>{
									for (let i = 0; i < data.length; i++) {
										for(let j = 0; j < dataResponse.length; j++){
											if(Number(dataResponse[j].index) === data[i].index){
												data[i].cvr = dataResponse[j].cvr;
												data[i].memberLink = `http://${req.headers.host}/checkparameter/?offer_id=${data[i].index}&aff_id={FacebookId}`;
												data[i].adminLink = `http://${req.headers.host}/click/?offer_id=${data[i].index}`;
												break;
											}
										}
									}
									res.send(data)
								})
							});
						});
					}
				})
			})
		} catch(e) {
			console.log(e);
		}
	}else{
		res.send("error")
	}
});

module.exports = router;
