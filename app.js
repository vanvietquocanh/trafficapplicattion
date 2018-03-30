var express = require('express');
var path = require('path');
var passport = require("passport")
var bodyParser = require('body-parser');
var FacebookStrategy = require('passport-facebook');
var session = require("express-session");
var LocalStrategy = require("passport-local")
var infoAPI = require("./routes/apiInfo.js");
var schedule = require('node-schedule');

var home = require('./routes/home');
var redirectAdmin = require('./routes/redirectAdmin');
var demote = require('./routes/demote');
var dismissal = require('./routes/dismissal');
var promote = require('./routes/promote');
var index = require('./routes/index');
var signin = require('./routes/signin');
var saveData = require('./routes/saveData');
var apiAwaitingApproval = require('./routes/apiAwaitingApproval');
var apiMember = require('./routes/apiMember');
var Download = require('./routes/Download');
var profile = require('./routes/profile');
var myOffers = require('./routes/myOffers');
var offers = require('./routes/offers');
var trackinglink = require('./routes/trackinglink');
var postback = require('./routes/postBack');
var getListMaster = require('./routes/getMasterList');
var autoRequestLink = require('./routes/autoRequestLink');
var conversion = require('./routes/conversion');
var checkParameter = require('./routes/checkParameter');
var getReportClick = require('./routes/getReportClick');
var apiprofileUser = require('./routes/apiprofileUser');
var addUser = require('./routes/addUser');
var apiGetDataReportClick = require('./routes/apiGetDataReportClick');
var listNetwork = require('./routes/listNetwork');
var filter = require('./routes/filter');
var updateNetwork = require('./routes/updateNetwork');
var conversionlist = require('./routes/apiConversionData');
var addNetwork = require('./routes/addNetwork');
var search = require('./routes/search');
var postback = require('./routes/postBack');
var routeShowRequest = require('./routes/routeShowRequest');
var getCountry = require('./routes/get.country');
var apiRequestOfUser = require('./routes/apiRequestOfUser');
var requestList = require('./routes/requestList');
var responOfAdmin = require('./routes/responOfAdmin');
var updatePay = require('./routes/updatePay');
var delRequest = require('./routes/delRequest');
var updateuserlist = require('./routes/updateUserList');
var dataOfMyOffer = require('./routes/dataOfMyOffer');
var getDataUserList = require('./routes/getDataUserList');
// var equals = require('./routes/equals');
var device = require('./routes/device');
var clickAuto = require('./routes/clickAuto');
var checkApplication = require('./routes/checkapplication');
var cvr = require('./routes/cvr');
var addOffer = require('./routes/addOffer');
var postRequestSttUser = require('./routes/post.request.sttUser');
var listConversionIp = require('./routes/listConversionIp');
var getListCustomOffer = require('./routes/getListCustomOffer');
var delUser = require('./routes/delUser');
var publicuser = require('./routes/post.request.user');
var editUserAdd = require('./routes/edit.useradd');
var addNewOffer = require('./routes/addNewOffer');
var logout = require('./routes/logout');
var advertiser = require('./routes/advertiser');
var Monetization = require('./routes/monetization');
var viaSdk = require('./routes/viaSdk');
var getport = require('./routes/getport');
var getDataLead = require("./routes/getDataLead")
var setAuto = require("./autoRequest");
var smartLink = require('./smartLink');

var app = express();


app.enable('trust proxy')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/checkparameter', checkParameter);
app.use('/clickauto', clickAuto);
app.use('/tracking', postback);
app.use('/publicuser', publicuser);
app.use('/request', cvr);
app.use('/checkapplication', checkApplication);
app.use('/checkstt', postRequestSttUser);
// app.use('/TMCkWt7vLsWp0gTtr7G4Aw', equalsOfferId);
app.use('/list', listConversionIp);
app.use("/getoffer", getDataLead);
app.use('/get', getport);
app.use('/advertiser', advertiser);
app.use('/monetization', Monetization);
app.use('/sdk-via', viaSdk);
app.use('/getcountry', getCountry);
app.use('/smart', smartLink);
app.use(session(
                { secret: 'coppycat',
                  resave: false,
                  saveUninitialized: false,
                  cookie:{
                    maxAge: 86400000,
                  }
                }
              ));
//var j = schedule.scheduleJob({hour: 23, minute: 00}, function(){
//  var querySearchEmpty = {
//        "isOldOffer" : true
//      };
 // setAuto.request("http://filefab.com/api.php?l=VNYGT_1-B7Wq2JJzYiSFRTN5aHoa4LekB41ywrawjUI", "get");
//});
//var k = schedule.scheduleJob('0 0 */3 * *', function(){
//  var querySearchEmpty = {
//        "isNewOffer" : true
//      };
//  setAuto(querySearchEmpty);
//});
smartLink();
app.use(passport.initialize());
app.use(passport.session());
passport.use(new FacebookStrategy(infoAPI, function(accessToken, refreshToken, profile, done) {
      done(null, profile);
    })|| new LocalStrategy(function(username, password, done) {
   
    })
    )
passport.serializeUser((user, done)=>{
  done(null, user)
})
passport.deserializeUser((id, done)=>{
  done(null, id)
})
app.route("/facebook").get(passport.authenticate("facebook"))
app.use('/', home);
app.use('/signin', signin);
app.use('/admin', redirectAdmin);
app.use('/dashboard', index);
app.use('/download', Download);
app.use('/savedata', saveData);
app.use('/apiAwaitingApproval', apiAwaitingApproval);
app.use('/member', apiMember);
app.use('/profile', profile);
app.use('/myoffers', myOffers);
app.use('/offers', offers);
app.use('/reportclick', getReportClick);
app.use('/trackinglink', trackinglink);
app.use('/demote', demote);
app.use('/dismissal', dismissal);
app.use('/promote', promote);
app.use('/postback', postback);
app.use('/getmasterlist', getListMaster);
app.use('/profiledata', apiprofileUser);
app.use('/addnetwork', addNetwork);
app.use('/autorequestlink', autoRequestLink);
app.use('/conversion', conversion);
app.use('/reportclickgetdata', apiGetDataReportClick);
app.use('/filter', filter);
app.use('/listnetwork', listNetwork);
app.use('/search', search);
app.use('/updatenetwork', updateNetwork);
app.use('/conversionlist', conversionlist);
app.use('/userrequest', routeShowRequest);
app.use('/userpost', apiRequestOfUser);
app.use('/listrequest', requestList);
app.use('/respon', responOfAdmin);
app.use('/delrequest', delRequest);
app.use('/adduser', addUser);
app.use('/adminupdateuser', updateuserlist);
app.use('/device', device);
app.use('/datamyoffer', dataOfMyOffer);
app.use('/deluser', delUser);
app.use('/getdatauserlist', getDataUserList);
app.use('/updatepay', updatePay);
app.use('/addnewoffer', addOffer);
app.use('/addoffer', addNewOffer);
app.use('/edituseradd', editUserAdd);
app.use('/admincutomsoffer', getListCustomOffer);
app.use('/logout', logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
