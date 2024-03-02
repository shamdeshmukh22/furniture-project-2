var express=require('express');
var url=require('url');
var exe=require('../conn');
var route= express.Router();

function checklogin(req,res,next)
{
    if(req.session.admin_id !=undefined)
    {
      next();
    }
    else
    {
        res.send(`<script>alert('login please ???'); location.href='/admin/login' ;</script>`)
    }
}
route.get("/login",function(req,res)
{
    var admin_id=req.session.admin_id;
    var obj={
        "admin_id":admin_id
    }
    res.render('admin/login.ejs',obj);
})
route.post("/login_admin",async function(req,res)
{
    var d=req.body;
var sql=`select *from admin_tbl where admin_mobile='${d.admin_mobile}' and admin_password='${d.password}'`;
var data=await exe(sql);


// console.log(req.session);
if(data.length>0)
{
  req.session.admin_id=data[0].admin_id;
res.redirect("/admin");
}
else
{
    res.send(`<script>alert('login failed please check admin password'); history.back()  </script>`)
}
})
route.get("/logout",function(req,res)
{
    req.session.admin_id=undefined;
    res.redirect("/admin");
})
route.get("/", checklogin, function(req,res)
{
    res.render('admin/home.ejs')
});
route.get("/admin_banner",async function(req,res)
{
    var sql= await exe( 'select *from banner');
    res.render('admin/admin_banner.ejs',{"banner_info":sql[0]});
})
route.post('/admin_banner_data',async function(req,res)
{
    var d=req.body;
    if(req.files)
    {
        if(req.files.banner_image!=undefined)
        {
    var banner_image=new Date().getTime()+req.files.banner_image.name;
    req.files.banner_image.mv("public/uploads/"+banner_image);
    await exe(`update banner set banner_image='${banner_image}' where banner_id=1`);
    }
}

    var sql=`update banner 
    set 
    banner_title='${d.banner_title}',
    banner_detail='${d.banner_detail}',
    banner_link='${d.banner_link}'
    where banner_id=1
    `;
    var data=await exe(sql);
    // res.send(req.files);
    res.redirect('/admin/admin_banner')
})
route.get("/product_type",async function(req,res)
{
    var types= await exe(`select *from product_type`);
    res.render('admin/product_type.ejs',{"types":types});
})
route.post("/save_product_type",async function(req,res)
{
    var sql=`insert into product_type(product_type_name) values('${req.body.product_type_name}')`;

    var data= await exe(sql);
    // res.send(data);
    res.redirect("/admin/product_type")
})

route.get("/delete_product_type/:id",async function(req,res)
{
    var sql=`delete from product_type where product_type_id='${req.params.id}'`;

    var data =await exe(sql);
    res.redirect("/admin/product_type")
});

route.get("/edit_product_type/:id",async function(req,res)
{
    var sql=`select * from product_type where product_type_id='${req.params.id}'`;
    var types =await exe(sql);
    res.render('admin/update_product_type.ejs',{"types":types[0]});
})

route.post("/update_product_type_data",async function(req,res)
{
    var sql=`update product_type
    set product_type_name='${req.body.product_type_name}'
    where product_type_id='${req.body.product_type_id }'`;

    await exe(sql);
    res.redirect("/admin/product_type")
})

route.get("/product",async function(req,res)
{
    var types= await exe(`select *from product_type`);
    var obj={"types":types};
    res.render('admin/product.ejs',obj);
})
route.post("/add_product",async function(req,res)
{
    var d=req.body;
    var product_file=[];
    var user_image;

//    var detail= $(d.banner_detail);
//    detail.replace

    if(req.files.product_image.length>0)
    {
        var len=req.files.product_image.length;

        for(var i=0;i<len;i++)
        {
       var fn=new Date().getTime()+req.files.product_image[i].name;
        req.files.product_image[i].mv("public/uploads/"+fn);
          product_file.push(fn);
        }
       user_image=product_file.join("+||+");
    }
    else
    {
        var fn=new Date().getTime()+req.files.product_image.name;
        req.files.product_image.mv("public/uploads/"+fn);
        user_image=fn;
    }

   let  product_detail=d.product_detail.replaceAll("'","`");

    var sql=`insert into product(product_type_id,product_name,product_price,duplicate_price,product_size,product_color,product_label,product_image,product_detail)
       values('${d.product_type}','${d.product_name}','${d.product_price}','${d.duplicate_price}','${d.product_size}','${d.product_color}',
       '${d.product_label}','${user_image}','${product_detail}')`;
     var data=  await exe(sql);
    res.redirect("/admin/product")
    // res.send(data)

});
route.get("/product_list",async function(req,res)
{
    var sql=`select *from product p ,product_type pt  where p.product_type_id=pt.product_type_id`;
    var products= await exe(sql);
    res.render("admin/product_list.ejs",{products:products});
});

route.get("/product_search",async function(req,res)
{
    var url_data=url.parse(req.url,true).query;
    var str=url_data.str;
    var sql=`select *from product p ,product_type pt  where p.product_type_id=pt.product_type_id
     and (
        product_name  LIKE  '%${str}%' OR
        product_type_name LIKE  '%${str}%' OR
        product_price LIKE  '%${str}%'OR
        product_size LIKE  '%${str}%'
     )`;
    var products= await exe(sql);
    res.render("admin/product_list.ejs",{products:products});
    // res.send(req.body);
})

route.get("/delete_product/:id",async function(req,res)
{
   var sql=`delete from product where product_id='${req.params.id}'`;
   var data =await exe(sql);
//    res.send(data);
res.redirect("/admin/product_list")
});
// edit product
route.get("/edit_product/:id",async function(req,res)
{
    var sql=`select *from product,product_type where product_id='${req.params.id}' `;
   var data =await exe(sql);
    res.render('admin/update_product.ejs',{p_det:data});
})
// edit product data
route.post("/update_product" ,async function(req,res)
{
    var d=req.body;
    var user_image;
    //  d.product_id = d.product_id;  
    var product_file=[];

    if(req.files !=null)
    {
    if(req.files.product_image != undefined)
    {
        if(req.files.product_image.length>0)
        {
            var len=req.files.product_image.length;
    
            for(var i=0;i<len;i++)
            {
           var fn=new Date().getTime()+req.files.product_image[i].name;
           req.files.product_image[i].mv("public/uploads/"+fn);
           product_file.push(fn);
            }
           user_image=product_file.join("+||+");
        }
        else
        {
            var fn=new Date().getTime()+req.files.product_image.name;
            req.files.product_image.mv("public/uploads/"+fn);
            user_image=fn;
        }

        await exe(`update product set product_image='${user_image}' where product_id='${d.product_id}'`)
    }
}

    var sql=`update product set 
     product_name='${d.product_name}',
     product_price='${d.product_price}',
     duplicate_price='${d.duplicate_price}',
     product_size='${d.product_size}',
     product_color='${d.product_color}',
     product_label='${d.product_label}',
     product_detail='${d.product_detail}'
     where product_id='${d.product_id}'`
     await exe(sql);
    res.redirect("/admin/product_list");
});


route.get("/why_choose_us",async function(req,res)
{
    var data = await exe(`select *from why_choose_us where why_id=1`);
    res.render('admin/why_choose_us.ejs',{"w_det":data[0]});
})
route.post("/save_why_choose_us",async function(req,res)
{
    
    if(req.files)
    {
        if(req.files.why_image !=undefined)
        {
            var image=new Date().getTime()+req.files.why_image.name;
            req.files.why_image.mv("public/uploads/"+image);
            await exe(`update why_choose_us set why_image='${image}'  where why_id=1 `);
        }
    }
    var sql=  await exe(`update why_choose_us set why_heading= '${req.body.why_heading}' where why_id=1`);

    // res.send(sql);
    res.redirect("/admin/why_choose_us")
})
route.get("/why_choose_us_point",async function(req,res)
{
    var data= await exe('select *from why_choose_point');
    res.render('admin/why_choose_us_point.ejs',{data:data});
})
route.post("/save_why_key_point",async function(req,res)
{
    var d=req.body;

    var image=new Date().getTime()+req.files.kp_image.name;
    req.files.kp_image.mv("public/uploads/"+image);

    var sql=`INSERT INTO why_choose_point(kp_name,kp_detail,kp_image)
    VALUES('${d.kp_name}','${d.kp_detail}','${image}')`;
  var data=  await exe(sql)
    // res.send(data);
    res.redirect("/admin/why_choose_us_point")
})
route.get("/edit_why_choose_us/:id",async function(req,res)
{
 var data = await exe(`select * from why_choose_point where kp_id='${req.params.id}'`);
 res.render('admin/edit_why_choose_us.ejs',{"points":data[0]});
})



route.post("/update_why_key_point",async function(req,res)
{
    var d=req.body;
    if(req.files)
    {
        if(req.files.kp_image !=undefined)
        {
            var image=new Date().getTime()+req.files.kp_image.name;
            req.files.kp_image.mv("public/uploads/"+image);
            await exe(`update  why_choose_point set kp_image='${image}' where kp_id='${d.kp_id}'` )
        }
    }
    var sql=`update  why_choose_point set
     kp_name='${d.kp_name}', 
     kp_detail='${d.kp_detail}' 
     where kp_id='${d.kp_id}' `;
     var data=await exe(sql);
    // res.send(data);
    res.redirect("/admin/why_choose_us_point")
})
route.get("/delete_why_choose_us/:id",async function(req,res)
{
    var sql=`delete from why_choose_point where kp_id='${req.params.id}' `;
    await exe(sql);
    res.redirect("/admin/why_choose_us_point")

})




// modern page 
route.get("/modern_interior",async function(req,res)
{
    var details= await exe(`select *from modern_interior `);
    res.render('admin/modern_interior.ejs',{"details":details[0]});
});

route.post("/update_modern_inte",async function(req,res)
{
    var d=req.body;
    if(req.files)
    {
        if(req.files.modern_img1 !=undefined)
        {
            var img1=new Date().getTime()+req.files.modern_img1.name;
            req.files.modern_img1.mv("public/uploads/"+img1);
            await exe(`update  modern_interior set  modern_img1='${img1}' where modern_id=1`)
        }
        if(req.files.modern_img2 !=undefined)
        {
            var img2=new Date().getTime()+req.files.modern_img2.name;
            req.files.modern_img2.mv("public/uploads/"+img2);
            await exe(`update  modern_interior set  modern_img2='${img2}' where modern_id=1 `)

        }
        if(req.files.modern_img3 !=undefined)
        {
            var img3=new Date().getTime()+req.files.modern_img3.name;
            req.files.modern_img3.mv("public/uploads/"+img3);
            await exe(`update  modern_interior set   modern_img3='${img3}' where modern_id=1 `)

        }
    }
    var sql=`update modern_interior set
     modern_key1='${d.modern_key1}',
     modern_key2='${d.modern_key2}',
     modern_key3='${d.modern_key3}',
     modern_key4='${d.modern_key4}',
     modern_heading='${d.modern_heading}',
     modern_detail='${d.modern_detail}'
     where modern_id=1 `;

     var data=await exe(sql);
    //   res.send(data);
    res.redirect("/admin/modern_interior")
});


// testimonial page
route.get("/testimonials",async function(req,res)
{
    var tests= await exe(`select *from  testimonial`)
    res.render("admin/testimonials.ejs",{"tests":tests});
});
route.post("/save_testimonials",async function(req,res)
{
    var d=req.body;
    var image=new Date().getTime()+req.files.customer_image.name;
    req.files.customer_image.mv("public/uploads/"+image);

  var sql= `insert into testimonial(test_name,test_position,test_image,test_detail)
   values('${d.customer_name}','${d.customer_position}','${image}','${d.customer_message}')`;
   var data=await exe(sql);
//    res.send(data);
        res.redirect("/admin/testimonials");
});
route.get("/edit_testimonial/:id",async function(req,res)
{
    var sql=`select *from testimonial where test_id='${req.params.id}'`;
    var data=await exe(sql);
    res.render("admin/edit_testimonial.ejs",{"tests":data[0]});
})
route.post("/update_test_data",async function(req,res)
{
    var d=req.body;
    if(req.files)
    {
        if(req.files.customer_image !=undefined)
        {
            var image=new Date().getTime()+req.files.customer_image.name;
            req.files.customer_image.mv("public/uploads/"+image);
            await exe(`update testimonial set test_image='${image}' where test_id='${d.customer_id}' `)
        }
    }
    var sql=`update testimonial set
    test_name='${d.customer_name}',
    test_position='${d.customer_position}',
    test_detail='${d.customer_message}'
    where test_id='${d.customer_id}'
    `
    var data=await exe(sql);
    // res.send(`${d.customer_id}`);
    res.redirect("/admin/testimonials");
});

route.get("/delete_testimonial/:id",async function(req,res)
{
    var sql=`delete from testimonial where test_id ='${req.params.id}'`;
    var data =await exe(sql);
    // res.send(req.params.id);
    res.redirect("/admin/testimonials");
});




// blog page
route.get("/blog",async function(req,res)
{
    var blogs= await exe(`select *from blog`);
    res.render('admin/blog.ejs',{blogs:blogs});
})

route.post("/save_blog",async function(req,res)
{
    var d=req.body;
    var blog_image=new Date().getTime()+req.files.blog_image.name;
    req.files.blog_image.mv("public/uploads/"+blog_image);

    var sql=`insert into blog(blog_image,blog_title,blog_post_date,blog_post_time,blog_post_by,blog_post_by_position,blog_detail)
    values('${blog_image}','${d.blog_title}','${d.blog_post_date}','${d.blog_post_time}','${d.blog_post_by}','${d.blog_post_by_position}','${d.blog_detail}')`

    var data=await exe(sql);
    // res.send(data);
    res.redirect("/admin/blog")
});


route.get("/delete_blog/:id",async function(req,res)
{
    var sql=`delete from blog where blog_id='${req.params.id}'`;
    var data=await exe(sql);
    // res.send(data);
    res.redirect("/admin/blog");
})

route.get("/update_blog/:id",async function(req,res)
{
    var sql=`select *from blog where blog_id='${req.params.id}'`;
    var blogs=await exe(sql);
    res.render('admin/update_blog.ejs',{blogs:blogs[0]});
})
route.post("/update_blog_data",async function(req,res)
{
    var d=req.body;
    if(req.files)
    {
        if(req.files.blog_image !=undefined)
        {
            var image=new Date().getTime()+req.files.blog_image.name;
            req.files.blog_image.mv("public/uploads/"+image);
            await exe(`update blog set blog_image='${image}' where blog_id='${d.blog_id}'`)

        }
    }
    var sql=`update blog set
     blog_title='${d.blog_title}',
     blog_post_date='${d.blog_post_date}',
     blog_post_time='${d.blog_post_time}',
     blog_post_by='${d.blog_post_by}',
     blog_post_by_position='${d.blog_post_by_position}',
     blog_detail='${d.blog_detail}'
     where blog_id='${d.blog_id}'`;

     var data=await exe(sql);
    // res.send(data);
    res.redirect("/admin/blog");
})



route.get("/delete_pro_image/:id/:index",async function(req,res)
{
    var data= await exe(`select *from product where product_id='${req.params.id}'`);
    // console.log(data[0]['product_image']);
    var image=data[0]['product_image'].replace(`${req.params.index}`,"");

    var upt=`update product set product_image='${image}' where product_id='${req.params.id}'`;

    var data=await exe(upt);
    // res.send(req.params);
    res.redirect(`/admin/product_list`);
})


// update specific image in products

route.get("/update_pro_image/:id/:index",async function(req,res)
{
    var data= await exe(`select *from product where product_id='${req.params.id}'`);

    res.render('admin/update_pro_image.ejs');
})


route.get("/team", async function(req,res)
{
    var members= await exe(`select *from team`);
    var obj={
        "members":members
    }
    res.render('admin/team.ejs',obj);
})
route.post("/save_member",async function(req,res)
{
    var d=req.body;
    var image=new Date().getTime()+req.files.member_image.name;
    req.files.member_image.mv("public/uploads/"+image);

    var sql=`insert into team(member_name,member_position,member_detail,member_image)
    values('${d.member_name}','${d.member_position}','${d.member_detail}','${image}')`
    var data=await exe(sql);
    // res.send(data);
    res.redirect("/admin/team");

});
route.get("/delete_team/:id",async function(req,res)
{
    var sql=`delete from team where member_id='${req.params.id}'`;
  await exe(sql);
  res.redirect("/admin/team");
})

route.get("/edit_team/:id",async function(req,res)
{
    var sql=`select *from team where member_id='${req.params.id}'`;
  var m_det=await exe(sql);
     var obj={
        "m_det":m_det[0]
     }
  res.render("admin/update_team.ejs",obj);
})
route.post("/update_member",async function(req,res)
{
    var d=req.body;
    if(req.files)
    {
        if(req.files.member_image !=undefined)
        {
            var image=new Date().getTime()+req.files.member_image.name;
                req.files.member_image.mv("public/uploads/"+image);
                await exe(`update team set member_image='${image}' where member_id='${d.member_id}'`)
        }
    }
    var sql=`update team set
    member_name='${d.member_name}',
    member_position='${d.member_position}',
    member_detail='${d.member_detail}'
    where member_id='${d.member_id}'
    `
    await exe(sql);
  res.redirect("/admin/team");


})
route.get("/contact_us",async function(req,res)
{
    var details= await exe(`select *from save_customer`);
    var obj={"details":details}
    res.render('admin/contact_us.ejs',obj);
})

route.get("/coupon",async function(req,res)
{
    var data=await exe(`select *from coupon where coupon_id=1`);
    res.render('admin/coupon.ejs',{"coupons":data[0]});
})
route.post("/save_coupon",async function(req,res)
{
    var d=req.body;
    var data=`update coupon set coupon='${d.coupon_code}' where coupon_id=1`;
    await exe(data);
    res.redirect("/admin/coupon");
})

route.get("/pending_order",async function(req,res)
{
    var sql=`select *,(select sum(product_qty*product_price) from order_product where order_product.order_id=order_tbl.order_id )as ttl_amount from order_tbl where order_status='pending' AND user_id !=0`
    var data=await exe(sql);
    // console.log(data);
    var obj={
        "orders":data
    }
    res.render('admin/pending_order.ejs',obj);
})
route.get("/view_order/:id",async function(req,res)
{
    var order_id=req.params.id
    var orders= await exe(`select *from order_tbl where order_id='${order_id}'`)
    var products= await exe(`select *from order_product where order_id='${order_id}'`)
    var obj={
        "orders":orders[0],
        "products":products
    };
    res.render('admin/view_order.ejs',obj);
})

route.get("/to_dispatch/:id",async function(req,res)
{
    var today = new Date().toISOString().slice(0, 10);
    // console.log(today);
    var sql=`update order_tbl set order_status='dispatch', order_dispatch_date='${today}' where order_id='${req.params.id}'`
   
    var data=await exe(sql);
    res.redirect("/admin/pending_order")
    // res.send(data);
})

route.get("/dispatch_order", async function(req,res)
{
    var sql=`select *,(select sum(product_qty*product_price) from order_product where order_product.order_id=order_tbl.order_id )as ttl_amount from order_tbl where order_status='dispatch' AND user_id !=0`
    var data=await exe(sql);
    // console.log(data);
    var obj={
        "orders":data
    }
    res.render('admin/dispatch_order.ejs',obj);
});

route.get("/view_order_dis/:id",async function(req,res)
{
    var order_id=req.params.id
    var orders= await exe(`select *from order_tbl where order_id='${order_id}'`)
    var products= await exe(`select *from order_product where order_id='${order_id}'`)
    var obj={
        "orders":orders[0],
        "products":products
    };
    res.render('admin/dis_view_order.ejs',obj);
})
route.get("/to_delivered/:id",async function(req,res)
{
    var today = new Date().toISOString().slice(0, 10);
    // console.log(today);
    var sql=`update order_tbl set order_status='delivered', order_delivered_date='${today}' ,payment_status='complete' where order_id='${req.params.id}'`
   
    var data=await exe(sql);
    res.redirect("/admin/dispatch_order")
    // res.send(data);
});
route.get("/delivered_order",async function(req,res)
{
    var sql=`select *,(select sum(product_qty*product_price) from order_product where order_product.order_id=order_tbl.order_id )as ttl_amount from order_tbl where order_status='delivered' AND user_id !=0`
    var data=await exe(sql);
    // console.log(data);
    var obj={
        "orders":data
    }
    res.render('admin/delivered_order.ejs',obj);
});

route.get("/view_delivered_order/:id",async function(req,res)
{
    var order_id=req.params.id
    var orders= await exe(`select *from order_tbl where order_id='${order_id}'`)
    var products= await exe(`select *from order_product where order_id='${order_id}'`)
    var obj={
        "orders":orders[0],
        "products":products
    };
    res.render('admin/del_view_order.ejs',obj);
})
module.exports=route