var totalcvr = new TotalCVR();
var indexMember = 1;
var renderData = $("#renderData");
var member = $("#member").children('option');
function TotalCVR() {
	this.data;
	this.start = 0;
	this.requestGetData;
}
TotalCVR.prototype.setData = function(data) {
	this.data = data;
};
TotalCVR.prototype.getData = function(path, idUser, start, end) {
	var dataPost = {
		"idUser" : idUser,
		"start"  : start
	}
	totalcvr.requestGetData = $.post(path, dataPost, function(data, textStatus, xhr) {
		if(data.length<=500){
			totalcvr.setData(data);
			totalcvr.requestGetData.abort();
		}else{
			totalcvr.setData(data);
			totalcvr.start += 500;
			totalcvr.getData('/datatotalcvr', $(member[indexMember]).val(), totalcvr.start);
		}
	});
};
totalcvr.getData('/datatotalcvr', $(member[indexMember]).val(), totalcvr.start);