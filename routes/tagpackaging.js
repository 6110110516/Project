express = require('express');
let router = express.Router();
let dbCon = require('../lib/db');
var moment = require('moment');
const e = require('express');
var axios = require('axios');

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
    let errors = false;
    let quertxt;
    let directq;
    
    quertxt = "INSERT INTO tagnfc_packaging SET uid = ?, pack_id_temp = null";
    directq = '/data/packagetagoption';
    
    if (uid.length == 0 ) {
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
                res.redirect(directq+"?uid="+uid);
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

router.get('/listpacking', (req, res, next) => {
    let crab_id = req.query.crab_id;
    dbCon.query('SELECT * FROM order_packaging WHERE statu = 0 ORDER BY pack_id DESC', (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('tagpackaging/listpacking', { data: ''});
        }else{
            res.render('tagpackaging/listpacking', { crab_id: crab_id ,data: rows , moment: moment});
        }
    });
})

router.get('/listordering', (req, res, next) => {
    let pack_id = req.query.pack_id;
    dbCon.query('SELECT * FROM order_list WHERE statu = 0 ORDER BY order_id DESC', (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('tagpackaging/listordering', { data: ''});
        }else{
            res.render('tagpackaging/listordering', { pack_id: pack_id ,data: rows , moment: moment});
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
            res.render('tagpackaging/listpackinorder', { order_id: order_id,data: ''});
        }else{
            res.render('tagpackaging/listpackinorder', { order_id:order_id,data: rows , moment: moment});
        }
    });
})

router.get('/listcrabinp', (req, res, next) => {
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
                    res.render('tagpackaging/listcrabinpack', { data: rows , data_up: rows2, moment: moment});
                }
            });        
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

router.get('/deletecrablist', (req, res, next) => {
    let crab_id = req.query.crab_id;
    backURL=req.header('Referer') || '/';
    dbCon.query('DELETE FROM crab_farm WHERE crab_id = ?',crab_id, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data/listcrab');
        }else{
            dbCon.query('UPDATE tagnfc_farm SET crab_id_temp = null WHERE crab_id_temp = ?',crab_id, (err, rows) => {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/data');
                }else{
                    req.flash('success', 'tagNFC successfully deleted');
                    res.redirect(backURL);   
                }
            });
                 
        }
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

router.get('/deletepacklist', (req, res, next) => {
    let pack_id = req.query.pack_id;
    backURL=req.header('Referer') || '/';
        dbCon.query('UPDATE tagnfc_packaging SET pack_id_temp = null WHERE pack_id_temp = ?',pack_id, (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/data');
            }else{
                req.flash('success', 'tagNFC successfully deleted');
                res.redirect(backURL);   
            }
        });
})

router.get('/deleteupstatus', (req, res, next) => {
    let num = req.query.num;
    backURL=req.header('Referer') || '/';

    dbCon.query('DELETE FROM update_status WHERE num = ?',num, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data');
        }else{
            req.flash('success', 'ลบแล้ว');
            res.redirect(backURL);   
        }
    });
})

router.post('/editamount', (req, res, next) => {
    let amount = req.body.amount;
    let pack_id = req.query.pack_id;
    backURL=req.header('Referer') || '/';
    let sqlt = 'UPDATE order_packaging SET amount_crab = "'+amount+'" WHERE pack_id = '+pack_id;

    dbCon.query(sqlt, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data');
        }else{
            req.flash('success', 'บันทึกแล้ว');
            res.redirect(backURL);   
        }
    });
})

router.get('/packagetagoption', (req, res, next) => {
    let pack_id;
    let uid = req.query.uid;
    
    dbCon.query('SELECT * FROM tagnfc_packaging WHERE uid = ?',uid, (err, rows) => {
        if (err || uid.length == 0) {
            console.log(err);
            req.flash('error', err);
            res.redirect('/data');
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
                    if(pack_id == null){
                        res.render('scantag/packagetagoption', { uid: uid,data: rows});
                    }
                    else
                        dbCon.query('SELECT * FROM update_status WHERE pack_id = ? ORDER BY num',pack_id, (err2, rows2) => {
                            if (err2) {
                                req.flash('error', err2);
                                res.redirect('/data');
                            }else{
                                res.render('scantag/packagetagoption', { uid: uid,data: rows,data_up: rows2 , moment: moment});
                            }
                        });  
            });
        }
    });
})   

router.get('/packagetagoption/edit', (req, res, next) => {
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
                    dbCon.query('SELECT * FROM update_status WHERE pack_id = ? ORDER BY num',pack_id, (err2, rows2) => {
                        if (err2) {
                            req.flash('error', err2);
                            res.redirect('/data');
                        }else{
                            res.render('scantag/packagetagoptionedit', { uid: uid,data: rows,data_up: rows2 , moment: moment});
                        }
                    });  
            });
        }
    });
})   

router.get('/farmtagoption', (req, res, next) => {
    let crab_id;
    let uid = req.query.uid;
    let dataj;

    axios.get('https://connexthings.io/device/6HYNgGw2XnBZB0oihLQN/reportedStates?fbclid=IwAR2NsNwVWlQa17e7ot4iGbh3rIAp1WDS5XkgZghvpgEWU0Sj0dEkyUuisTI')
    .then(resj => {
        dataj = resj.data;
        console.log(dataj);

        dbCon.query('SELECT * FROM tagnfc_farm WHERE uid = ?',uid, (err, rows) => {
        if (err) {
            console.log(err);
            req.flash('error', err);
            req.redirect('/data/farmtag');
        }
        else{
            
            crab_id = rows[0].crab_id_temp;
            dbCon.query('SELECT * FROM crab_farm WHERE crab_id = "?"',crab_id, (err, rows) => {
                    if (err) {
                        console.log(err);
                        req.flash('error', err);
                        res.render('scantag/farmtagoption', { uid: uid,dataj: dataj});
                    }
                    else
                        res.render('scantag/farmtagoption', { uid: uid,dataj: dataj,data: rows , moment: moment});
            });
        }
    });

    
    }).catch(error => {
        console.errer(errer);
    });
 
    
})   

router.post('/crabstart', (req, res, next) => {
    let uid = req.query.uid;
    let amount = req.body.amount;
    let crab_id;
    let sqlt;
    let errors = false;
    backURL=req.header('Referer') || '/';
    console.log(amount);
    let quertxt = "INSERT INTO crab_farm SET uid = '"+uid+"',amount_crab = "+amount;

    if (amount == null ) {
        errors = true;
        // set flash message
        req.flash('error', 'กรอกข้อมูลให้ครบ');
        // render to add.ejs with flash message
        res.redirect(backURL);
        // res.render('tagpackaging/farmtagoption?uid='+uid, {
        //     uid: uid,
        // })
    }


    if(!errors){
        dbCon.query(quertxt, (err, result) => {
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
    }
})   

router.post('/packstart', (req, res, next) => {
    let uid = req.query.uid;
    let amount = req.body.amount
    let pack_id;
    let sqlt2;
    let sqlt1 = 'INSERT INTO order_packaging SET uid = "'+uid+'" , amount_crab = '+amount;
    dbCon.query(sqlt1, (err, result) => {
            if (err) {
                console.log(err);
                req.flash('error', err);
                res.render('scantag/packagetagoption', { uid: uid});
            }
            else{
                // res.redirect('/data/crabupdate?uid='+uid);
                pack_id = result.insertId;
                sqlt2 = 'UPDATE tagnfc_packaging SET pack_id_temp = '+pack_id+' WHERE uid = "'+uid+'"';

                dbCon.query(sqlt2, (err1, rows1) => {
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

router.get('/createorder', (req, res, next) => {
    backURL=req.header('Referer') || '/';
    dbCon.query('INSERT INTO order_list SET statu = 0', (err, result) => {
            if (err) {
                console.log(err);
                req.flash('error', err);
                res.redirect(backURL); 
            }
            else{
                res.redirect(backURL); 
            }   
        });
})   

router.get('/crabmolt', (req, res, next) => {
    let crab_id = req.query.crab_id;
    let c = req.query.c;
    dbCon.query('UPDATE crab_farm SET statu = 1, molt_date = CURRENT_TIMESTAMP WHERE crab_id = ?',crab_id, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data/farmtag');
        }else{
            dbCon.query('UPDATE tagnfc_farm SET crab_id_temp = null WHERE crab_id_temp = ?',crab_id, (err, rows) => {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/data');
                }else{
                    req.flash('success', 'tagNFC successfully deleted');
                    if(c==0)
                    res.redirect('/data/listcrab');
                    else if(c==1)
                    res.redirect('/data/listpacking?crab_id='+crab_id);
                    else    
                    res.redirect('/data/farmtag');
                }
            });
        }
    });
})

router.get('/packfinish', (req, res, next) => {
    let pack_id = req.query.pack_id;
    dbCon.query('UPDATE order_packaging SET statu = 1, finish_date = CURRENT_TIMESTAMP WHERE pack_id = ?',pack_id, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data');
        }else{
            req.flash('success', 'tagNFC successfully deleted');
            res.redirect('/data/listordering?pack_id='+pack_id);
        }
    });
})

router.get('/packupdate', (req, res, next) => {
    let pack_id = req.query.pack_id;
    let uid = req.query.uid;
    // res.redirect('/users');
    res.render('tagpackaging/packupdate', { pack_id: pack_id, uid: uid});

})

router.post('/updata', (req, res, next) => {
    let updatetxt = req.body.updatetxt;
    let reason = req.body.reason;
    let pack_id = req.query.pack_id;
    let uid = req.query.uid;
    let sqlt;
    let errors = false;
    let txt;
    if((reason == 0  &&updatetxt.length === 0 )||reason == null){
        errors = true;
        // set flash message
        req.flash('error', 'กรอกข้อมูลให้ครบ');
        res.redirect('/data/packupdate?pack_id='+pack_id); 
    }

    if(!errors){
        
        if(reason == 1)
            txt = "บรรจุปู";
        else if (reason == 2)
            txt = "นำส่งปู";
        else if (reason == 0)
            txt = updatetxt;
        else{
            console.log("กรอกข้อมูลให้ครบ");
            req.flash('error', "กรอกข้อมูลให้ครบ");
            res.redirect('/data/packupdate?pack_id='+pack_id); 
        }    
        console.log(txt);
        sqlt = 'INSERT INTO update_status SET pack_id = '+pack_id+', update_pack = "'+txt+'"';
        dbCon.query(sqlt, (err, result) => {
                if (err) {
                    console.log(err);
                    req.flash('error', err);
                    res.redirect('/data/packupdate?pack_id='+pack_id);
                }
                else{
                    req.flash('success', 'บันทึกแล้ว');
                    res.redirect('/data/packagetagoption?uid='+uid);
                    // res.render('scantag/packagetagoption', { uid: uid});
                }   
            });
    }
})  

router.get('/packing', (req, res, next) => {
    let crab_id = req.query.crab_id;
    let pack_id = req.query.pack_id

    let sqlt = "UPDATE crab_farm SET statu = 2, pack_id = "+pack_id+" WHERE crab_id = "+crab_id;
    dbCon.query(sqlt, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data/farmtag');
        }else{

            dbCon.query('SELECT * FROM order_packaging WHERE pack_id = ?',pack_id, (err1, rows1) => {
                if (err1) {
                    console.log(err1);
                    req.flash('error', err1);
                    res.redirect('/data/farmtag');
                }
                else
                // console.log();
                sqlt = "UPDATE order_packaging SET amount_crab = "+(rows1[0].amount_crab+1)+" WHERE pack_id = "+pack_id;
                dbCon.query(sqlt, (err2, rows2) => {
                    if (err2) {
                        req.flash('error', err2);
                        res.redirect('/data/farmtag');
                    }else{
                        req.flash('success', ' successfully ');
                        res.redirect('/data/listcrabinp?pack_id='+pack_id);
                    }
                });    
            });
                
        }
    });
})

router.get('/ordering', (req, res, next) => {
    let order_id = req.query.order_id;
    let pack_id = req.query.pack_id
    let sqlt = "UPDATE order_packaging SET statu = 2, order_id = "+order_id+" WHERE pack_id = "+pack_id;
                    console.log(sqlt);
    dbCon.query(sqlt, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.redirect('/data');
        }else{

            dbCon.query('SELECT * FROM order_list WHERE order_id = ?',order_id, (err1, rows1) => {
                if (err1) {
                    console.log(err1);
                    req.flash('error', err1);
                    res.redirect('/data');
                }
                else
                // console.log();
                sqlt = "UPDATE order_list SET pack_amount = "+(rows1[0].pack_amount+1)+" WHERE order_id = "+order_id;
                dbCon.query(sqlt, (err2, rows2) => {
                    if (err2) {
                        req.flash('error', err2);
                        res.redirect('/data');
                    }else{
                        req.flash('success', ' successfully ');
                        res.redirect('/data/listpackino?order_id='+order_id);
                    }
                });    
            });
                
        }
    });
})

module.exports = router;
