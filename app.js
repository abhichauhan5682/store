var express=require("express");
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var flash=require("connect-flash");
var passport=require("passport");
var cookieParser = require('cookie-parser');
 var LocalStrategy=require("passport-local");
 var passportlocalmongoose=require("passport-local-mongoose");
 var methodOverride=require("method-override");
 var crypto=require("crypto");
 var promisify=require("es6-promisify");
 var nodemailer=require("nodemailer");
 var async=require("async");
 var path=require("path");
 var multer=require("multer");
var jimp=require("jimp");
var uuid=require("uuid");
 var user=require("./models/user");
var store=require("./models/store");
var mail=require("./handlers/mail");

var app=express();
app.use(bodyParser.urlencoded({extended :true}));
app.use(flash());
app.use(require("express-session")({
    secret:"abhi is a good boy",
    resave:false,
    saveUninitialized:false
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(flash());
//app.use(express.static(path.join(__dirname, 'public')));
//app.use("/public", express.static('./public/'));

passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// middleware for current user
app.use(function(req,res,next){
    res.locals.currentuser=req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

mongoose.connect("mongodb://localhost/store_project");

//=======
//routes
//=======
app.get("/",function(req,res){
    store.find({},function(err,allstore){
        if(err){
            console.log(err);
        }else{
            req.flash('success', 'welcome');
            res.render("stores.ejs",{store:allstore});
        }
    });
});
var multerOption={
    storage:multer.memoryStorage(),
    filefiter:function(req,res,next){
        var isPhoto=file.mimetype.startsWith("image/jpg");
        if(isPhoto){
            next(null,true);
        }else{
            next({message:"this file is isnt allowed"},false);
        }
    }
}
function resize(req,res,next){
    if(!req.file){
        next();
        return;
    }
    var extension=req.file.mimetype.split("/")[1];
    req.body.photo=uuid.v4()+'.'+extension;
    jimp.read(req.file.buffer,function(err,photo){
      if(err){
          console.log(err);
      }else{
        photo.resize(900,jimp.AUTO);
        photo.write('./public/uploads'+req.body.photo);
        next();
      }
    });
    
}

app.get("/add",multer(multerOption).single("photo"),resize,function(req,res){
   
   res.render("addStore.ejs");
});
app.post("/add",multer(multerOption).single("photo"),resize,function(req,res){
    store.create(req.body.store,function(err,news){
        if(err){
            console.log(err);
        }else{
            console.log(" succesfuly created new store ");
            res.redirect("/");
        }
    });
});

//=================
// authentication
//=================

// register routes
app.get("/register",function(req,res){
    //req.flash("success","hola!!!")
    res.render("register.ejs")
});
app.post("/register",function(req,res){
    user.register(new user({username:req.body.username,email:req.body.email}),req.body.password,function(err,newuser){
        if(err){
            console.log(err);
            return res.render("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            });
        }
    });
});

app.get("/login",function(req,res){
   // req.flash("success","WelcomE")
    res.render("login.ejs");
});
//app.post("/login",middleware,callback)
app.post("/login",passport.authenticate("local",
  {
      successRedirect:"/",
      failureRedirect:"/login"
    }),function(req,res){
});


// logout routes
app.get("/logout",function(req,res){
    req.logout();
    req.flash("success","successfully LOgout");
    res.redirect("/add");
});

// middleware
function islogged(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
// forgot password

app.get("/login/forgot",function(req,res){
    res.render("forgot.ejs");
});

app.post("/login/forgot",function(req,res){
    user.findOne({email:req.body.email},function(err,user){
        if(err){
           console.log(err);
        }else{
            if(!user){
                res.send("INCORRECT USERNAME OR EMAIL");
                res.redirect("/login");
            }else{
                user.resetPasswordToken=crypto.randomBytes(20).toString("hex");
                user.resetPasswordExpire=Date.now()+360000;// from date till 5 minutes
                user.save();
                var resetURL='http://'+req.headers.host+'/login/reset/'+user.resetPasswordToken;
                mail.send({
                    user:user,
                    subject:"PASSWORD RESET URL",
                    resetURL:resetURL
                });
                res.redirect("/login");
            }   
        }    
    });
});

app.get("/login/reset/:token",function(req,res){
    user.findOne({
        resetPasswordToken:req.params.token,
         resetPasswordExpire:{ $gt : Date.now() } 
    },function(err,user){
        if(err){
            console.log(err);
        }else{
            if(!user){
                res.redirect("/login");
                return;
            }else{
                res.render("reset.ejs",{user:user});
            }
        }
    });
});

app.post("/login/reset/:token", function(req,res ){
        
        user.findOne({resetPasswordToken:req.params.token,resetPasswordExpire:{$gt:Date.now()}},function(err,user){
          if(!user){
              res.json(req.params.token);
              
              res.redirect("/login/forgot");
          }
            else{
              user.setPassword(req.body.password,function(err) {
                  user.resetPasswordExpire=undefined;
                  user.resetPasswordToken=undefined;

                  user.save(function (err) {
                     res.redirect("/login");
                  });
                  
              });
          
        }
});
});


//======================
// TAGS
//======================
 app.get("/tags",async(req,res)=>{
    const tags= await store.getTagsList();
   // res.json(tags);
    res.render("tags.ejs",{tags:tags});
 });

 app.get("/tags/:tag",function(req,res){
    var tag=req.params.tag;
    store.find({tags:tag},function(err,stores){
        if(err){
            console.log(err);
        }else{
            res.render("stores.ejs",{store:stores});
        }
    });
 });


//================
// MAP
//================
app.get("/map",function(req,res){
    res.render("map.ejs");

});





app.listen(7777,function(req,res){
    console.log("app is started");
});