"use strict";
var profile = new Profile();
function Profile() {
	this.data;
}
Profile.prototype.setData = function(data){
	this.data = data;
};
Profile.prototype.setup = function(){
	var total = 0;
	var totalConversion = 0;
	var countElement = 0;
	var elementHtml = "";
	for(let x = profile.data.conversion.length-1; x>=0;x--){
		if(profile.data.user===profile.data.conversion[x].id){
			totalConversion++;
			if(profile.data.conversion[x].pay){
				total += parseFloat(profile.data.conversion[x].pay);
			}
		}
		if(countElement<10){
			countElement++;
			elementHtml += `<tr role="row" class="odd fixcenter sel-items" style="color: #222">
							<td class="sorting_1" tabindex="0" style="color: #222">${profile.data.conversion[x].id}</td>
							<td class="sorting_1" tabindex="0" style="color: #222">${profile.data.conversion[x].appName}</td>
							<td class="sorting_1" tabindex="0" style="color: #222">${profile.data.conversion[x].name}</td>
							<td class="showItems-name">${profile.data.conversion[x].idOffer}</td>
							<td style="color: #222;">${profile.data.conversion[x].time}</td>
							<td style="color: #222;">${profile.data.conversion[x].ip}</td>
							<td>${profile.data.conversion[x].agent}</td>
							<td style="max-width:10px;">${profile.data.conversion[x].country}</td>
							<td>${profile.data.conversion[x].key}</td>
						</tr>`;
		}
	}
	$("#total").val(total)
	$("#total-paid").html(total)
	$("#conversion").html(totalConversion)
	$("#just-finished").append(elementHtml);
};
$.post('/profiledata', function(data, textStatus, xhr) {
	console.log(data)
	profile.setData(data)
	profile.setup()
});
