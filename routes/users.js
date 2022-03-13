var express = require('express');
var router = express.Router();
let dbCon = require('../lib/db');
var moment = require('moment');


var ordersearch;
/* GET users listing. */
router.get('/', function(req, res, next) {
let pack_id = req.query.pack_id
  try {
      if(pack_id == null)
        res.render('users/menu',{
          order_id: req.query.pack_id,
        })
      else
        res.redirect('/users/check?pack_id='+pack_id)  

  } catch(e){
      next(e);
  }
}); 

router.get('/check',(req, res, next) => {
  let order_id  = req.query.pack_id;
  let errors = false;
  
 
  if (order_id == null) {
    order_id = 0;
    errors = true;
    // set flash message
    req.flash('error', 'Please enter ID');
    // render to add.ejs with flash message
    res.redirect('/users');
}
  if(!errors){
    dbCon.query('SELECT * FROM order_packaging WHERE pack_id = ?',order_id, (err, rows) => {
      if (err) {
          req.flash('error', err);
          res.render('users/checkbyid', { pack_id: order_id ,data: '' , moment: moment});
      }else{
          
          res.render('users/checkbyid', { pack_id: order_id, data: rows , moment: moment});
      }
    }) 
  }
})

router.post('/check',(req, res, next) => {
  let order_id = req.body.order_id;
  let errors = false;
  if (req.query.pack_id != null){
    errors = true;
    order_id = req.query.pack_id;
  }

  if (order_id == null) {
    order_id = 0;
    errors = true;
    // set flash message
    req.flash('error', 'Please enter ID');
    // render to add.ejs with flash message
    res.redirect('/users');
}
  if(!errors){
    dbCon.query('SELECT * FROM order_packaging WHERE pack_id = ?',order_id, (err, rows) => {
      if (err) {
          req.flash('error', err);
          res.render('users/checkbyid', { pack_id: order_id ,data: '' , moment: moment});
      }else{
          
          res.render('users/checkbyid', { pack_id: order_id, data: rows , moment: moment});
      }
    }) 
  }
})

router.get('/infoinp', (req, res, next) => {
  let pack_id = req.query.pack_id;
  dbCon.query('SELECT * FROM order_packaging WHERE pack_id = ?',pack_id, (err, rows) => {
      if (err) {
          req.flash('error', err);
          res.render('tagpackaging/listcrabinpack', { data: ''});
      }else{
          dbCon.query('SELECT * FROM update_status WHERE pack_id = ? ORDER BY num',pack_id, (err, rows2) => {
              if (err) {
                  req.flash('error', err);
                  res.render('tagpackaging/listcrabinpack', {  data: rows , moment: moment});
              }else{
                  dbCon.query('SELECT * FROM info_list WHERE id = ?',rows[0].place_id, (err, rows3) => {
                    if (err) {
                        req.flash('error', err);
                        res.render('tagpackaging/listcrabinpack', { data: rows , data_up: rows2, moment: moment});
                    }else{
                        res.render('tagpackaging/listcrabinpack', { data: rows , data_up: rows2,place: rows3[0].name_place, moment: moment});
                        
                    }
                  });                  
              }
          });  

      }
  });
})

router.get('/infofarm', (req, res, next) => {
  let id = req.query.id;

  dbCon.query('SELECT * FROM info_list WHERE id = ?',id, (err, rows) => {
      if (err) {
          req.flash('error', err);
          res.render('users/infofarm', { data: ''});
      }else{
      
          res.render('users/infofarm', { data: rows });

      }
  });
})

// router.post('/check',(req, res, next) => {
//   let order_id = req.body.order_id;
//   let errors = false;
//   if (req.query.order_id != null){
//     errors = true;
//     order_id = req.query.order_id;
//   }

//   if (order_id.length === 0) {
//     order_id = 0;
//     errors = true;
//     // set flash message
//     req.flash('error', 'Please enter UID');
//     // render to add.ejs with flash message
//     res.redirect('/users');
// }
//   if(!errors){
//     dbCon.query('SELECT * FROM order_list WHERE order_id = ?',order_id, (err, rows) => {
//       if (err) {
//           req.flash('error', err);
//           res.render('users/checkbyid', { order_id: order_id ,data: '' , moment: moment});
//       }else{
          
//           res.render('users/checkbyid', { order_id: order_id, data: rows , moment: moment});
//       }
//     }) 
//   }
// })


module.exports = router;
