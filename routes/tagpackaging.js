express = require('express');
let router = express.Router();
let dbCon = require('../lib/db');
var moment = require('moment');
const e = require('express');

router.get('/', (req, res, next) => {
    dbCon.query('SELECT * FROM tagnfc_packaging ORDER BY uid', (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('tagpackaging/packagetag', { data: ''});
        }else{
            res.render('tagpackaging/packagetag', { data: rows });
        }
    })
})
router.get('/farmtag', (req, res, next) => {
    dbCon.query('SELECT * FROM tagnfc_farm ORDER BY uid', (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('tagpackaging/farmtag', { data: ''});
        }else{
            res.render('tagpackaging/farmtag', { data: rows });
        }
    })
})

router.get('/add', (req, res, next) => {
    try {
        res.render('tagpackaging/add', {
            uid: req.query.uid
        })
    } catch(e){
        next(e);
    }
})

router.post('/add', (req, res, next) => {
    let uid = req.body.uid;
    let tagtype = req.body.typetag;
    let errors = false;
    let quertxt;
    let directq;
    if(tagtype == "crab"){
        quertxt = "INSERT INTO tagnfc_farm SET uid= ?, crab_id_temp =null";
        directq = '/data/farmtag';
    }
    else if(tagtype == "package"){
        quertxt = "INSERT INTO tagnfc_packaging SET uid = ?, pack_id_temp = null";
        directq = '/data';
    }
    if (uid.length === 0 || tagtype == null) {
        errors = true;
        // set flash message
        req.flash('error', 'กรอกข้อมูลให้ครบ');
        // render to add.ejs with flash message
        res.render('tagpackaging/add', {
            uid: uid,
        })
    }

    // if no error
    if (!errors) {
        let form_data = {
            uid: uid,
            pack_id_temp: null
        }

        // insert query
        dbCon.query(quertxt, uid, (err, result) => {
            if (err) {
                req.flash('error', err)

                res.render('tagpackaging/add', {
                    uid: form_data.uid,
                    // order: form_data.author
                })
            } else {
                req.flash('success', 'tagNFC successfully added');
                res.redirect(directq);
            }
        })
    }
})

router.get('/listpack', (req, res, next) => {

    dbCon.query('SELECT * FROM order_packaging ORDER BY pack_id DESC', (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('tagpackaging/listpack', { data: ''});
        }else{
            res.render('tagpackaging/listpack', { data: rows , moment: moment});
        }
    });
})

router.get('/listorder', (req, res, next) => {

    dbCon.query('SELECT * FROM order_list ORDER BY order_id DESC', (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('tagpackaging/listorder', { data: ''});
        }else{
            res.render('tagpackaging/listorder', { data: rows , moment: moment});
        }
    });
})

router.get('/listcrab', (req, res, next) => {

    dbCon.query('SELECT * FROM crab_farm ORDER BY crab_id DESC', (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('tagpackaging/listcrab', { data: ''});
        }else{
            res.render('tagpackaging/listcrab', { data: rows , moment: moment});
        }
    });
})

router.get('/listpackino', (req, res, next) => {
    let order_id = req.query.order_id;
    dbCon.query('SELECT * FROM order_packaging WHERE order_id = ?',order_id, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('tagpackaging/listpackinorder', { data: ''});
        }else{
            res.render('tagpackaging/listpackinorder', { data: rows , moment: moment});
        }
    });
})

router.get('/listcrabinp', (req, res, next) => {
    let pack_id = req.query.pack_id;
    dbCon.query('SELECT * FROM crab_farm WHERE pack_id = ?',pack_id, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('tagpackaging/listcrabinpack', { data: ''});
        }else{
            res.render('tagpackaging/listcrabinpack', { data: rows , moment: moment});
        }
    });
})

router.get('/deletecrab', (req, res, next) => {
    let uid = req.query.uid;
    dbCon.query('DELETE FROM tagnfc_farm WHERE uid = ?',uid, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data/farmtag');
        }else{
            req.flash('success', 'tagNFC successfully deleted');
            res.redirect('/data/farmtag');        }
    });
})
router.get('/deletepack', (req, res, next) => {
    let uid = req.query.uid;
    dbCon.query('DELETE FROM tagnfc_packaging WHERE uid = ?',uid, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data');
        }else{
            req.flash('success', 'tagNFC successfully deleted');
            res.redirect('/data');
        }
    });
})

router.get('/packagetagoption', (req, res, next) => {
    let pack_id;
    let uid = req.query.uid;
    dbCon.query('SELECT * FROM tagnfc_packaging WHERE uid = ?',uid, (err, rows) => {
        if (err) {
            console.log(err);
            req.flash('error', err);
            req.redirect('/data');
        }
        else{
            pack_id = rows[0].pack_id_temp;
            dbCon.query('SELECT * FROM order_packaging WHERE pack_id = "?"',pack_id, (err, rows) => {
                if (err) {
                    console.log(err);
                    req.flash('error', err);
                    res.redirect('/data');
                }
                else
                    res.render('scantag/packagetagoption', { uid: uid,data: rows , moment: moment});
            });
        }
    });
})   

router.get('/farmtagoption', (req, res, next) => {
    let crab_id;
    let uid = req.query.uid;
    dbCon.query('SELECT * FROM tagnfc_farm WHERE uid = ?',uid, (err, rows) => {
        if (err) {
            console.log(err);
            req.flash('error', err);
            req.redirect('/data/farmtag');
        }
        else{
            crab_id = rows[0].crab_id_temp;
            dbCon.query('SELECT * FROM crab_farm WHERE crab_id = ?',crab_id, (err, rows) => {
                    if (err) {
                        console.log(err);
                        req.flash('error', err);
                        res.render('scantag/farmtagoption', { uid: uid});
                    }
                    else
                        res.render('scantag/farmtagoption', { uid: uid,data: rows , moment: moment});
            });
        }
    });
})   

router.post('/crabstart', (req, res, next) => {
    let uid = req.query.uid;
    let crab_id;
    let sqlt;
    dbCon.query('INSERT INTO crab_farm SET uid = ?',uid, (err, result) => {
            if (err) {
                console.log(err);
                req.flash('error', err);
                res.render('scantag/farmtagoption', { uid: uid});
            }
            else{
                // res.redirect('/data/crabupdate?uid='+uid);
                crab_id = result.insertId;
                sqlt = 'UPDATE tagnfc_farm SET crab_id_temp = '+crab_id+' WHERE uid = "'+uid+'"';

                dbCon.query(sqlt, (err1, rows1) => {
                    if (err1) {

                        console.log(err1);
                        req.flash('error', err1);
                        res.render('scantag/farmtagoption', { uid: uid});
                    }
                    else
                        res.redirect('/data/farmtagoption?uid='+uid);
                });
            }   
        });
})   

router.post('/packstart', (req, res, next) => {
    let uid = req.query.uid;
    let pack_id;
    let sqlt;
    dbCon.query('INSERT INTO order_packaging SET uid = ?',uid, (err, result) => {
            if (err) {
                console.log(err);
                req.flash('error', err);
                res.render('scantag/packagetagoption', { uid: uid});
            }
            else{
                // res.redirect('/data/crabupdate?uid='+uid);
                pack_id = result.insertId;
                sqlt = 'UPDATE tagnfc_packaging SET pack_id_temp = '+pack_id+' WHERE uid = "'+uid+'"';

                dbCon.query(sqlt, (err1, rows1) => {
                    if (err1) {

                        console.log(err1);
                        req.flash('error', err1);
                        res.render('scantag/packagetagoption', { uid: uid});
                    }
                    else
                        res.redirect('/data/packagetagoption?uid='+uid);
                });
            }   
        });
})   


module.exports = router;