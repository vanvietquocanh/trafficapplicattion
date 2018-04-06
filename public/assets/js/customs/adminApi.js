"use strict";
// css 
$("#sidebar-menu>ul>li>a.waves-effect:first").addClass('active');
$(".checkbox-person").css({
    "position":"absolute",
    "top" : "40%",
    "right" : "1%"
})

// api
var api = new API();
var updateDB = $("#updateDB");
var search = $("#search");
var renderMember = $("#renderAPIdata");
var promote = $("#promote");
var demote = $("#demote");
var dismissal = $("#dismissal");
var memberMasterList = $("#memberMasterList");
var select = [];
var countRequest = 0;
var indexOfNetWorkEdit;
var arraySelectMember=[];
var delOffer = $("#delOffer");
var delLiveOffer = $("#delLiveOffer");
//this is variable netWOrk
var nameNetwork = $("#nameNetwork");
var methodNetwork = $("#methodNetwork");
var linkNetwork = $("#linkNetwork");
var postBack = $("#postBack");
var addBtnNetwork = $("#btnAddNetWork");
var renderNetwork = $("#renderNetwork");
function API() {
	this.data;
	this.affiliate;
	this.member;
	this.netWork;
	this.custom;
	this.sttServerCustomNetwork;
}
delOffer.click(()=>{
	var ses = confirm("You are sure to delete all offers");
	if(ses){
		api.delRequest("/delete/alloffer")
	}
});
delLiveOffer.click(()=>{
	var ses = confirm("You are sure to delete all live offers");
	if(ses){
		api.delRequest("/delete/liveoffer")
	}
});
API.prototype.delRequest = function(path) {
	$.post(path, function(data, textStatus, xhr) {
		alert(data)
	});
};
API.prototype.fil = function(select, condition) {
	var result = select.filter(function(item) {
				return item.id === condition;
			});
	return result;
}
API.prototype.attachedNewMember = function(data) {
	$("#renderManagerAPI").empty();
	var itemHTML = `<h3>Confirm</h3>`;
	$.each(data,(index, el) =>{
		itemHTML += `<label for="${el.idFacebook}" style="width:100%">
				            <a>
				                <div class="inbox-item" style="display:flex; position: relative; border-bottom: 1px solid #777; padding-bottom: .5em; overflow: inherit">
				                    <div class="inbox-item-img"><img src="${el.profile.photos[0].value}" class="img-circle" alt="${el.profile.displayName}-image"></div>
				                    <p class="inbox-item-author" style="padding-left:1em; padding-top:1em; color:#111">${el.profile.displayName}</p>
				                    <p class="inbox-item-date" style="position:absolute; right: 10%; top: 20%; color:#111">${el.timeregis}</p>
				                    <input class="checkbox-person noMember" type="checkbox" name="sel" id="${el.idFacebook}" value="${el.idFacebook}" style="position:absolute; right: 3%; top: 50%;">
				                </div>
				            </a>
				        </label>`;
	})
	$("#renderManagerAPI").append(itemHTML)
	$(".noMember").change(function(event) {
		if(event.target.checked){
			var member = {
				"mem" : event.target.checked,
				"id"  : event.target.value
			}
			if(api.fil(select, event.target.value).length === 0){
				select.push(member)
			}
		}else{
			$.each(select, function(index, val) {
				if(val){
					if(val.id === event.target.value){
						select.splice(index,1);
					}
				}
			});
		}
	});
	api.saveData(data);
}
API.prototype.requestSave = function(data){
	$.each(data,(i,person)=>{
		$.post("/savedata",person,function(data, textStatus, xhr){
		})
		if(i===data.length-1){
			window.location.reload(true);
		}
	})
};
API.prototype.getAPIManager = function(){
	$.post('/apiAwaitingApproval', function(data, textStatus, xhr) {
		this.data = data;
		api.attachedNewMember(this.data)
	});
};
API.prototype.attachedMember = function(data){
	var htmlAttached = "";
	$.each(data, function(index, el) {
		htmlAttached += `<label for="${el.idFacebook}" style="width:100%">
                            <a>
                                <div class="inbox-item" style="overflow: inherit">
                                    <div class="inbox-item-img"><img src="${el.profile.photos[0].value}" class="img-circle" alt="img-${el.profile.displayName}"></div>
                                    <p class="inbox-item-author" style="line-height: 3">${el.profile.displayName}</p>
                                    <p class="inbox-item-date">${el.sessionTime}</p>
                                    <input class="checkbox-person isMember" type="checkbox" name="${el.idFacebook}" id="${el.idFacebook}" value="${el.idFacebook}" style="position: absolute; right: 2%; top: 60%;"/>
                                </div>
                            </a>
                        </label>`;

	});
	renderMember.append(htmlAttached)
	$(".isMember").change(function(event) {
		if(event.target.checked){
			var member = {
				"master" : event.target.checked,
				"id"     : event.target.value
			}
			if(api.fil(arraySelectMember, event.target.value).length === 0){
				arraySelectMember.push(member)
			}
		}else{
			$.each(arraySelectMember, function(index, val) {
				if(val){
					if(val.id === event.target.value){
						arraySelectMember.splice(index,1);
					}
				}
			});
		}
	});
	$("#promote").click(()=>{
		let sessionPromote = confirm("You sure you want Promote?")
		if(sessionPromote&&arraySelectMember.length>0){
			$.each(arraySelectMember,(i,person)=>{
				$.post("/promote", person, (data, textStatus, xhr)=>{
				})
				if(i===arraySelectMember.length-1){
					window.location.reload(true);
				}
			})
		}
	});
	$("#demote").click(()=>{
		let sessionDemote = confirm("You sure you want Demote?")
		if(sessionDemote&&arraySelectMember.length>0){
			$.each(arraySelectMember,(i,person)=>{
				$.post("/demote", person, (data, textStatus, xhr)=>{
				})
				if(i===arraySelectMember.length-1){
					window.location.reload(true);
				}
			})
		}
	});
	$("#dismissal").click(()=>{
		let sessionDismissal = confirm("You sure you want Dismissal?")
		if(sessionDismissal&&arraySelectMember.length>0){
			$.each(arraySelectMember,(i,person)=>{
				$.post("/dismissal", person, (data, textStatus, xhr)=>{
				})
				if(i===arraySelectMember.length-1){
					window.location.reload(true);
				}
			})
		}
	});
	memberMasterList.click(function(event) {
		renderMember.empty();
		if(memberMasterList.children().text()==="Member List"){
			arraySelectMember = [];
			api.getAPIMember()
			$("#memListTit").html("Member List");
			memberMasterList.children().html("Master List")
		}else{
			arraySelectMember = [];
			api.getMaster()
			$("#memListTit").html("Master List");
			memberMasterList.children().html("Member List")
		}
		memberMasterList.unbind();
	});
};
API.prototype.getMaster = ()=>{
	$.post('/getmasterlist', function(data, textStatus, xhr) {
		api.attachedMember(data);
	});
}
API.prototype.getAPIMember = function(){
	$.post('/member', function(data, textStatus, xhr) {
		this.member = data;
		api.attachedMember(data);
	});
};
API.prototype.saveData = function(data){
	updateDB.click(function(event) {
		var session = confirm("You sure you want to add this member ?")
		if(session&&select.length>0){
			api.requestSave(select);
		}
	});
};
API.prototype.addNetwork = (dataInput)=>{
	var dataUpdate = {
		name 	: nameNetwork.val(),
		method 	: methodNetwork.val(),
		link 	: linkNetwork.val(),
		postback: postBack.val()
	}
	nameNetwork.val("")
	methodNetwork.val("")
	linkNetwork.val("")
	postBack.val("")
	api.loaddingAPI(addBtnNetwork,"<i class='fa fa-spinner fa-pulse'></i>")
	$.post("/addnetwork", dataUpdate, (data, text, xhr)=> {
		if(data){
			api.removeEvent();
			api.getNetworkList();
			api.loadSuccessfully(addBtnNetwork,"<i class='fa fa-plus' aria-hidden='true'></i>")
		}else{
			api.addNetwork(dataInput)
		}
	})
}
API.prototype.getNetworkList = function(){
	$.post('/listnetwork', function(data, textStatus, xhr) {
		api.setNetwork(data);
		renderNetwork.empty();
		api.removeEvent();
		if(api.netWork.NetworkList!==undefined&&api.netWork.NetworkList.length>0){
			api.netWork.NetworkList.forEach( function(val, index) {
				api.attachedNetworkToDom(val, index)
			});
		}
		api.addEventEditer();
	});
};
API.prototype.addEventEditer = function(){
	var netWorkData = this.netWork;
	addBtnNetwork.click(function(e) {
		if(addBtnNetwork.children().attr("class").split("-")[1]==="plus"){
			// if(methodNetwork.val()){
			// 	$.post(linkNetwork.val(), function(data, textStatus, xhr) {
			// 		if(xhr.status===200){
			// 			attachedNetwork();
			// 		}else{
			// 			alert("Link Error!")
			// 		}
			// 	});
			// }else{
			// 	$.get(linkNetwork.val(), function(data, textStatus, xhr){
			// 		if(xhr.status===200){
			// 			attachedNetwork();
			// 		}else{
			// 			alert("Link Error!")
			// 		}
			// 	});
			// }
			// function attachedNetwork() {
				if(nameNetwork.val()!=="" &&methodNetwork.val()!== null&&linkNetwork.val()!==""&&postBack.val()!==""){
					var domainNetwork = linkNetwork.val().split("://")[1].split(".")[0];
					if(domainNetwork){
						var data = {
							name     : nameNetwork.val(),
							method   : methodNetwork.val(),
							link     : linkNetwork.val(),
							postback : postBack.val()
						}
						api.addNetwork(data)
					}
				}else {
					alert("Please enter full information!!");
				}
			// }
		}else{
			var itemEdit = api.netWork.NetworkList[indexOfNetWorkEdit];
			itemEdit.name = nameNetwork.val();
			itemEdit.method = methodNetwork.val();
			itemEdit.link = linkNetwork.val()
			itemEdit.postback = postBack.val()
			api.loaddingAPI(addBtnNetwork,"<i class='fa fa-spinner fa-pulse'></i>")
			nameNetwork.val("");
			methodNetwork.val("");
			linkNetwork.val("");
			postBack.val("");
			$.post("/updatenetwork", api.netWork, (data, text, xhr)=>{
				renderNetwork.empty()
				if(data){
					api.loadSuccessfully(addBtnNetwork,"<i class='fa fa-plus' aria-hidden='true'></i>")
					api.removeEvent();
					$.each(api.netWork.NetworkList, function(index, val) {
						api.attachedNetworkToDom(val,index);
					});
					api.addEventEditer();
				}else{
					api.rerenderNetwork()
				}
			})
		}
	});
	$(".btn-content-del").click(function(event) {
		var sesdel = confirm("You sure you want to delete Network?")
		if(sesdel){
			$(".btn-content-del").children().removeClass("fa-trash-o").addClass('fa-spinner fa-pulse')
			api.removeEvent();
			api.netWork.NetworkList.splice($(event.target).attr("class").split("btn_")[1],1)
			$.post("/updatenetwork", api.netWork, (data, text, xhr)=>{
				renderNetwork.empty()
				if(data){
					$(".btn-content-del").children().removeClass("fa-spinner fa-pulse").addClass('fa-trash-o')
					nameNetwork.val("")
					methodNetwork.val("null")
					linkNetwork.val("")
					postBack.val("")
					api.getNetworkList();
				}else{
					api.rerenderNetwork()
				}
			})
		}
	});
	$(".btn-content-edit").click((event)=>{
		$.each(netWorkData.NetworkList, (index, el)=> {
			if(index == $(event.target).attr("class").split("btn_")[1]){
				indexOfNetWorkEdit = index;
				nameNetwork.val(el.name)
				methodNetwork.val(el.method)
				linkNetwork.val(el.link)
				postBack.val(el.postback)
				addBtnNetwork.children().removeClass("fa-plus").addClass('fa-check');
			}
		});
	})
	$(".btn-content-copy").click((e)=>{
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val($(`#val_${$(event.target).attr("class").split("btn_")[1]}`).text()).select();
		document.execCommand("copy");
		$temp.remove();
	})
	$(".btn-content-menu").click((e)=>{
		api.custom = $(event.target).attr("class").split("btn_")[1];
		if(api.netWork.NetworkList[api.custom].custom==undefined){
			var custom = {
				data 	 	  : "",
				offeridSet    : "",
				platformSet   : "",
				imgSet   	  : "",
				nameSet 	  : "",
				urlSet 	   	  : "",
				paySet 	      : "",
				capSet 	      : "",
				countrySet    : "",
				categorySet   : "",
				offerType     : "",
				prevLink      : "",
				descriptionSet: ""
			}
			api.customNetReturn(custom)
		}else{
			api.customNetReturn(api.netWork.NetworkList[api.custom].custom)
		}
		$(".custNet").fadeIn('slow');
	})
	$("#Cancle").click((e)=>{
		$(".custNet").fadeOut('slow');
	})
	$("#Confirm").click((e)=>{
		var confirmAddCustom = confirm("you definitely want to add?");
		if($("#datacust").val()&&$("#OfferID").val()&&$("#Platform").val()&&$("#Thumbnail").val()&&$("#Name").val()&&$("#Url").val()&&$("#Payout").val()&&$("#Cap").val()&&$("#Country").val()){
			if(confirmAddCustom){
				var dataSetToNetwork = {
					data           : $("#datacust").val(),
					offeridSet     : $("#OfferID").val(),
					platformSet    : $("#Platform").val(),
					imgSet     	   : $("#Thumbnail").val(),
					nameSet   	   : $("#Name").val(),
					urlSet    	   : $("#Url").val(),
					paySet    	   : $("#Payout").val(),
					capSet         : $("#Cap").val(),
					countrySet     : $("#Country").val(),
					categorySet    : $("#Category").val(),
					offerType      : $("#OfferType").val(),
					prevLink       : $("#PrevLink").val(),
					descriptionSet : $("#description").val()
				}
				api.netWork.NetworkList[api.custom].custom = dataSetToNetwork;
				api.loaddingAPI($("#Confirm"),"<i class='fa fa-spinner fa-pulse'></i>")
				$.post("/updatenetwork", api.netWork, (data, text, xhr)=>{
					if(data){
						$(".custNet").fadeOut('slow');				
						api.loadSuccessfully($("#Confirm"),"Confirm")
					}else{
						alert("Error connect Internet please retry!!")
					}
				})
			}
		}else{
			alert("Please complete all information?")
		}
	})	
};
API.prototype.loaddingAPI = function(idButton, tagI){
	idButton.html(tagI)
};
API.prototype.loadSuccessfully = function(idButton, tagI){
	idButton.html(tagI)
};
API.prototype.customNetReturn = function(custom){
	$("#datacust").val(custom.data);
	$("#OfferID").val(custom.offeridSet);
	$("#Platform").val(custom.platformSet);
	$("#Thumbnail").val(custom.imgSet);
	$("#Name").val(custom.nameSet);
	$("#Url").val(custom.urlSet);
	$("#Payout").val(custom.paySet);
	$("#Cap").val(custom.capSet);
	$("#Country").val(custom.countrySet);
	$("#Category").val(custom.categorySet);
	$("#OfferType").val(custom.offerType);
	$("#PrevLink").val(custom.prevLink);
	$("#description").val(custom.descriptionSet);
};
API.prototype.setNetwork = function(data){
	this.netWork = data;
};
API.prototype.attachedNetworkToDom = (data, index)=>{
	var htmlNetWork =  `<tr role="row" class="odd">
					        <td>${data.name}</td>
					        <td>${data.method}</td>
					        <td>${data.link}</td>
					        <td id="val_${index}">http://${window.location.href.split("//")[1].split("/")[0]}/tracking/eventdata?transaction_id={${data.postback}}</td>
					        <td class="icon-content"><button class="btn-content btn-content-edit fa btn_${index}"></button></td>
					        <td class="icon-content"><button class="btn-content btn-content-del fa btn_${index}"><i class="fa fa-trash-o"></i></button></td>
					        <td class="icon-content"><button class="btn-content btn-content-copy fa btn_${index}"></button></td>
					        <td class="icon-content"><button class="btn-content btn-content-menu fa btn_${index}"></button></td>
						</tr>`;
	renderNetwork.append(htmlNetWork);
}
api.getNetworkList();
api.getAPIManager();
api.getAPIMember();
$("#refreshAPI").click(function(event) {
	if(api.netWork.NetworkList.length>0&&api.netWork.NetworkList[0].custom!=undefined){
		var sessionRefresh = confirm("You definitely want to refresh up the offers?");
		if(sessionRefresh&&countRequest===0){
			$("#refreshAPI").children().addClass("fa-spin")
			// api.loaddingAPI($("#refreshAPI"),"<i class='fa fa-spinner fa-pulse'></i>")
			countRequest++;
			$.post('/autorequestlink', null, function(data, textStatus, xhr) {
				api.loadSuccessfully($("#refreshAPI"),"<i class='fa fa-refresh'></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Refresh API")
				var readAlert = alert(data);
			});
		}
	}else{
		alert("Please enter full information!!");
	}
});
API.prototype.removeEvent = function(){
	$(".btn-content-del").unbind('click');
	$(".btn-content-edit").unbind('click');
	$(".btn-content-copy").unbind('click');
	addBtnNetwork.unbind('click');
	$(".btn-content-menu").unbind('click');
	$("#Cancle").unbind('click');
	$("#Confirm").unbind('click');
};
API.prototype.rerenderNetwork = function(){
	$.post("/updatenetwork", api.netWork, (data, text, xhr)=>{
		renderNetwork.empty()
		if(data){
			$.each(api.netWork.NetworkList, function(index, val) {
				api.removeEvent();
				api.attachedNetworkToDom(val,index);
			});
		}else{
			api.rerenderNetwork()
		}
	})
};
