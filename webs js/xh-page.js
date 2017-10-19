(function(window) {
	var u = {};
	// 当前页
	var pageNo = 1;
	// 页尺寸
	var pageSize = 15;
	// 总页数
	var allPage = 0;
	// 额外信息
	var others = {};
	// 获取信息接口
	var apiUrl = 'page-data.action';
	// 回调函数
	var callBack;
	// 模板
	var model = '#list-template';
	// 目标位置
	var target = '#list-data';

	function layPageInit() {
		laypage({
			cont : 'table-pager', // 容器。值支持id名、原生dom对象，jquery对象,
			pages : allPage, // 总页数
			skip : false, // 是否开启跳页
			skin : '#5A98DE',
			groups : 3, // 连续显示分页数
			first : '首页', // 若不显示，设置false即可
			last : '尾页', // 若不显示，设置false即可
			prev : '上一页', // 若不显示，设置false即可
			next : '下一页', // 若不显示，设置false即可
			hash : true, // 开启hash
			jump : function(obj, first) { // 触发分页后的回调
				pageNo = obj.curr;
				if (!first) {
					search(false);
				}
			}
		});
	}

	/**
	 * 查询方法
	 */
	function search(isReload) {
		// 重载则刷新
		if (isReload) {
			pageNo = 1;
		}

		var data = others;
		data.pageNo = pageNo;
		data.pageSize = pageSize;
		// 置空列表
		$(target).empty();
		ajax.json(apiUrl, data, function(ret) {
			// 判断返回数据形式,若有附加数据,将页面内容单独提取
			var pageData;
			if (ret.content) {
				pageData = ret.content;
			} else {
				pageData = ret;
			}
			// 判断列表非空
			if(!pageData.isNotNullList) {
				var gettpl = $(model).html();
				laytpl(gettpl).render(pageData, function(html) {
					$(target).html(html);
					// 执行回调函数, 传参页面数据, 若有附加信息,则传入
					'function' === typeof callBack && callBack(pageData, ret.extra);
					// 总页数
					if (isReload) {
						allPage = pageData.allPage;
						layPageInit();
					}
				});
				// 显示共有条目和页数
				$('#allRow').text(pageData.allRow);
				$('#allPage').text(pageData.allPage);
			}
		});
	}

	/**
	 * 重载全部
	 */
	u.reload = function() {
		search(true);
	}

	/**
	 * 刷新内容
	 */
	u.refresh = function() {
		search(false);
	}
	/**
	 * 默认url初始化,仅分页查询
	 * 
	 * @Data info参数说明
	 * @Param targetClass :
	 *            目标类
	 * @Param orderBy :
	 *            排序方式
	 * @Param model :
	 *            目标模板(默认为: '#list-template')
	 * @Param target :
	 *            目标位置(默认为: '#list-data')
	 */
	u.deft = function(info, fn) {
		others = {
			targetClass : info.targetClass,
			orderBy : info.orderBy
		}
		init(info, fn);
	}
	/**
	 * 指定url初始化,附加查询条件
	 * 
	 * @Data info参数说明
	 * @Param data :
	 *            obj-{'':''.....},查询数据对象
	 * @Param model :
	 *            目标模板(默认为: '#list-template')
	 * @Param target :
	 *            目标位置(默认为: '#list-data')
	 */
	u.init = function(url, info, fn) {
		apiUrl = url;
		if (info && info.data) {
			others = info.data;
		}

		init(info, fn);
	}
	// 通用初始化部分
	function init(info, fn) {
		if (info) {
			// 目标模板
			if (info.model) {
				model = info.model;
			}
			// 目标位置
			if (info.target) {
				target = info.target;
			}
		}
		// 自定义回调
		if (fn) {
			callBack = fn;
		}
		search(true);
	}

	/**
	 * 分页js
	 */
	window.page = u;
})(window);
