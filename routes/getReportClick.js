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
						var download, myOffer, memSel;
						if(result.admin){
							memSel = `<select class="select-drop-blue sel-mem" name="members" id="members"><option value='all'>Members</option></select>`;
							download     = `<li class="has_sub">
				                                <a href="/userrequest" class="waves-effect"><i class="fa fa-envelope-o"></i> <span> User request </span></a>
				                            </li>
				                            <li class="has_sub">
				                                <a href="/adduser" class="waves-effect"><i class="fa fa-users"></i> <span> Add User  </span></a>
				                            </li>
				                            <li class="has_sub">
						                        <a href="/download" class="waves-effect"><i class="fa fa-download"></i> <span> Download </span></a>
						                    </li>
						                    `;
						    myOffer = `<li class="has_sub">
					                        <a href="/addnewoffer" class="waves-effect"><i class="fa fa-plus"></i> <span> Add Offers </span></a>
					                    </li>`;
						}else{
							memSel 	  = ``;
							download  = ``;
							myOffer   = `<li class="has_sub">
			                                <a href="/myoffers" class="waves-effect"><i class="ti ti-layout-list-post"></i> <span> My Offers </span></span></a>
			                            </li>`
						}
						    renderPage(download, myOffer, memSel)
						assert.equal(null,err);
						db.close();
					});
			});
		} catch(e) {
			res.redirect("/")
		}
	  	function renderPage(download, myOffer, memSel) {
	  		var admin =`<li>
		       			<a href="/admin" class="waves-effect"><i class="zmdi zmdi-view-dashboard"></i> <span> Dashboard </span> </a>
		    		</li>`;
			res.render("reportClick",{
				"name"    : req.user.displayName,
				"avatar"  : req.user.photos[0].value,
				"admin"   : admin,
				"download": download,
				"myOffer" : myOffer,
				"memSel"  : memSel
			})
	  	}
	}else{
		res.redirect("/")
	}
});

module.exports = router;
