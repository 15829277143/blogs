//每页显示的条数 
var limit = 3;
//当前页数
var page = 1;
//总页数
var pages = 0;
var comments = [];

//每次页面重载一下获取该文章的所有评论
$.ajax({
	type: "get",
	dataType: 'json',
	url: "/api/comment",
	data: {
		contentId: $('#hidden1').val(),
	},
	success: function(responseData) {
		//			console.log(responseData.data.comments)
		$('#inp').val('');
		comments = responseData.data.reverse()
		renderComment();
	}
});
//事件委托
$('.pager').delegate('a', 'click', function() {
	if($(this).parent().hasClass("previous")) {
		page--;
	}
	if($(this).parent().hasClass("next")) {
		page++;
	}
	renderComment();
})
//提交评论
$('#btn1').on('click', function() {
	$.ajax({
		type: "post",
		dataType: 'json',
		url: "/api/comment/post",
		data: {
			contentId: $('#hidden1').val(),
			content: $('#inp').val()
		},
		success: function(responseData) {
			//			console.log(responseData.data.comments)
			$('#inp').val('');
			comments = responseData.data.comments.reverse()
			renderComment();
		}
	});
})

function renderComment() {
	var start = Math.max(0, (page - 1) * limit);     //返回两值中较大的
	var end = Math.min(page * limit, comments.length);  //返回两值中较小的
	pages = Math.max(Math.ceil(comments.length / limit), 1);
	$('.pager li').eq(1).html(page + '/' + pages);
	if(page <= 1) {
		$('.pager li').eq(0).html('<span>没有上一页了</span>')
	} else {
		$('.pager li').eq(0).html('<a href="javascript:;">上一页</a>')
	}
	if(page >= pages) {
		page = pages;
		$('.pager li').eq(2).html('<span>没有下一页了</span>');
	} else {
		$('.pager li').eq(2).html('<a href="javascript:;">下一页</a>')
	}
	if(comments.length == 0) {
		$('#list').html('<p class="word">你还没有评论！！！</p>');
	} else {

		var html = '<hr/>';
		for(var i = start; i < end; i++) {
			html += '<div class = "clearfix"><span>' + comments[i]['username'] + '</span><span>' + formatDate(comments[i]['postTime']) +
				'</span><h5>' + comments[i]['content'] + '</h5><hr/></div>';
		}
		count = comments.length;
		$('#list').html(html);
		$('#span').html('一共有' + comments.length + '条评论');
	}
}

function formatDate(d) {
	var date1 = new Date(d);
	//	console.log(date1);			getDay()  //星期
	return date1.getFullYear() + "年" + full((date1.getMonth() + 1)) + '月' + full(date1.getDate()) + '日' +
		full(date1.getHours()) + ':' + full(date1.getMinutes()) + ':' + full(date1.getSeconds());
}

function full(a) {
	if(a < 10) {
		return '0' + a;
	} else return a;
}
//分页
function paging() {
	alert($('#list>div').length)
	$('#list>div:gt(limit)').hide();
}

//paging();