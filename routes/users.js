var express = require('express');
var router = express.Router();
let dbCon = require('../lib/db');
var moment = require('moment');


var ordersearch;
/* GET users listing. */
router.get('/', function(req, res, next) {

  try {
      res.render('users/menu',{
        order_id: req.query.order_id,
      })
  } catch(e){
      next(e);
  }
});


router.post('/check',(req, res, next) => {
  let order_id = req.body.order_id;
  let errors = false;
  if (req.query.order_id != null){
    errors = true;
    order_id = req.query.order_id;
  }

  if (order_id.length === 0) {
    order_id = 0;
    errors = true;
    // set flash message
    req.flash('error', 'Please enter UID');
    // render to add.ejs with flash message
    res.redirect('/users');
}
  if(!errors){
    dbCon.query('SELECT * FROM order_list WHERE order_id = ?',order_id, (err, rows) => {
      if (err) {
          req.flash('error', err);
          res.render('users/checkbyid', { order_id: order_id ,data: '' , moment: moment});
      }else{
          
          res.render('users/checkbyid', { order_id: order_id, data: rows , moment: moment});
      }
    }) 
  }
})


module.exports = router;
