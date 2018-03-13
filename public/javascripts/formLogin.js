jQuery(document).ready(function($) {
	var btnExit = $(".icon-exit");
	var fromLogin = $(".fromLogin");
	var btnShowLogin = $("#bt-show-log");
	btnExit.click(function(event) {
		fromLogin.fadeOut("slow");
	});
	btnShowLogin.click(function(event) {
		fromLogin.fadeIn("slow");
	});
});