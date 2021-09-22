var express = require('express');
var router = express.Router();
let dbCon = require('../lib/db');
var moment = require('moment');


var ordersearch;
/* GET users listing. */
router.get('/', function(req, res, next) {

  try {
      res.render('users/menu',{
        pack_id: req.query.pack_id,
      })
  } catch(e){
      next(e);
  }
});


router.post('/check',(req, res, next) => {
  let pack_id = req.body.pack_id;
  let errors = false;
  if (req.query.pack_id != null){
    errors = true;
    pack_id = req.query.pack_id;
  }

  if (pack_id.length === 0) {
    pack_id = 0;
    errors = true;
    // set flash message
    req.flash('error', 'Please enter UID');
    // render to add.ejs with flash message
    res.redirect('/users');
}
  if(!errors){
    pack_id = pack_id;
    dbCon.query('SELECT * FROM order_packaging WHERE pack_id = ?',pack_id, (err, rows) => {
      if (err) {
          req.flash('error', err);
          res.render('users/checkbyid', { pack_id: pack_id ,data: '' , moment: moment});
      }else{
          
          res.render('users/checkbyid', { pack_id: pack_id, data: rows , moment: moment});
      }
    }) 
  }
})


module.exports = router;
