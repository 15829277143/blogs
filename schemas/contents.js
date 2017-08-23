/**
 * New node file
 */
//数据库表
var mongoose = require('mongoose');
//内容的表结构
module.exports = new mongoose.Schema({
	//关联字段 --分类id
	category:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'Category'
	},
	//内容标题
	title:String,
	//简介
	description:{
		type:String,
		default:''
	},
	//内容
	content:{
		type:String,
		default:''
	},
	//用户id
	user:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'User'
	},
	//添加时间
	addTime:{
		//类型
		type:Date,
		default:new Date()
	},
	//阅读量
	views:{
		type:Number,
		default:0
	},
	//评论
	comments:{
		type:Array,
		default:[]
	}
});
