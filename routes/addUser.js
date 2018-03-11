var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');


const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.user){
	  	try {
			var query = {
					"idFacebook": req.user.id
 				}
 			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
					db.collection('userlist').findOne(query,function(err,result){
						var download, addOffer;
						if(result.admin){
							addOffer 	 = `<li class="has_sub">
						                        <a href="/addnewoffer" class="waves-effect"><i class="fa fa-plus"></i> <span> Add Offers </span></a>
						                    </li>`
							download     = `<li class="has_sub">
				                                <a href="/userrequest" class="waves-effect"><i class="fa fa-envelope-o"></i> <span> User request </span></a>
				                            </
						                        <a hli>
				                            <li class="has_sub">
				                                <a href="/adduser" class="waves-effect"><i class="fa fa-users"></i> <span> Add User  </span></a>
				                            </li>
											<li class="has_sub"><a href="/download" class="waves-effect"><i class="fa fa-download"></i> <span> Download </span></a>
						                    </li>`;
						    renderPage(download, addOffer)
						}else{
							res.redirect("/")
						}
						assert.equal(null,err);
						db.close();
					});
			});
		} catch(e) {
			res.redirect("/")
		}
	  	function renderPage(download, myOffer) {
	  		var admin =`<li>
			       			<a href="/admin" class="waves-effect"><i class="zmdi zmdi-view-dashboard"></i> <span> Dashboard </span> </a>
			    		</li>`;
			res.render("addUser",{
				"name"    : req.user.displayName,
				"avatar"  : req.user.photos[0].value,
				"admin"   : admin,
				"download": download,
				"myOffer" : myOffer
			})
	  	}
	}else{
		res.redirect("/")
	}
});

module.exports = router;