var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');


const pathMongodb = require("./pathDb");

/* GET home page. */
router.post('/', function(req, res, next) {
	if(req.user){
		try{
			var arrayList = [];
			var dataSend = [];
			var totalPay = 0;
			var totalConversion = 0;
			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
					db.collection('conversion').find().toArray(function(err,result){
						result.forEach((ele, i)=>{
							if(req.user.id === ele.id){
								totalConversion++;
								totalPay = totalPay+ele.pay;
							}
							arrayList.push(ele);
						})
						for(var i = arrayList.length-1; i > arrayList.length-11; i--) {
							if(i>-1){
								dataSend.push(arrayList[i])
							}
						}
						var data = {
							"conversion"	  : dataSend,
							"total"  		  : totalPay,
							"totalConversion" : totalConversion,
						};
						res.send(data)
					assert.equal(null,err);
					db.close();
					});
			});
		}catch(e){
			res.redirect("/")
			res.end();
		}
	}else{
		res.redirect("/")
		res.end();
	}
});

module.exports = router;
