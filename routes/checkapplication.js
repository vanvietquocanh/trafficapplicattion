var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
var store = require('app-store-scraper');
const pathMongodb = require("./pathDb");
var gplay = require('google-play-scraper');

/* GET home page. */
router.post('/', function(req, res, next) {
	try {
		if(req.body.url.indexOf("market://")!==-1||req.body.url.indexOf("play.google.com")!==-1){
 			let id = "";
 			if(req.body.url.indexOf("market://")!==-1){
 				id += req.body.url.split("id=")[1].split("&")[0];
 			}else{
 				id += req.body.url.split("id=")[1].split("&")[0];
 			}
			gplay.app(
						{
							appId: id
						}
					)
			.then(data=>{
			 	res.send(data);
			})
			.catch(err=>{
				var error = {
					"message" : "error",
					"url"	  : req.body.url
				}
			 	res.send(error);
			})
		}else if (req.body.url.indexOf("itunes.apple.com")!==-1){
			let id = req.body.url.split("/id")[1].split("?")[0];
			store.app(
						{
							id: id
						}
					)
			.then(data=>{
				res.send(data)
			})
			.catch((err)=>{
				var error = {
					"message" : "error",
					"url"	  : req.body.url
				}
				res.send(error)
			})
		}else{
			var error = {
				"message" : "error",
				"url"	  : req.body.url
			}
			res.send(error)
		}
	} catch(e) {
		res.redirect("/")
	}
});

module.exports = router;
