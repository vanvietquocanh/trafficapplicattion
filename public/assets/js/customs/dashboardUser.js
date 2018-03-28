"use strict";
var profile = new Profile();
function Profile() {
	this.data;
}
Profile.prototype.setData = function(data){
	this.data = data;
};
Profile.prototype.setup = function(){
	var elementHtml = "";	
	var totalPay = parseFloat(profile.data.totalPay);
	console.log(this.data);
	this.data.dataSend.forEach( function(element, index) {
		elementHtml += `<tr role="row" class="odd fixcenter sel-items" style="color: #222">
						<td class="sorting_1" tabindex="0" style="color: #222">${element.id}</td>
						<td class="sorting_1" tabindex="0" style="color: #222">${element.appName}</td>
						<td class="sorting_1" tabindex="0" style="color: #222">${element.name}</td>
						<td class="showItems-name">${element.idOffer}</td>
						<td style="color: #222;">${element.time}</td>
						<td style="color: #222;">${element.ip}</td>
						<td>${element.agent}</td>
						<td style="max-width:10px;">${element.country}</td>
						<td>${element.key}</td>
					</tr>`;
	});
	
	$("#total").val(totalPay)
	$("#total-paid").html(totalPay)
	$("#conversion").html(profile.data.totalConversion)
	$("#just-finished").append(elementHtml);
};
$.post('/profiledata', function(data, textStatus, xhr) {
	profile.setData(data)
	profile.setup()
});
