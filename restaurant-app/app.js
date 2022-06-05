const mysql = require('mysql');
const express = require('express');
const bodyparser = require('body-parser');
const helperClass = require('./lib/helper');
const bcrypt = require('bcrypt');

const path = require('path');
const router = express.Router();

var createError = require('http-errors');

var app = express();
var flash = require('express-flash');
var session = require('express-session');
var cookieParser = require('cookie-parser');


//Configuring express server
// app.use(bodyparser.json());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')))//where the stylesheet is stored

// Session Settings
app.use(cookieParser());
app.use(session({ 
    secret: 'secREt$#code$%3245',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 2*60*1000 }
}))

app.use(flash());

app.use('/', router);

// app.use('/login', router);

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var conn = mysql.createConnection({
host: "localhost",   
user: "root",    
password: "2018@Camelious2",   
database: "restaurantapp"  
});

conn.connect((err)=> {
    if(!err)
        console.log('Connected to database Successfully');
    else
        console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Listening on port ${port}..`));


//route setup
router.get('/', function(req,res){
    res.render('index');
});

router.get('/login', function(req,res){
    res.render('login',{ messages:req.session?.flash});
});

router.get('/menu', function(req,res){
    // var obj = new helperClass();
    //  var tmpOrderNbr ='';
    // var tmpPrefix = new helperClass();
    const tmpOrderNbr = getOrderNumber(myCall);

    //  console.log(getOrderNumber());
    //  console.log(tmpOrderNbr);
     
    res.render('menu', {
        order_nbr:  tmpOrderNbr,
        order_prefix: tmpOrderNbr
    });
});
/**
 * Member Methods
 */
 const myCall = (vRet)=>{
     console.log(vRet);
    return vRet;
 }

 const getOrderNumber = (callback)=>{
    var retVal = 0; 
    
    conn.query("SELECT * FROM key_control WHERE key_name ='ORDER_NBR'", function(err,row)     {
        // console.log(row[0].key_value);     
         retval = row[0].key_value;
         if(err){
                callback(JSON.stringify(err));
         }else{
             callback(JSON.stringify(retVal));  
         }
    });
}

// router.get('/orders', function(req,res){
//     res.render('../views/orders');
// });


//display the login page
// router.get('/login', function(req, res, next){    
//     // render to views/user/add.ejs
//     res.render('login', {
//         title: 'Login',
//         email: '',
//         password: ''    
//     })
// })
 
 
//authenticate user
router.post('/login', async function(req, res, next) {
       
    try {
        var email = req.body.email;
        var password = req.body.password;
        password= await bcrypt.hash(password, 10);
        console.log(email,password);

       
        // conn.query("SELECT * FROM admin WHERE  email = '"+ email  +"' AND BINARY password = '"+ password +"'", function(err, rows, fields) {
        conn.query('SELECT * FROM restaurantapp.admin WHERE email = ? AND BINARY password = ?', [email, password], function (err, rows, fields) {

            // if login is incorrect or not found
            console.log(rows.length);
            if (rows.length <= 0) {
    
                req.flash('error', 'Incorrect Email or Password, Please try again!');
                res.redirect('/login');
                console.log(err)
    
            }else { // if login found
                //Assign session variables based on login credentials                
                req.session.loggedin = true;
                req.session.id = rows[0].id;
                // req.session.first_name = rows[0].frst_nm;
                // req.session.last_name = rows[0].last_nm;
                // req.session.is_admin = rows[0].is_admin;
                console.log(req.session);
                res.redirect('/orders-view');
    
            }
        })

    }catch(err) {
        console.log(err)
        res.status(500).send('Something went wrong')
    }
    

})
  
// Logout admin & customer
router.get('/logout', function (req, res) {
  req.session.destroy();
//   req.flash('success', 'Enter Your Login email and password');
  res.redirect('/');
});

app.post('/order/add', (req, res) => {
    let data = {    
                    meat_dish:      req.body.meat_dish, 
                    starch:         req.body.starch,
                    dessert:        req.body.dessert,  
                    drinks:         req.body.drinks,
                    special:        req.body.special,
                    payment:        req.body.payment,
                };

    req.session.pendingOrder = data;

    res.redirect('/confirm-order');

}); 

router.get('/orders-view', function(req, res, next) {
    
    conn.query('SELECT * FROM order', function(err,row)     {
    
        if(err){ 
            res.render('../views/orders',
            {
                page_title: "Customer Order",
                order: ''
            });   
        }
        else{ 
            res.render('../views/orders',
            {
                page_title: "Customer Order",
                order: row
            });
        }
                            
    });
            
});

router.get('/confirm-order', (req,res) => {
    res.render('confirm-order',
    {
        page_title: "Order Confirmation",
        edit_order: req.session.pendingOrder
    });

    // conn.query('SELECT * FROM orders WHERE id='+ req.params.id, function(err,row)     {
    
    //     if(err){
    //         //req.flash('error', err); 
    //         res.render('confirm-order',
    //         {
    //             page_title: "Order Confirmation",
    //             edit_order: ''
    //         });   
    //     }
    //     else{ 
    //         res.render('confirm-order',
    //         {
    //             page_title: "Order Confirmation",
    //             edit_order: req.session.pendingOrder
    //         });
    //     }
                            
    // });
    
})

router.post('/confirm-order', (req,res) => {

    const randomCode = Math.round(Math.random() * (99_999 - 10_000)) + 10_000;

    console.log(randomCode);
    req.flash('info','Your order is confimed, your order number is '+ randomCode)
    res.redirect('/confirm-order')

    let data = req.session.pendingOrder;
    // let data = {    
    //     meat_dish:      req.body.meat_dish, 
    //     starch:         req.body.starch,
    //     dessert:        req.body.dessert,  
    //     drinks:         req.body.drinks,
    //     special:        req.body.special,
    //     payment:        req.body.payment,
    // };

    // let customer = {
    //     email:req.body.email,
    //     code: randomCode
    // }


    
    // let sqlQuery = "INSERT INTO orders SET ?";
    
    // let vQuery = conn.query(sqlQuery, data,(err, results) => {
    //     if(err) throw err;
    //       res.send(JSONResponse(results));
    // });
})