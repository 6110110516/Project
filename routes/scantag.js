var express = require('express');
var router = express.Router();
let dbCon = require('../lib/db');
var moment = require('moment');


router.get('/', (req, res, next) => {
    let uid = req.query.uid
    if(uid != null)
    dbCon.query('SELECT * FROM tagnfc_packaging WHERE uid = ?',uid, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data');
        }else 
            if(rows.length === 0)
                dbCon.query('SELECT * FROM tagnfc_farm WHERE uid = ?',uid, (err2, rows2) => {
                    if (err2) {
                        req.flash('error', err2);
                        res.redirect('/data/farmtag');
                    }else{
                        if(rows2.length === 0)
                            res.render('tagpackaging/add', {
                                uid: req.query.uid
                            })
                        else
                        res.redirect('/data/farmtagoption?uid='+uid);
                    }
                });
            else{
                res.redirect('/data/packagetagoption?uid='+uid);
            } 
    });
    else
        res.redirect('/data');
})

// router.get('/packagetagoption', (req, res, next) => {
//     let pack_id;
//     let uid = req.query.uid;
//     dbCon.query('SELECT * FROM tagnfc_packaging WHERE uid = ?',uid, (err, rows) => {
//         if (err) {
//             console.log(err);
//             req.flash('error', err);
//             req.redirect('/data');
//         }
//         else{
//             pack_id = rows[0].pack_id_temp;
//             dbCon.query('SELECT * FROM order_packaging WHERE pack_id = "?"',pack_id, (err, rows) => {
//                 if (err) {
//                     console.log(err);
//                     req.flash('error', err);
//                     res.redirect('/data');
//                 }
//                 else{
//                     dbCon.query('SELECT * FROM update_status WHERE pack_id = ? ORDER BY num',pack_id, (err2, rows2) => {
//                         if (err2) {
//                             req.flash('error', err2);
//                             res.redirect('/data');
//                         }else{
//                             res.render('scantag/packagetagoption', { uid: uid,data: rows,data_up: rows2 , moment: moment});
//                         }
//                     });       
//                 }
//             });
//         }
//     });
// })   

// router.get('/farmtagoption', (req, res, next) => {
//     let crab_id;
//     let uid = req.query.uid;
//     let Jsonget = "https://connexthings.io/device/6HYNgGw2XnBZB0oihLQN/reportedStates?fbclid=IwAR2NsNwVWlQa17e7ot4iGbh3rIAp1WDS5XkgZghvpgEWU0Sj0dEkyUuisTI"
//     dbCon.query('SELECT * FROM tagnfc_farm WHERE uid = ?',uid, (err, rows) => {
//         if (err) {
//             console.log(err);
//             req.flash('error', err);
//             req.redirect('/data/farmtag');
//         }
//         else{
//             crab_id = rows[0].crab_id_temp;
//             dbCon.query('SELECT * FROM crab_farm WHERE crab_id = ? ',crab_id, (err, rows) => {
//                     if (err) {
//                         console.log(err);
//                         req.flash('error', err);
//                         res.render('scantag/farmtagoption', { uid: uid });
//                     }
//                     else
//                         res.render('scantag/farmtagoption', { uid: uid, data: rows , moment: moment});
//             });
//         }
//     });
// })   
module.exports = router;