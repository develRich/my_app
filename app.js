//import modules
var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

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

var Post = mongoose.model("post", postSchema);
//view setting
app.set("view engine", 'ejs');

// set middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// set routes
app.get('/posts', function(req,res){
  Post.find({}, function(err, posts){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:posts});
  });
}); //index

app.post('/posts', function(req,res){
  Post.create(req.body.post, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:post});
  });
}); //create

app.get('/posts/:id', function(req,res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:post});
  });
}); //show

app.put('/posts/:id', function(req,res){
  req.body.post.updatedAt = Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, message:post._id+" updated"});
  });
}); //updated

app.delete('/posts/:id', function(req, res){
  Post.findByIdAndRemove(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, message:post._id+" deleted"});
  });
}); //daleted


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
