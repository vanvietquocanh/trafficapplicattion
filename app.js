var express = require('express');
var path = require('path');
var passport = require("passport")
var bodyParser = require('body-parser');
var FacebookStrategy = require('passport-facebook');
var session = require("express-session");
var infoAPI = require("./routes/apiInfo.js");


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
var apiGetDataReportClick = require('./routes/apiGetDataReportClick');
var listNetwork = require('./routes/listNetwork');
var filter = require('./routes/filter');
var updateNetwork = require('./routes/updateNetwork');
var conversionlist = require('./routes/apiConversionData');
var addNetwork = require('./routes/addNetwork');
var search = require('./routes/search');
var postback = require('./routes/postBack');
var routeShowRequest = require('./routes/routeShowRequest');
var apiRequestOfUser = require('./routes/apiRequestOfUser');
var requestList = require('./routes/requestList');
var responOfAdmin = require('./routes/responOfAdmin');
var updatePay = require('./routes/updatePay');
var delRequest = require('./routes/delRequest');
var dataOfMyOffer = require('./routes/dataOfMyOffer');
var logout = require('./routes/logout');

var app = express();
app.enable('trust proxy')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/checkparameter', checkParameter);
app.use('/tracking', postback);
app.use(session(
                { secret: 'coppycat',
                  resave: false,
                  saveUninitialized: false,
                  cookie:{
                    maxAge: 86400000,
                  }
                }
              ));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new FacebookStrategy(infoAPI, function(accessToken, refreshToken, profile, done) {
      done(null, profile);
    }))
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
app.use('/datamyoffer', dataOfMyOffer);
app.use('/updatepay', updatePay);
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
