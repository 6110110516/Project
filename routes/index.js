var express = require('express');
var router = express.Router();
var moment = require('moment');
let dbCon = require('../lib/db');
const bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/data');
});

router.get('/login', function(req, res, next) {
  // let backURL;
  if(req.query.backURL ){
    backURL = req.query.backurl;
  }
  else{
    backURL = req.header('Referer') || '/';
  }
  console.log(backURL);
  res.render('login',{backURL: backURL});
});

module.exports = router;
