//import modules
var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverrride = require('method-override');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var async = require('async');

// connect DB
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once("open", function(){
  console.log('DB connected..');
});

db.on("error", function(err){
  console.log("DB ERROR : ", err);
});

//model setting
var postSchema = mongoose.Schema({
  title: {type:String, required:true},
  body:{type:String, required:true},
  createdAt:{type:Date, default:Date.now},
  updatedAt: Date
});

var userSchema = mongoose.Schema({
  email:{type:String, required:true, unique:true},
  nickname:{type:String, required:true, unique:true},
  password:{type:String, required:true},
  createdAt:{type:Date, default:Date.now}
});

var Post = mongoose.model("post", postSchema);
var User = mongoose.model("user", userSchema);
//view setting
app.set("view engine", 'ejs');

// set middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverrride("_method"));
app.use(flash());

app.use(session({secret:'MySecret'}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done){
  done(null, user.id);
});
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});

var LocalStrategy = require('passport-local').Strategy;
passport.use('local-login',
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function(req, email, password, done){
      User.finOne({'email' : email}, function(err, user){
        if(err) return done(err);

        if(!user){
          req.flash("email", req.body.email);
          return done(null, false, req.flash('loginError', 'No user found'));
        }
        if(user.password != password){
          req.flash("email", req.body.email);
          return done(null, false, req.flash('loginError', 'Password does not match'));
        }
        return done(null, user);
      });
    }
  )
);
// set routes
app.get('/', function(req, res){
  res.redirect('/posts');
});
app.get('/login', function(req,res){
  res.render('/posts/login', {emial:req.flash("email")[0], loginError:req.flash('loginError')});
});

app.post('/login',
  function (req, res, next){
    req.flash('email'); //flash email data
    if(req.body.email.length === 0 || req.body.password.length === 0){
      req.flash("email", req,body.email);
      req.flash("loginError", "Please enter both email and password");
      res.redirect("/login");
    }
    else {
      next();
    }
  }, passport.authenticate('local-login', {
    successRedirect : '/posts',
    failureRedirect : '/login',
    failureFlash : true
  })
);
app.get('/logout', function (req, rest){
  req.logout();
  res.redirect('/');
});

app.get('/posts', function(req,res){
  Post.find({}).sort('-createdAt').exec(function(err, posts){
  //Post.find({},function(err, posts){
    if(err) return res.json({success:false, message:err});
    res.render("posts/index", {data:posts});
  });
}); //index

app.get('/posts/new', function(req,res){
  res.render('posts/new');
}); //new

app.post('/posts', function(req,res){
  //console.log(req.body);
  Post.create(req.body.post, function(err, post){
    if(err) return res.json({success:false, message:err});
    //res.json({success:true, data:post});
    res.redirect('/posts');
  });
}); //create

app.get('/posts/:id', function(req,res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.render('posts/show', {data:post});
  //  res.json({success:true, data:post});
  });
}); //show

app.get('/posts/:id/edit', function(req,res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.render('posts/edit', {data:post});
  });
}); //edit_view

app.put('/posts/:id', function(req,res){
  req.body.post.updatedAt = Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post){
    if(err) return res.json({success:false, message:err});
    //res.json({success:true, message:post._id+" updated"});
    console.log(req.params.id);
    res.redirect('/posts/'+req.params.id);
  });
}); //update

app.delete('/posts/:id', function(req, res){
  Post.findByIdAndRemove(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');
    //res.json({success:true, message:post._id+" deleted"});
  });
}); //dalete


//start Server
app.listen(8000, function(){
  console.log('Server On!');
});






/*
Data.findOne({name:"myData"},function(err,data){
  if(err) return console.log("Data error :", err);
  if(!data)
  {
    Data.create({name:"myData",count:0},function(err,data){
      if(err) return console.log("Data error2 :", err);
      console.log("Counter initialized :", data);
    });
  }
});



//var data ={count:0};
app.get('/reset', function(req,res){
  setCounter(res,0);
});
app.get('/set/count', function(req,res){
  if(req.query.count) setCounter(res, req.query.count);
  else getCounter(res);
});

function setCounter(res, num)
{
  console.log('setCounter');
  Data.findOne({name:'myData'}, function(err, data){
    if(err) return console.log('Data error3', err);
    data.count = num;
    data.save(function (err){
      if(err) return console.log('Data errer4', err);
      res.render('my_first_ejs', data);
    });
  });
}

function getCounter(res)
{
  console.log('getCounter');
  Data.findOne({name:'myData'}, function (err,data){
    if(err) return console.log('Data error5', err);
    res.render('my_first_ejs', data);
  });
}

app.get('/', function(req, res){
  Data.findOne({name:"myData"},function(err,data){
    if(err) return console.log("Data error6 :", err);
    data.count++;
    data.save(function(err){
      if(err) return console.log("Data error7", err);
      res.render('my_first_ejs', data);
    });
  });
});
*/
/*
app.get('/', function(req, res){
  data.count++;
  res.render('my_first_ejs', data);
});

app.get('/reset', function(req, res){
  data.count = '리셋';
  res.render('my_first_ejs', data);
});

app.get('/set/count', function(req, res){
  if(req.query.cnt) data.count = req.query.cnt;
  res.render('my_first_ejs', data);
});

app.get('/set/:num', function(req, res){
  data.count = req.params.num;
  res.render('my_first_ejs',data);
});
*/
