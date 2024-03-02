var express=require('express');
var url=require('url');
var route= express.Router();
const numeral = require('numeral');
var exe=require("../conn");
const session = require('express-session');

function checklogin(req,res,next)
{
    if(req.session.user_id !=undefined)
    {
      next();
    }
    else
    {
        res.send(`<script>alert('login please ???'); location.href='/login' ;</script>`)
    }
}

route.get("/",async function(req,res)
{
   var banner_info=await exe('select *from banner');
   var why_data=await exe('select *from why_choose_us');
   var why_point=await exe('select *from why_choose_point');
   var moderns=await exe('select *from modern_interior');
   var tests=await exe('select *from testimonial');
   var blogs=await exe('select *from blog');
   var products=await exe('select *from product order by product_id asc limit 0,3 ');
   var user_id=req.session.user_id;
    // console.log(user_id);
   var obj={
    "banner_info":banner_info[0],
    "user_id":user_id,
    "why_data":why_data[0],
    "why_point":why_point,
    "moderns":moderns[0],
    "tests":tests,
    "blogs":blogs,
    "products":products
   }
    res.render('user/index.ejs',obj)
});
route.get("/about",async function(req,res)
{
    var user_id=req.session.user_id;
    var whys= await exe(`select *from why_choose_point`);
    var wh= await exe(`select *from why_choose_us`);
    var tests= await exe(`select *from testimonial`);
    var members= await exe(`select *from team`);
    var obj={
        "user_id":user_id,
        "whys":whys,
        "wh":wh,
        "tests":tests,
        "members":members

    }
    res.render('user/about.ejs',obj)
});
route.get("/shop",async function(req,res)
{
    var user_id=req.session.user_id;
    
    var products= await exe(`select *from product`);
    var ttl_products=products.length;

    var per_page=8;

    var page_no=1;
    var url_data=url.parse(req.url,true).query;
    
    if(url_data.page_no)
    {
        var page_no=url_data.page_no;
    }

    var start=(per_page*page_no)-per_page;

    var ttl_page= (parseInt(ttl_products/per_page))<ttl_products/per_page ?parseInt(ttl_products/per_page)+1:ttl_products/per_page;
    var products= await exe(`select *from product LIMIT ${start},${per_page}`);
    // console.log(start);
    var obj={
        "user_id":user_id,
        "products":products,
        "ttl_page":ttl_page,
        "page_no":page_no
    }
    res.render('user/shop.ejs',obj)
});

route.get("/services", async function(req,res)
{
    var whys= await exe(`select *from why_choose_point`);
    var tests= await exe(`select *from testimonial`);
    var products= await exe(`select *from product order by product_id desc limit 3`);
    var user_id=req.session.user_id;
    var obj={
        "user_id":user_id,
        "tests":tests,
        "whys":whys,
        "products":products
    }
    res.render('user/service.ejs',obj)
}); 

route.get("/contact",function(req,res)
{
    var user_id=req.session.user_id;
    var obj={
        "user_id":user_id
    }

    res.render('user/contact.ejs',obj)
});

route.get("/blog", async function(req,res)
{
    var user_id=req.session.user_id;
    var tests= await exe(`select *from testimonial`);
    var blogs= await exe(`select *from blog`);

    var obj={
        "user_id":user_id,
        tests:tests,
        blogs:blogs
    }
    res.render('user/blog.ejs',obj)
});

route.get("/cart",checklogin,async function(req,res)
{
    var user_id=req.session.user_id;
    var products= await exe(`select *from user_cart u,product p
               where u.product_id=p.product_id and  user_id='${user_id}'`);
            //    con   sole.log(products);
    var obj={
        "user_id":user_id,
        "products":products,
    }
    res.render('user/cart.ejs',obj)
});
route.get("/checkout",checklogin,async  function(req,res)
{
    var user_id=req.session.user_id;
var products= await exe(`select *from user_cart c ,product p where p.product_id = c.product_id and user_id='${user_id}'`);
    var obj={
        "user_id":user_id,
        "products":products
    }
    console.log(products.length);
    res.render('user/checkout.ejs',obj)
});
route.get("/login",function(req,res)
{
    var user_id=req.session.user_id;
    var obj={
        "user_id":user_id
    }
    res.render('user/login.ejs',obj);
})
route.get("/sign_up",function(req,res)
{
    var user_id=req.session.user_id;
    var obj={
        "user_id":user_id
    }
    res.render('user/sign_up.ejs',obj);
})
route.post("/signup_user",async function(req,res)
{
    var d=req.body;
    
    if(d.password==d.conform_password)
    {
    var sql=`insert into user_tbl(user_name,user_mobile,user_email,user_password)
       values('${d.user_name}','${d.user_mobile}','${d.user_email}','${d.password}')`
       await exe(sql);
       res.redirect("/login");

    }
    else
    {
        res.send(`<script>alert('password does not match..');history.back();</script> `)
    }

});
route.post("/login_user",async function(req,res)
{
var d=req.body;
var sql=`select *from user_tbl where user_mobile='${d.user_mobile}' and user_password='${d.password}'`;
var data=await exe(sql);


// console.log(req.session);
if(data.length>0)
{
  req.session.user_id=data[0].user_id;
res.redirect("/");
}
else
{
    res.send(`<script>alert('login failed please check user password'); history.back()  </script>`)
}
});
route.get("/logout",function(req,res)
{
    req.session.user_id=undefined;
    res.redirect("/");
})
route.post("/save_customer",async function(req,res)
{
    var d=req.body;
   var sql=`insert into save_customer(customer_fname,customer_lname,customer_email,customer_message)
   values('${d.fname}','${d.lname}','${d.email}','${d.message}')`
     var data= await exe(sql); 
    // res.send(data);
    res.redirect("/contact");

})
route.get("/product_info/:id",async function(req,res)
{
    var product_id=req.params.id;
    var user_id=req.session.user_id;
    var product_info= await exe(`select *from product p,product_type pt where p.product_type_id=pt.product_type_id 
      AND product_id='${product_id}'`);

      var check= await exe(`select *from user_cart where user_id='${user_id}' and product_id='${product_id}'`);

    //   console.log(product_info.product_name);
    var obj={
        "user_id":user_id,
        "check":check,
        "product_info":product_info[0]
    }
    res.render('user/product_info.ejs',obj);
});

route.get("/add_to_cart/:id",async function(req,res)
{
    var product_id=req.params.id;
    var user_id=req.session.user_id;
    qty=1;
    if(user_id ==undefined)
    {
         res.send(`<script>alert('Invalid User Login Now...');
       location.href='/login';
         </script>`)
    }
    else
    {
        // res.send('Adding to cart'+user_id);
        var check= await exe(`select *from user_cart where user_id='${user_id}' and product_id='${product_id}'`);

        if(check.length==0)
        {
        var sql= await exe(`insert into user_cart(user_id,product_id,qty)values('${user_id}','${product_id}','${qty}')`);
            res.redirect("/product_info/"+product_id)
        }
        else
        {
            res.redirect("/product_info/"+product_id)
        }

    }
})
route.get("/delete_cart/:id",async function(req,res)
{
    var sql=`delete from user_cart where product_id='${req.params.id}'`;
    await exe(sql);
    res.redirect("/cart");
})

route.get("/decrease_qnt/:id",async function(req,res)
{

    var cart_id=req.params.id;
    var sql=`select * from user_cart c,product p where c.product_id=p.product_id AND cart_id='${cart_id}'`;
   var data= await exe(sql);

   var new_qty=data[0].qty-1;
   if(new_qty>0)
   {
   var new_tot=data[0].product_price*new_qty;
    var sql=`update user_cart set qty='${new_qty}' where cart_id='${cart_id}'`;
    await exe(sql);
    res.send({"new_qty":new_qty,"new_tot":new_tot});
   }
   else
   {
    var new_tot=data[0].product_price*1;
   res.send({"new_qty":data[0].qty,"new_tot":data[0].product_price});
   }
})
route.get("/increase_qnt/:id",async function(req,res)
{
    var cart_id=req.params.id;
    var sql=`update user_cart set qty=qty+1 where cart_id='${cart_id}'`;
    await exe(sql);

    var sql2=`select * from user_cart c,product p where c.product_id=p.product_id AND cart_id='${cart_id}'`;

   var data= await exe(sql2);
    var new_qty=data[0].qty;

    var new_tot=data[0].product_price*new_qty;

      res.send({"new_qty":new_qty,"new_tot":new_tot})
})
route.post("/add_coupon", async function(req,res)
{
 var d=req.body.coupon;

  var data= await exe (`select *from coupon where coupon_id=1`);

  var coupon=data[0].coupon;
//   console.log(coupon);
  var offer=0;
  if(coupon==d)
  {
   offer=3;
   res.send(`<script>alert(' Coupon Added Successfully !!!');location.href='/cart'</script>`)  
   // res.redirect("/cart");
  }
  else
  {
    res.send(`<script>alert('Invalid coupon'); location.href='/cart'</script>`)  
  }
})
route.post("/save_order",async function(req,res)
{
    var d=req.body;
    var user_id=req.session.user_id;
    var order_date= String(new Date().toISOString()).slice(0,10);
    console.log(order_date);

    var order_status='pending';

    if(d.Payment=='online')
    {
        order_status='payment_pending'
    }
    var sql=`insert into order_tbl(user_id,country,c_fname,c_lname,	c_address,	c_area,	c_state,c_postal_zip,c_email,c_phone,Payment,order_date,order_status,payment_status)
    values('${user_id}','${d.country}','${d.c_fname}','${d.c_lname}','${d.c_address}','${d.c_area}',
    '${d.c_state}','${d.c_postal_zip}','${d.c_email}','${d.c_phone}','${d.Payment}','${order_date}','${order_status}','pending')`;

   var data= await exe(sql);
    // res.send("order date :"+order_date);
    var cart_products= await exe(`select *from user_cart u,product p where u.product_id=p.product_id
     and user_id='${user_id}'`);

    //  console.log(cart_products);
    for(var i=0;i<cart_products.length;i++)
    {
        order_id=data.insertId;
        user_id=req.session.user_id;
        product_id=cart_products[i].product_id;
        product_qty=cart_products[i].qty;
        product_price=cart_products[i].product_price;
        product_name=cart_products[i].product_name;
        product_details=cart_products[i].product_detail     ;

//    let  product_detail=product_details.replaceAll("'","`");

sql = `insert into order_product(order_id,user_id,product_id,product_qty,product_price,
    product_name,product_details) values('${order_id}','${user_id}','${product_id}',
    '${product_qty}','${product_price}','${product_name}','${product_details}')`;

    var record=await exe(sql)
            console.log(record);
    }
    var sql=`delete from user_cart where user_id='${user_id}'`;
    await exe(sql);

    if(order_status=='payment_pending')
    {
        res.redirect('/pay_payment/'+data.insertId)
    }
    else
    {
        res.redirect("/my_order");
    }
    //  res.send(cart_products);
    // res.redirect("/checkout");
})

route.get("/pay_payment/:order_id", checklogin,async function(req,res)
{
    var user_id=req.session.user_id;

    var order_id=req.params.order_id;
    var sql=`select product_qty,product_price from order_product where order_id='${order_id}' `;
    var data=await exe(sql);
    var obj={
        "order_det":data,
        order_id:order_id
    }
res.render('user/pay_payment.ejs',obj);
})

route.post("/payment_success/:order_id", async function(req,res)
{
    var d=req.body;
    var transaction_id=d.razorpay_payment_id;
    var order_id=req.params.order_id;
    var today = new Date().toISOString().slice(0, 10);
    var sql=`update order_tbl set order_status='pending',payment_status='complete',
    transaction_id='${transaction_id}',payment_date='${today}'   where order_id='${order_id}'`;
    // console.log(today);
    var data=await exe(sql);
    // res.send(data);
    res.redirect("/my_order");
})
route.get("/my_order",async function(req,res)
{
    var user_id=req.session.user_id;
    var sql = `SELECT *, (SELECT SUM(product_qty * product_price) FROM order_product WHERE order_product.order_id = order_tbl.order_id)
     AS total_amt FROM order_tbl where user_id='${user_id}' and order_status!='payment_pending'`;

    var data=await exe(sql)
    var obj={"orders":data,"user_id":user_id};
    res.render('user/my_order.ejs',obj);
    // res.send("my order page has open")
})

route.get("/print_order/:id",async function(req,res)
{
    var user_id=req.session.user_id;
    var order_id=req.params.id
    var orders= await exe(`select *from order_tbl where order_id='${order_id}'`)
    var products= await exe(`select *from order_product where order_id='${order_id}'`)
    var obj={
        "orders":orders[0],
        "products":products,
        "user_id":user_id
    };
    res.render('user/print_order.ejs',obj);
})


route.get("/profile",async function(req,res)
{
    var user_id=req.session.user_id;
var obj={
    "user_id":user_id,
}
    res.render('user/profile.ejs',obj);
})
module.exports=route;