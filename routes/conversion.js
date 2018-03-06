var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');


const pathMongodb = require("./pathDb");

router.get("/",(req, res, next)=>{
	if(req.user){
		try {
			var query = {
					"idFacebook": req.user.id
 				}
 			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
					db.collection('userlist').findOne(query,function(err,result){
						var download,memSel, myOffer;
						if(result.admin){
							myOffer = 		`<li class="has_sub">
						                        <a href="/addnewoffer" class="waves-effect"><i class="fa fa-plus"></i> <span> Add Offers </span></a>
						                    </li>`;
							download     = `<li class="has_sub">
				                                <a href="/userrequest" class="waves-effect"><i class="fa fa-envelope-o"></i> <span> User request </span></a>
				                            </li>
				                            <li class="has_sub">
				                                <a href="/adduser" class="waves-effect"><i class="fa fa-users"></i> <span> Add User  </span></a>
				                            </li>
											<li class="has_sub">
						                        <a href="/download" class="waves-effect"><i class="fa fa-download" hidden="true"></i> <span> Download </span></a>
						                    </li>`;
						    memSel 	 	= `<select class="select-drop-blue sel-mem" name="members" id="members"><option value='all'>Members</option></select>`;
						}else{
							download = ""
							myOffer  = `<li class="has_sub">
			                                <a href="/myoffers" class="waves-effect"><i class="ti ti-layout-list-post"></i> <span> My Offers </span></span></a>
			                            </li>`;
			                memSel    =``;
						}
						    renderPage(download, memSel, myOffer)
						assert.equal(null,err);
						db.close();
					});
			});
		} catch(e) {
			res.redirect("/")
		}
	  	function renderPage(download, memSel, myOffer) {
	  		var admin =`<li>
		       			<a href="/admin" class="waves-effect"><i class="zmdi zmdi-view-dashboard"></i> <span> Dashboard </span> </a>
		    		</li>`;
			res.render("conversion",{
				"name"  : req.user.displayName,
				"avatar": req.user.photos[0].value,
				"admin" : admin,
				"download": download,
				"memSel" : memSel,
				"myOffer": myOffer
			})
	  	}
	}else{
		res.redirect("/")
	}
})

module.exports = router;