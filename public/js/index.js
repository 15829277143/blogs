/**
 * New node file
 */
var app = angular.module('myApp', []);
app.controller("ctrl", ['$scope', '$http', function($scope, $http) {
	//	$http.post('/api/user/register').then(function(data) {
	//		$scope.data = data;
	//	})
	//				$scope.data = ['HTML', "CSS", 'Javascript', 'AngularJs', 'jQuery', 'bootstrap'];
	$scope.name = 'wangpei';
	$scope.frameworks = ['Node.js', 'Express', 'AnjularJS'];
}])
var $register = $("#register");
var $login = $("#login");
var $userDetial = $('#userDetial');
$register.hide();
$login.show();
//$userDetial.hide();
//	alert($register.find('a').length);
$register.find('button').on('click', function() {
	//		alert(1)
	$.ajax({
		type: "post",
		url: "/api/user/register",
		data: {
			username: $register.find('[name = "username"]').val(),
			password: $register.find('[name = "password"]').val(),
			repassword: $register.find('[name = "repassword"]').val()
		},
		dataType: 'json',
		success: function(result) {
			$('#register .box').html(result.message);
			if(!result.code) {
				//注册成功 切换至登录页面
				setTimeout(function() {
					$login.show();
					$register.hide();

				}, 1000);
				window.location.reload();
			}
		}

	});
});
$register.find('a').on('click', function() {
	$login.show();
	$register.hide()
});
$login.find('a').on('click', function() {
	$login.hide();
	$register.show()
})

//登录
$login.find('button').on('click', function() {
	$.ajax({
		type: 'post',
		url: '/api/user/login',
		data: {
			username: $login.find('[name="username"]').val(),
			password: $login.find('[name="password"]').val()
		},
		dataType: 'json',
		success: function(result) {
			$('#login .box').html(result.message);
			if(!result.code) {
				//登录成功
				setTimeout(function() {
					window.location.reload();
				}, 1000)

			}
		}
	})
});

//退出
$('#loginout').on('click', function() {
	$.ajax({
		type: "get",
		url: "/api/user/loginout",
		success: function(result) {
			if(!result.code) {
				window.location.reload();
			}
		}
	});
})

//分页
function paging() {
	alert($('.panel').length)
	$('.panel:gt(3)').hide(); //显示四条  其余隐藏
	var content_pages = $('.panel').index() + 1 //获取总数
	var content_page = 4; //每页显示的数据
	var content_num = 1; //当前页数
	var total_page = Math.round(content_pages / content_page); //总页数
	var next = $(".next"); //下一页
	var prev = $(".prev"); //上一页

	next.on('click', function() {
		++current_num;
		$.each($('.panel'), function(index, item) {
			var start = content_page * (content_num - 1); //起始范围
			var end = content_page * content_num; //结束范围
			if(index >= start && index < end) { //如果索引值是在start和end之间的元素就显示，否则就隐藏
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	});

	prev.on('click', function() {
		--current_num;
		$.each($('.panel'), function(index, item) {
			var start = content_page * (content_num - 1); //起始范围
			var end = content_page * content_num; //结束范围
			if(index >= start && index < end) { //如果索引值是在start和end之间的元素就显示，否则就隐藏
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	})
}

