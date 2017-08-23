var express = require('express');
var router = express.Router();

var User = require('../modules/User');
var Category = require('../modules/Category');
var Content = require('../modules/Contents');

router.use(function(req, res, next) {
	if(!req.userInfo.isAdmin) {
		//不是管理员
		res.send('对不起，只有管理员才能进入');
		return;
	}
	next();
});
router.get('/', function(req, res, next) {
	res.render('admin/index', {
		userInfo: req.userInfo
	})
})

//用户管理
router.get('/user', function(req, res, next) {
	/*
	 * 读取数据库的数据并展示
	 */
	/*
	 * limit(number)限制获取的数据条数
	 * 
	 * skip() 忽略数据的条数
	 * 
	 * 每页显示两条
	 * 1:1-2 skip：0->（忽略当前页-1）*limit
	 * 2:3-4 skip：2
	 */
	var page = Number(req.query.page || 1);
	var limit = 2;
	var pages = 0;
	User.count().then(function(count) {
		//计算总页数
		pages = Math.ceil(count / limit);
		//取值不能超过
		page = Math.min(page, pages);
		//取值不能小于1
		page = Math.max(page, 1);
		var skip = (page - 1) * limit;
		User.find().limit(limit).skip(skip).then(function(users) {
			//			console.log(users);
			res.render('admin/user_index', {
				userInfo: req.userInfo,
				users: users,
				page: page,
				count: count,
				pages: pages,
				limit: limit
			});
		});
	})
});
//分类首页
router.get('/category', function(req, res) {
	var page = Number(req.query.page || 1);
	var limit = 2;

	var pages = 0;
	Category.count().then(function(count) {
		//计算总页数
		pages = Math.ceil(count / limit);
		//取值不能超过
		page = Math.min(page, pages);
		//取值不能小于1
		/*
		 * sort()
		 * 1:升序
		 * -1：降序
		 */
		page = Math.max(page, 1);
		var skip = (page - 1) * limit;
		Category.find().sort({
			_id: -1
		}).limit(limit).skip(skip).then(function(categories) {
			//			console.log(users);
			res.render('admin/category_index', {
				userInfo: req.userInfo,
				categories: categories,
				page: page,
				count: count,
				pages: pages,
				limit: limit
			});
		});
	})

})
/*
 * 分类的添加
 */
router.get('/category/add', function(req, res) {
	res.render('admin/category_add', {
		userInfo: req.userInfo
	});
});

/*
 * 分类保存
 */
router.post('/category/add', function(req, res) {
	var name = req.body.name || '';
	if(name == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "名称不能为空"
		});
		return;
	}
	//	console.log(req.body)
	//查询数据库是否有该记录
	Category.findOne({
		name: name
	}).then(function(fs) {
		console.log(fs)
		//数据库中已存在此分类
		if(fs) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				message: '分类已经存在'
			})
			return Promise.reject();
		} else {
			//数据库中不存在，保存
			return new Category({
				name: name
			}).save();
		}
	}).then(function(newCategory) {
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '分类保存成功',
			url: '/admin/category'
		});
	})
});

/*
 * 
 * 分类修改
 */
router.get('/category/edit', function(req, res) {
	//获取要修改的信息，并用表单的形式展示出来
	var id = req.query.id || '';

	//获取要修改的分类信息
	Category.findOne({
		_id: id
	}).then(function(category) {
		console.log(category)
		if(!category) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				message: '分类信息不存在'
			});
		} else {
			res.render('admin/category_edit', {
				userInfo: req.userInfo,
				category: category
			});
		}
	})
})
/*
 * 分类的修改保存
 */
router.post('/category/edit', function(req, res) {
	//获取要修改的信息，并用表单的形式展示出来
	var id = req.query.id || '';
	//获取修改后的名称
	var name = req.body.name || '';
	Category.findOne({
		_id: id
	}).then(function(category) {
		console.log(category)
		if(!category) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				message: '分类信息不存在'
			});
			return Promise.reject()
		} else {
			//当用户没有任何修改提交的时候
			if(name == category.name) {
				res.render('admin/success', {
					userInfo: req.userInfo,
					message: '修改成功',
					url: '/admin/category'
				});
				return Promise.reject()
			} else {
				//要修改的名称是否已在数据库中存在
				return Category.findOne({
					_id: {
						$ne: id
					},
					name: name
				})
			}
		}
	}).then(function(sameCategory) {
		if(sameCategory) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				message: '数据库中已经存在同名分类',
				url: '/admin/category'
			});
			return Promise.reject()
		} else {
			return Category.update({
				_id: id
			}, {
				name: name
			});
		}
	}).then(function() {
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '修改成功',
			url: '/admin/category'
		});
	})

})
/*
 * 分类删除
 */
router.get('/category/delete', function(req, res) {
	var id = req.query.id || '';

	Category.remove({
		_id: id
	}).then(function() {
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '删除成功',
			url: '/admin/category'
		});
	})
})

/*
 * 内容首页
 */
router.get('/content', function(req, res) {
	var page = Number(req.query.page || 1);
	var limit = 4;

	var pages = 0;
	Content.count().then(function(count) {
		//计算总页数
		pages = Math.ceil(count / limit);
		//取值不能超过
		page = Math.min(page, pages);
		//取值不能小于1
		/*
		 * sort()
		 * 1:升序
		 * -1：降序
		 * populate('category')查询关联的category表
		 */
		page = Math.max(page, 1);
		var skip = (page - 1) * limit;
		Content.find().sort({
			_id: -1
		}).limit(limit).skip(skip).populate(['category','user']).sort({addTime:-1}).then(function(contents) {
			res.render('admin/content_index', {
				userInfo: req.userInfo,
				contents: contents,
				page: page,
				count: count,
				pages: pages,
				limit: limit
			});
		});
	})
});
/*
 * 内容添加页面
 */
router.get('/content/add', function(req, res) {
	Category.find().sort({
		_id: -1
	}).then(function(rs) {
		res.render('admin/content_add', {
			userInfo: req.userInfo,
			category: rs
		});
	})
});

//内容保存
router.post('/content/add', function(req, res) {
	//	console.log(req.body)
	if(req.body.category == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: '分类内容不能为空',
			url: '/admin/content/add'
		});
		return;
	}
	if(req.body.title == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: '分类标题不能为空',
			url: '/admin/content'
		});
		return;
	}
	//保存数据到数据库
	new Content({
		category: req.body.category,
		title: req.body.title,
		user:req.userInfo._id.toString(),
		description: req.body.describe,
		content: req.body.content
	}).save().then(function(rs) {
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '内容保存成功',
			url: '/admin/content'
		});
	});
});
/*
 * 修改内容
 */
router.get('/content/edit', function(req, res) {

	var id = req.query.id || '';
	var category = [];
	Category.find().sort({
		_id: 1
	}).then(function(rs) {
		category = rs;
		return Content.findOne({
			_id: id

		}).populate('category').then(function(content) {
			if(!content) {
				res.render('admin/error', {
					userInfo: req.userInfo,
					message: '内容不存在',
					url: '/admin/content'
				});
				return Promise.reject();
			} else {
				res.render('admin/content_edit', {
					userInfo: req.userInfo,
					category: category,
					content: content
				})
			}
		})
	})

})

/*
 * 保存修改内容
 */
router.post('/content/edit',function(req,res){
	var id = req.query.id || '';
	if(req.body.category == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: '分类内容不能为空',
			url: '/admin/content/add'
		});
		return;
	}
	Content.update({
		_id:id
	},{
		category: req.body.category,
		title: req.body.title,
		description: req.body.describe,
		content: req.body.content
	}).then(function(){
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '保存成功',
			url: '/admin/content'
		});
	})
})
/*
 * 内容删除
 * 
 */
router.get('/content/delete',function(req,res){
	var id = req.query.id||'';
	Content.remove({
		_id:id
	}).then(function(){
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '删除成功',
			url: '/admin/content'
		});
	})
})



module.exports = router;