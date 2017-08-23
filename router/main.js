var express = require('express');
var router = express.Router();

var Category = require('../modules/Category');
var Content = require('../modules/Contents');

/*
 * 处理通用数据
 */
var data = {};
router.use(function(req, res, next) {
	data.userInfo = req.userInfo;
	data.categories = [];
	Category.find().then(function(category) {
		data.categories = category;
		next();
	})
})

router.get('/view', function(req, res) {
	var contentId = req.query.contentId || '';
	Content.findOne({
		_id:contentId
	}).then(function(content){
		data.content = content;
		content.views++;
		content.save();
		res.render('main/view',data);
	});

})
router.get('/', function(req, res, next) {
	//	console.log(req.userInfo)
	data.category = req.query.category || '';
	data.count = 0;
	data.page = Number(req.query.page || 1);
	data.limit = 4;
	data.pages = 0;
	data.content = [];
	var where = {};
	if(data.category) {
		where.category = data.category;
	}
	//读取所有信息
	Content.where(where).count().then(function(count) {
		data.count = count;
		//计算总页数
		data.pages = Math.ceil(data.count / data.limit);
		//取值不能超过
		data.page = Math.min(data.page, data.pages);
		//取值不能小于1
		data.page = Math.max(data.page, 1);
		//忽略的条数   1:1-5 忽略0条   2	：6-10 忽略1-5条
		var skip = (data.page - 1) * data.limit;

		return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({
			addTime: -1
		})
	}).then(function(contents) {

		data.content = contents;
		res.render('main/index', data);
//		console.log(data);
	})

});

module.exports = router;