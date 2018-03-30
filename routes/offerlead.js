var express = require('express');
var router = express.Router();
var request = require("request");
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
						var download, myOffer, memSel, selNetworks;
						if(result.admin){
							db.collection("network").findOne({"isNetwork": true }, (err, result)=>{
								selNetworks = `<select class="select-drop-blue sel-mem" name="sel-Networks" id="sel-Networks">
                                                <option value="all">Network List</option>`;
								result.NetworkList.forEach( function(element, index) {
									selNetworks += `<option value="${element.name}">${element.name}</option>`;
								});
								selNetworks += `</select>`
								download     = `<li class="has_sub">
					                                <a href="/userrequest" class="waves-effect"><i class="fa fa-envelope-o"></i> <span> User request </span></a>
					                            </li>
					                            <li class="has_sub">
					                                <a href="/adduser" class="waves-effect"><i class="fa fa-users"></i> <span> Add User  </span></a>
					                            </li>
												<li class="has_sub">
							                        <a href="/download" class="waves-effect"><i class="fa fa-download"></i> <span> Download </span></a>
							                    </li>`;
							    myOffer = `<li class="has_sub">
				                                <a href="/leadoffer" class="waves-effect"><i class="ti ti-layout-list-post"></i> <span> Lead Offers </span></span></a>
				                            </li>`;
							    memSel  = ``;
							    addOffer = `<li class="has_sub">
						                        <a href="/addnewoffer" class="waves-effect"><i class="fa fa-plus"></i> <span> Add Offers </span></a>
						                    </li>`;
							})
						}else if(result.master){
							download = "";
							myOffer  = `<li class="has_sub">
				                                <a href="/leadoffer" class="waves-effect"><i class="ti ti-layout-list-post"></i> <span> Lead Offers </span></span></a>
				                            </li>`;
							addOffer = "";
			                memSel   = "";
							selNetworks  = "";
						}else if(result.member){
							download = "";
							myOffer  = `<li class="has_sub">
				                                <a href="/myoffers" class="waves-effect"><i class="ti ti-layout-list-post"></i> <span> My Offers </span></span></a>
				                            </li>`;
							addOffer = "";
			                memSel   = "";
							selNetworks  = "";
						}
							renderPage(download, myOffer, memSel, selNetworks, addOffer)
						assert.equal(null,err);
						db.close();
					});
			});
		} catch(e) {
			res.redirect("/")
		}
	  	function renderPage(download, myOffer, memSel, selNetworks, addOffer) {
	  		var admin =`<li>
		       			<a href="/admin" class="waves-effect"><i class="zmdi zmdi-view-dashboard"></i> <span> Dashboard </span> </a>
		    		</li>`;
			res.render("offers",{
				"name"  : req.user.displayName,
				"avatar": req.user.photos[0].value,
				"admin" : admin,
				"download": download,
				"myOffer" : myOffer,
				"memSel"  : memSel,
				"selNetworks" : selNetworks,
				"addOffer" : addOffer
			})
	  	}
	}else{
		res.redirect("/")
	}
});

module.exports = router;
