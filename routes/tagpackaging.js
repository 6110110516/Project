express = require('express');
let router = express.Router();
let dbCon = require('../lib/db');
var moment = require('moment');
const e = require('express');
var axios = require('axios');
const cookieParser = require("cookie-parser");
var session = require('express-session');
var path = require('path');
const bodyParser = require('body-parser');
var app = express();

const expiresTime = 1000 * 60 *15;

app.use(session({
    secret: 'secret',
    resave: false,
    cookie: { priority: 0 },
    saveUninitialized: true,
    // priority: 0

}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

router.get('/', (req, res, next) => {
    if(req.session.loggedin){
        dbCon.query('SELECT * FROM tagnfc_packaging ORDER BY uid', (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.render('tagpackaging/packagetag', { data: ''});
            }else{
                res.render('tagpackaging/packagetag', { data: rows });
            }
        })
    }else {
        
        res.redirect('/data/login?backurl=/');
    }
})

router.get('/login', function(req, res, next) {
    let backURL;
    if(req.session.loggedin){
        res.redirect('/data');
    } else { 
        
        if(req.query.backurl ){ 
            backURL = req.query.backurl;
            
        }else{
           
            backURL = req.header('Referer') || '/';
        
        }
        console.log(backURL);
        res.render('login',{backURL: backURL});
    }
  });

router.post('/auth', (req,res) => {
    var username = req.body.username;
    var password = req.body.password;
    let backURL = req.query.backurl;
    // console.log(username);
    // console.log(password);
    
    let sqlt = 'SELECT * FROM accounts WHERE username = "'+username+'" AND password = PASSWORD("'+password+'")';
    if (username && password) {
        dbCon.query(sqlt , (err, results, fields) => {
            console.log(results[0].username);

            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.priority = results[0].priority;
                req.session.username = username;
                req.session.cookie.maxAge = expiresTime;
                req.flash('success','Welcome back,'+req.session.username+'!');
                res.redirect(backURL);
            }else{
                console.log("Incorrect");
                req.flash('error','Incorrect Username or Password');
                res.redirect('/data/login?backurl='+backURL);
            }
            
        });
    }else {
        
        console.log("not enter");
        req.flash('error','Please enter Username and Password!');
        res.redirect('/data/login?backurl='+backURL);
    }

});

router.get('/logout', (req, res) => {
    if(req.session.loggedin){
        req.session.destroy(function (err){
            console.log("logout!");
            res.redirect('/data/login')
        });
    }else{
        res.redirect('/data/login')
    }    
    
});

router.get('/accounts', (req, res, next) => {
    if(req.session.loggedin){
        dbCon.query('SELECT * FROM accounts ORDER BY id DESC', (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/data');
            }else{
                // console.log(req.session.priority);
                if(req.session.priority == 0){
                    req.flash('error', 'Your account not priority');
                    res.redirect('/data');
                } else if (req.session.priority == 1){
                    res.render('tagpackaging/accounts', { data: rows }); 
                } else {
                    req.flash('error', 'Error');
                    res.redirect('/data');
                }
                
            }
        });
    }else {
        res.redirect('/data/login?backurl=/data/accounts');
    }
})

router.get('/add', (req, res, next) => {
    if(req.session.loggedin){
        console.log(req.session.username+"  loggedin");
        console.log(req.session)
    try {
        res.render('tagpackaging/add', {
            uid: req.query.uid
        })
    } catch(e){
        next(e);
    }
    }else {
        
        res.redirect('/data/login?backurl=/data/add');
    }
})

router.post('/add', (req, res, next) => {
    let uid = req.body.uid;
    let errors = false;
    let quertxt;
    let directq;
    if(req.session.loggedin){
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
    }else {
        res.redirect('/data/login?backurl=/data/add');
    }    
})

router.get('/listpack', (req, res, next) => {
    if(req.session.loggedin){
        dbCon.query('SELECT * FROM order_packaging ORDER BY pack_id DESC', (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.render('tagpackaging/listpack', { data: ''});
            }else{
                res.render('tagpackaging/listpack', { data: rows , moment: moment});
            }
        });
    }else {
        res.redirect('/data/login?backurl=/data/listpack');
    }
})


router.get('/deletepack', (req, res, next) => {
    let uid = req.query.uid;
    backURL=req.header('Referer') || '/';
    if(req.session.loggedin){
        dbCon.query('DELETE FROM tagnfc_packaging WHERE uid = ?',uid, (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/data');
            }else{
                req.flash('success', 'tagNFC successfully deleted');
                res.redirect('/packagetagoption');
            }
        });
    }else {
        res.redirect('/data/login?backurl='+backURL);

    }    
})

router.get('/deletepacklist', (req, res, next) => {
    let pack_id = req.query.pack_id;
    backURL=req.header('Referer') || '/';
    if(req.session.loggedin){
        dbCon.query('UPDATE tagnfc_packaging SET pack_id_temp = null WHERE pack_id_temp = ?',pack_id, (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/data');
            }else{
                req.flash('success', 'tagNFC successfully deleted');
                res.redirect(backURL);   
            }
        });
    }else {
        res.redirect('/data/login?backurl='+backURL);
    }    
})

router.get('/endpack', (req, res, next) => {
    let uid = req.query.uid;
    let pack_id = req.query.pack_id;
    let txt = "สิ้นสุดการใช้งาน";
    let date_ = new Date();    
    let date_tz = date_.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
    let start_date = moment(date_tz).format("YYYY-MM-DD HH:mm:ss")

    backURL=req.header('Referer') || '/';
    if(req.session.loggedin){
        sqlt = 'INSERT INTO update_status SET pack_id = '+pack_id+', update_pack = "'+txt+'",timestamp = "'+start_date+'"';
        dbCon.query(sqlt, (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/data');
            }else{
                dbCon.query('UPDATE tagnfc_packaging SET pack_id_temp = null WHERE pack_id_temp = ?',pack_id, (err, rows) => {
                    if (err) {
                        req.flash('error', err);
                        res.redirect('/data');
                    }else{
                        req.flash('success', 'tagNFC successfully deleted');
                        res.redirect('packagetagoption?uid='+uid);
                    }
                }); 
            }
        });
    }else {
        res.redirect('/data/login?backurl='+backURL);
    }
})

router.get('/deleteupstatus', (req, res, next) => {
    let num = req.query.num;
    backURL=req.header('Referer') || '/';
    if(req.session.loggedin){
        dbCon.query('DELETE FROM update_status WHERE num = ?',num, (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/data');
            }else{
                req.flash('success', 'ลบแล้ว');
                res.redirect(backURL);   
            }
        });
    }else {
        res.redirect('/data/login?backurl='+backURL);
    }
})

router.post('/editamount', (req, res, next) => {
    let amount = req.body.amount;
    let pack_id = req.query.pack_id;
    backURL=req.header('Referer') || '/';
    if(req.session.loggedin){
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
    }else {
        res.redirect('/data/login?backurl='+backURL);
    }
})

router.post('/editweight', (req, res, next) => {
    let weight = req.body.weight;
    let pack_id = req.query.pack_id;
    backURL=req.header('Referer') || '/';
    if(req.session.loggedin){
        let sqlt = 'UPDATE order_packaging SET weight = "'+weight+'" WHERE pack_id = '+pack_id;

        dbCon.query(sqlt, (err, rows) => {
            if (err) {
                console.log(weight+"--"+pack_id)
                req.flash('error', err);
                res.redirect('/data');
            }else{
                req.flash('success', 'บันทึกแล้ว');
                res.redirect(backURL);   
            }
        });
    }else {
        res.redirect('/data/login?backurl='+backURL);
    }
})

router.post('/editplace', (req, res, next) => {
    let place = req.body.place;
    let pack_id = req.query.pack_id;
    backURL=req.header('Referer') || '/';
    if(req.session.loggedin){
        let sqlt = 'UPDATE order_packaging SET place = "'+place+'" WHERE pack_id = '+pack_id;

        dbCon.query(sqlt, (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/data');
            }else{
                req.flash('success', 'บันทึกแล้ว');
                res.redirect(backURL);   
            }
        });
    }else {
        res.redirect('/data/login?backurl='+backURL);
    }
})

router.post('/editmoltdate', (req, res, next) => {
    let molt_date = req.body.molt_date;
    let pack_id = req.query.pack_id;
    backURL=req.header('Referer') || '/';
    if(req.session.loggedin){
        let sqlt = 'UPDATE order_packaging SET molt_date = "'+molt_date+'" WHERE pack_id = '+pack_id;

        dbCon.query(sqlt, (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/data');
            }else{
                req.flash('success', 'บันทึกแล้ว');
                res.redirect(backURL);   
            }
        });
    }else {
        res.redirect('/data/login?backurl='+backURL);
    }
})

router.get('/packagetagoption', (req, res, next) => {
    let pack_id;
    let uid = req.query.uid;
    let backURL = '/data/packagetagoption?uid='+uid;
    if(req.session.loggedin){
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
                                    // console.log(rows2[0].timestamp);
                                    dbCon.query('SELECT * FROM info_list WHERE id = ?',rows[0].place_id, (err, rows3) => {
                                        if (err) {
                                            req.flash('error', err);
                                            res.render('scantag/packagetagoption', { data: rows , data_up: rows2, moment: moment});
                                        }else{
                                            res.render('scantag/packagetagoption', { uid: uid,data: rows , data_up: rows2 ,place: rows3[0].name_place, moment: moment});
                                            
                                  
                                        }
                                      });
                         
                                }
                            });  
                });
            }
        });
    }else {
        res.redirect('/data/login?backurl='+backURL);
    }
})   

router.get('/packagetagoption/more', (req, res, next) => {
    let pack_id;
    let uid = req.query.uid;
    if(req.session.loggedin){
        dbCon.query('SELECT * FROM tagnfc_packaging WHERE uid = ?',uid, (err, rows) => {
            if (err ) {
                console.log(err);
                req.flash('error', err);
                res.redirect('/data');
            }
            else{
                res.render('scantag/infomore',{uid:uid});
            }
        });
    }else {
        res.redirect('/data/login?backurl=/data/packagetagoption/more?uid='+uid);
    }
})   

router.get('/packagetagoption/edit', (req, res, next) => {
    let pack_id;
    let uid = req.query.uid;
    if(req.session.loggedin){

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
                                dbCon.query('SELECT * FROM info_list WHERE id = ?',rows[0].place_id, (err, rows3) => {
                                    if (err) {
                                        req.flash('error', err);
                                        res.render('scantag/packagetagoptionedit', { data: rows , data_up: rows2, moment: moment});
                                    }else{
                                        res.render('scantag/packagetagoptionedit', { uid: uid,data: rows , data_up: rows2 ,place: rows3[0].name_place, moment: moment});
                                        
                              
                                    }
                                });
                                
                            }
                        });  
                });
            }
        });
    }else {
        res.redirect('/data/login?backurl=/data/packagetagoption/edit?uid='+uid);
    }
})   

router.get('/farmtagoption', (req, res, next) => {//
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

router.post('/crabstart', (req, res, next) => {//
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
    let place = req.body.place
    let date_molt = req.body.date_molt
    let pack_id;
    let sqlt2;
    let date_ = new Date();    
    let date_tz = date_.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
    let start_date = moment(date_tz).format("YYYY-MM-DD HH:mm:ss")
    if(req.session.loggedin){
        // let start_date = date_tz.clone().tz('America/New_York')
        console.log(start_date);
        console.log(date_molt);

        let sqlt1 = 'INSERT INTO order_packaging SET uid = "'+uid+'" , amount_crab = '+amount+', place_id ='+place+',molt_date = "'+date_molt+'",start_date = "'+start_date+'"' ;
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
                        else{
                            let sqltext = 'INSERT INTO update_status SET pack_id = '+pack_id+', update_pack = "เริ่มใช้งาน", timestamp = "'+start_date+'"'
                            dbCon.query(sqltext, (err2, rows2) => {
                                if (err2) {
            
                                    console.log(err2);
                                    req.flash('error', err2);
                                    res.render('scantag/packagetagoption', { uid: uid});
                                }
                                else
                                
                                    res.redirect('/data/packagetagoption?uid='+uid);
                            });   
                                                        
                        }
                                    
                    });
                }   
        });
    }else {
        res.redirect('/data/login?backurl=/data/packagetagoption?uid='+uid);
    }
})   

router.get('/createorder', (req, res, next) => {//
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

router.get('/crabmolt', (req, res, next) => {//
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
    if(req.session.loggedin){
        res.render('tagpackaging/packupdate', { pack_id: pack_id, uid: uid});
    }else {
        res.redirect('/data/login?backurl=/data/packagetagoption?uid='+uid);
        
    }
})

router.post('/updata', (req, res, next) => {
    let updatetxt = req.body.updatetxt;
    let reason = req.body.reason;
    let pack_id = req.query.pack_id;
    let uid = req.query.uid;
    let sqlt;
    let errors = false;
    let txt;
    let date_ = new Date();    
    let date_tz = date_.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
    let start_date = moment(date_tz).format("YYYY-MM-DD HH:mm:ss")

    if(req.session.loggedin){
        console.log(start_date);
        
        if((reason == 0  &&updatetxt.length === 0 )||reason == null){
            errors = true;
            // set flash message
            req.flash('error', 'กรอกข้อมูลให้ครบ');
            res.redirect('/data/packupdate?uid='+uid+'&pack_id='+pack_id);
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
                res.redirect('/data/packupdate?uid='+uid+'&pack_id='+pack_id);
            }    
            console.log(txt);
            sqlt = 'INSERT INTO update_status SET pack_id = '+pack_id+', update_pack = "'+txt+'",timestamp = "'+start_date+'"';
            dbCon.query(sqlt, (err, result) => {
                    if (err) {
                        console.log(err);
                        req.flash('error', err);
                        res.redirect('/data/packupdate?uid='+uid+'&pack_id='+pack_id);
                    }
                    else{
                        req.flash('success', 'บันทึกแล้ว');
                        res.redirect('/data/packagetagoption?uid='+uid);
                        // res.render('scantag/packagetagoption', { uid: uid});
                    }   
                });
        }
    }else {
        res.redirect('/data/login?backurl=/data/packagetagoption?uid='+uid);  
    }
})  



module.exports = router;
