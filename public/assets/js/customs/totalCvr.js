var totalcvr = new TotalCVR();
var indexMember = 1;
var table = $("tbody")
var renderData = $("#renderData");
var dateFilterStart = $("#dateFilterStart");
var renderData = $("#dateFilterEnd");
var member = $("#member").children('option');
function TotalCVR() {
	this.start = 0;
	this.requestGetData;
	this.afterHandling = [];
	this.arrayList = [];
}
TotalCVR.prototype.setData = function(user, conversion) {
	this.user = user;
	this.conversion = conversion;
	totalcvr.handlingData();
};
TotalCVR.prototype.postData = function(path, idUser, startDate, endDate) {
	var dataPost = {
		"idUser" 	 : idUser,
		"startDate"  : startDate,
		"endDate"  	 : endDate
	}
	totalcvr.requestGetData = $.post(path, dataPost, function(data, textStatus, xhr) {
		if(data){
			totalcvr.setData(data.user, data.conversion)
		}
	});
};
TotalCVR.prototype.handlingData = function() {
	this.user.forEach(function(user, index) {
		totalcvr.conversion.forEach(function(conversion, index) {
			if(user.idFacebook === conversion._id){
				conversion.avatar = user.profile.photos[0].value;
				conversion.username = user.profile.displayName;
				totalcvr.afterHandling.push(conversion);
			}
		});
	});
	totalcvr.createHTML();
};
TotalCVR.prototype.createHTML = function() {
	table.empty();
	console.log(this.afterHandling);
	this.afterHandling.forEach( function(element, index) {
		var elementHtml = `<tr role="row" class="odd fixcenter sel-items" style="color: #111">
							<td class="sorting_1" tabindex="0" style="color: #111">${element._id}</td>
							<td class="sorting_1" tabindex="0" style="color: #111"><img src="${element.avatar}" style="border-radius: 3em;"/></td>
							<td class="sorting_1" tabindex="0" style="color: #111">${element.username}</td>
							<td class="showItems-name">${parseFloat(Math.round(element.revenue*1000)/1000)}</td>
							<td style="color: #111;">${element.countConversion}</td>
						</tr>`;
	totalcvr.arrayList.push(elementHtml)
	});
	table.append(totalcvr.arrayList.toString().split(",").join(""))
};
totalcvr.postData('/statistical', "all", totalcvr.start, new Date().getTime());