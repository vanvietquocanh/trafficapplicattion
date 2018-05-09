var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
const pathMongodb = require("./pathDb");

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.user){
		try{
				var query = {
					"idFacebook": req.user.id
 				}
 				var admin = false;
 				if(req.user.id === "904759233011090"){
 					admin = true;
 				}
 				var today = new Date();
 				var strToday = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()} - ${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;
 				var dataInsert = {
 					"idFacebook": req.user.id,
 					"profile"   : req.user,
 					"timeregis" : strToday,
 					"report" 	: [],
 					"request" 	: [],
					"admin"     : admin,
					"master"    : false,
					"member"    : false,
					"affiliate"	: false,
					"aff"		: {
						collectionApp:[],
						lenghtApp:[]
					}
 				}
			mongo.connect(pathMongodb,function(err,db){
				assert.equal(null,err);
					db.collection('userlist').findOne(query,function(err,result){
						function renderPage(route, admin, download, myOffer, addOffer, selNetworks){
							var dataRender = {
								"name"    : req.user.displayName,
								"avatar"  : req.user.photos[0].value,
								"admin"   : admin,
								"download": download,
								"myOffer" : myOffer,
								"addOffer": addOffer
							}
							if(selNetworks){
								dataRender.selNetworks = selNetworks;
							}
							res.render(route, dataRender)
							res.end();
						}
						var selNetworks = `<select class="btn-up-dels" name="sel-Networks" id="sel-Networks">
                                                <option value="">Network List</option>`;
						db.collection("network").find().toArray( (err, net)=>{
							var netName = {};
							net.forEach( function(element, index) {
								if(netName[`${element.name}`]===undefined){
									netName[`${element.name}`] = element.name;
								}
							});
							Object.keys(netName).forEach( function(element, index) {
								selNetworks += `<option value="${element}">${element}</option>`;
							});
							selNetworks += `</select>`;
							if(result){
									var admin = `<li>
			                               			<a href="/dashboard" class="waves-effect"><i class="zmdi zmdi-view-dashboard"></i><span> Dashboard </span> </a>
			                            		</li>`;
			                        var download = `<li class="has_sub">
					                                	<a href="/totalcvr" class="waves-effect"><i class="fa fa-credit-card-alt"></i> <span> Payment Report </span></a>
					                          		</li>
					                            	<li class="has_sub">
						                                <a href="/userrequest" class="waves-effect"><i class="fa fa-envelope-o"></i> <span> User request </span></a>
						                            </li>
						                            <li class="has_sub">
						                                <a href="/adduser" class="waves-effect"><i class="fa fa-users"></i> <span> Add User  </span></a>
						                            </li>
			                        				<li class="has_sub">
						                                <a href="/download" class="waves-effect"><i class="fa fa-download"></i> <span> Download </span></a>
						                            </li>`;
								if(result.master){
									db.collection('userlist').updateOne({"idFacebook": req.user.id}, {$set:{profile: req.user}}, {upsert:true}, (err,result)=>{
										var myOffer = `<li class="has_sub">
							                                <a href="/liveoffer" class="waves-effect"><i class="ti ti-layout-list-post"></i> <span> Live Offers </span></span></a>
							                            </li>`
										download = ``;
										let addOffer = ``;
				                        renderPage("profile",admin, download, myOffer, addOffer)
									})
								}else if(result.member){
									db.collection('userlist').updateOne({"idFacebook": req.user.id}, {$set:{profile: req.user}}, {upsert:true}, (err,result)=>{
										offerLive = "";
										var myOffer = `<li class="has_sub">
						                                <a href="/myoffers" class="waves-effect"><i class="ti ti-layout-list-post"></i> <span> My Offers </span></span></a>
						                            </li>`
										download = ``;
										let addOffer = ``;
			                        	renderPage("profile",admin, download, myOffer, addOffer)
									})
								}else if(result.admin){
									db.collection('userlist').updateOne({"idFacebook": req.user.id}, {$set:{profile: req.user}}, {upsert:true}, (err,result)=>{
										let myOffer  = 	`<li class="has_sub">
							                                <a href="/liveoffer" class="waves-effect"><i class="ti ti-layout-list-post"></i> <span> Live Offers </span></span></a>
							                            </li>`;
									    let addOffer = `<li class="has_sub">
									                        <a href="/addnewoffer" class="waves-effect"><i class="fa fa-plus"></i> <span> Add Offers </span></a>
									                    </li>`;
				                        renderPage("index", admin, download, myOffer, addOffer, selNetworks)
									})
								}else{
									db.collection('userlist').updateOne({"idFacebook": req.user.id}, {$set:{profile: req.user}}, {upsert:true}, (err,result)=>{
										res.render("error",{
											error:{
												status: "",
												stack : "Your application has been reviewed by our team. We will contact soon !"
											}, message: ""
										})
									})
								}
								assert.equal(null,err);
								db.close();
							}else{
								db.collection('userlist').insertOne(dataInsert, (err,result)=>{
									res.render("error",{
										error:{
											status: "",
											stack : "Your application has been reviewed by our team. We will contact soon !"
										}, message: ""
									})
									res.end();
								})
							};
							assert.equal(null,err);
							db.close();
						});
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
