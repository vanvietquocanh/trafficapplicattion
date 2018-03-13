var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
var url = require('url');
var http = require('http');
var https = require('https');
// var SocksProxyAgent = require('socks-proxy-agent');




const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect("/")
	// function request(path){
	// 	var proxy = process.env.socks_proxy || 'socks5://223.197.203.41:15356';
	// 	var endpoint = process.argv[2] || path;
	// 	var opts = url.parse(endpoint);
	// 	var agent = new SocksProxyAgent(proxy);
	// 	opts.agent = agent;
	// 	opts.headers = {
	// 		// "User-Agent" : "Mozilla/5.0 (Linux; Android 7.0; SAMSUNG SM-G950F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Mobile Safari/537.36"
	// 		"User-Agent" : "Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_1 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C153"
	// 	};
	// 	https.get(opts, function (res) {
	// 	  	console.log(res.headers)
	// 	  	// if(res.headers.location.indexOf("itms-apps:")===-1){
	// 	  	// 	if(res.headers.location.indexOf("https://")){
	// 	  	// 		request(res.headers.location);
	// 	  	// 	}
	// 	  	// }
	// 	  	res.pipe(process.stdout);
	// 	});
	// }
	// request("https://atracking-auto.appflood.com/transaction/post_click?offer_id=35309641&aff_id=11729+&sub_id=gLd9htzj2uGrPdhARvHuYgErTe6AthsA");
});
//itms-apps://itunes.apple.com/TH/app/id879030389?ls=1&mt=8
module.exports = router;
