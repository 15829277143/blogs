var express = require('express');
var router = express.Router();
var User = require('../modules/User');
var Content = require('../modules/Contents');
//统一返回格式
var responseData;
router.use(function(req, res, next) {
	responseData = {
		code: 0,
		message: ''
	}
	next();
});

/*
 * 用户注册
 * 注册逻辑
 * 
 * 1、用户名不能为空
 * 2、密码不能为空
 * 3、两次输入密码一致
 *
 * 
 * 1、用户名是否已经被注册
 * 		数据库查询
 */
router.post('/user/register', function(req, res, next) {
	//	res.send('admin-User');
	var username = req.body.username;
	var password = req.body.password;
	var repassword = req.body.repassword;
	//	console.log(1);
	//用户名是否为空
	if(username == '') {
		responseData.code = 1;
		responseData.message = '用户名不能为空';
		res.json(responseData);
		return;
	}
	if(password == '') {
		responseData.code = 2;
		responseData.message = '密码不能为空';
		res.json(responseData);
		return;
	}
	if(password != repassword) {
		responseData.code = 3;
		responseData.message = '两次密码不一致';
		res.json(responseData);
		return;
	}
	//用户是否已经被注册过了  如果数据库中已经存在和我们要注册得用户同名得数据  表示已经被注册过了
	//	User.find();
	//	User.findOne({username:'qqq216'}).then(function(useinfo){
	//		if(userinfo){
	//			console.log(userinfo)
	//		}else{
	//			console.log(1)
	//		}
	//		
	//	})
	User.findOne({
		username: username
	}).then(function(userInfo) {
		if(userInfo) {
			responseData.code = 4;
			responseData.message = '该用户已被注册';
			res.json(responseData);
			console.log(userInfo)
			return;
		}
		//保存用户注册得信息到数据库中
		//		console.log(userInfo);
		var user = new User({
			username: username,
			password: password
		});
		//		console.log(user);
		user.save();
	}).then(function(newUserInfo) {
		console.log(newUserInfo);
		responseData.message = '注册成功';
		res.json(responseData);
	});

	//	console.log(req.body);
	//return data;
});

router.post('/user/login', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	if(username == '' || password == '') {
		responseData.code = 1;
		responseData.message = '用户名和密码不能为空';
		res.json(responseData);
		return;
	}

	//查询数据库中相同用户名和密码是否一致 如果存在则登录成功
	User.findOne({
		username: username,
		password: password
	}).then(function(userInfo) {
		if(!userInfo) {
			responseData.code = 2;
			responseData.message = '用户名和密码错误';
			res.json(responseData);
			return;
		}
		responseData.code = 0;
		responseData.message = '登陆成功';
		responseData.userInfo = {
			_id: userInfo._id,
			username: userInfo.username
		}
		req.cookies.set('userInfo', JSON.stringify({
			_id: userInfo._id,
			username: userInfo.username
		}));
		res.json(responseData);
		return;
	})

});
router.get('/user/loginout', function(req,res) {
	req.cookies.set('userInfo', null);
	res.json(responseData);
})
/*
 *获取指定文章的所有评论
 */
router.get('/comment',function(req,res){
	//内容id
	var contentId = req.query.contentId||'';
	Content.findOne({
		_id:contentId
	}).then(function(content){
		responseData.data = content.comments;
		res.json(responseData);
	});	
})
/*
 * 评论提交
 */

router.post('/comment/post',function(req,res){
	//内容id
	var contentId = req.body.contentId||'';
	var postData = {
		username:req.userInfo.username,
		postTime: new Date(),
		content:req.body.content
	};
//	console.log(contentId)
	//查询当前这篇内容的信息
	Content.findOne({
		_id:contentId
	}).then(function(content){
		content.comments.push(postData);
//		console.log(content)
		return content.save();
	}).then(function(newContent){
		responseData.message = '评论成功';
		responseData.data = newContent;
		res.json(responseData);
	});	
})
module.exports = router;