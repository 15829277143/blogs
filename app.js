/**
 * New node file
 * 应用程序的启动（入口）文件
 */

//加载一个express模块
var express = require('express');
//加载模版处理模块
var swig = require('swig');
//加载mongoose模块
var mongoose = require('mongoose');
//加载body-parser 用来处理post提交的数据
var bodyParser = require('body-parser');
//加载cookies模块
var Cookies = require('cookies');
//创建app应用=>NodeJs Http.createserver();
var app = express();
//设置静态文件托管
//当用户访问的url以/public开始 那么直接返回对应__dirname+'/public'下的文件
app.use('/public',express.static(__dirname+'/public'));

var User = require('./modules/User');
//设置cookies
app.use(function(req,res,next){
	req.cookies = new Cookies(req,res);
	
	//解析登陆用户的cookies信息
	req.userInfo = {};
	if(req.cookies.get('userInfo')){
		try{
			req.userInfo = JSON.parse(req.cookies.get('userInfo'));
			
			//获取当前登陆用户的类型  是否为管理员
			User.findById(req.userInfo._id).then(function(userInfo){
				req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
				next();
			})
		}catch(e){
			next();
		}
	}else{
		next();
	}
//	console.log(req.cookies.get('userInfo'))
})
//配置应用模版
//定义当前应用所使用的模块引擎
//第一个参数：模块引擎的名称，同时也是模块文件的后缀，第二个参数标识用于解析处理模版内容的方法
app.engine('html',swig.renderFile);
//设置模版文件存放的目录，第一个参数必须时views，第二个参数是目录
app.set('views','./views');
//注册所使用的模块引擎，第一个参数必须是view engine 第二个参数和app.engine这个方法中定义的模块引擎的名称（第一个参数）是一致的

app.set('view engine','html');
//在开发过程中，需要取消模版缓存 修改完内容就  不用重启服务器
swig.setDefaults({cache:false});

app.use(bodyParser.urlencoded({extended:true}));
/*
 * 根据不同的功能来划分模块
 */

app.use('/admin',require('./router/admin'));
app.use('/api',require('./router/api'));
app.use('/',require('./router/main'));





/*
 *首页
 * req request对象
 * res response对象
 * next 函数
 */

//app.get('/',function(req,res,next){
////	res.send('<h1>欢迎访问我的博客！</h1>');
//	/*
//	 * 读取views目录下的指定文件，解析并返回给客户端
//	 * 第一个参数 表示模版的文件，相对于views目录
//	 */
//	res.render('index');
//})
//app.get('/main.css',function(req,res,next){
//	res.setHeader('content-type','text/css');
//	res.send('body{background:red;}');
//});


//监听http请求
//mongoose.connect('mongodb://localhost:27018/blog',function(err){
//	if(err){
//		console.log('数据库连接失败');
//	}else{
//		console.log('数据库连接成功');
//		app.listen(8032);
//	}
//});   //连接数据库
mongoose.connect('mongodb://localhost:27017/blog',{useMongoClient: true});//连接数据库
var connection=mongoose.connection;
connection.on('error',function(err){
    if(err){
        console.log(err);
    }
});
connection.on('open',function(){
    console.log('数据库连接成功');
    app.listen(8033);
});

//用户发送http请求=>URL->解析路由->找到匹配规则->执行指定的绑定函数,返回对应内容至用户
//
///public->静态->直接读取指定目录下的文件,返回给用户
//->动态->处理业务逻辑,加载模版,解析模版->返回数据给用户

//mongod --dbpath=数据库存储文件 --port=27017