var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
const request = require("request");
var geoip = require('geoip-lite');


const pathMongodb = require("./routes/pathDb");
var requestApi = new RequestAPI();
function RequestAPI() {
	this.data = [];
	this.ipGeoEqualsQuery = {};
}
RequestAPI.prototype.checkProxyDie = function() {
	console.log("asdasd");
	// console.log(Object.keys(requestApi.ipGeoEqualsQuery),"as");
};
RequestAPI.prototype.request = function(path, method) {
	request[`${method}`](path, (err, resData)=>{
		var arrayProxy = resData.body.split("<pre>")[1].split("</pre>")[0].split("\n");
		for (var i = 0; i < arrayProxy.length; i++) {
			if(arrayProxy[i]!==""){
				var geo = geoip.lookup(arrayProxy[i].split(":")[0]).country;
				if(requestApi.ipGeoEqualsQuery[`${geo}`]==undefined){
					requestApi.ipGeoEqualsQuery[`${geo}`] = [];
					requestApi.ipGeoEqualsQuery[`${geo}`].push(arrayProxy[i])
				}else {
					requestApi.ipGeoEqualsQuery[`${geo}`].push(arrayProxy[i])
				}
			}
		}
		requestApi.checkProxyDie();
	})
};

module.exports = requestApi;