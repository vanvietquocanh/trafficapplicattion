var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
const country = require("./country");

/* GET home page. */
router.get('/', function(req, res, next) {
	var arrayCountry = {
		"message" : "ok",
		"country" : country.toString()
	};
	res.send(arrayCountry)
});

module.exports = router;
