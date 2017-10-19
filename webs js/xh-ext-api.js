/**
 * 星汉网络扩展JS包
 */
/**
 * @param window
 */
(function(window) {
	var a = {};
	/**
	 * 发送AJAX请求，默认POST方式发送请求
	 */
	a.post = function(url, data, callback) {
		ajax(url, data, callback);
	}
	/**
	 * json格式返回的ajax
	 */
	a.json = function(url, data, callback) {
		ajax(url, data, callback, {
			dataType : "json"
		});
	}

	a.application = function(url, data, callback) {
		ajax(url, JSON.stringify(data), callback, {
			contentType : "application/json",
			dataType : "json"
		});
	}
	/**
	 * ajax请求通用
	 * 
	 * @param url
	 *            请求地址
	 * @param data
	 *            数据
	 * @param callback
	 *            回调
	 * @param others
	 *            其它配置项
	 * @returns
	 */
	function ajax(url, data, callback, others) {
		if (!others) {
			others = {};
		}
		layer.load();
		jQuery.ajax({
			type : "post",
			url : url,
			data : data,
			dataType : others.dataType,
			contentType : others.contentType,
			success : function(ret) {
				layer.closeAll('loading');
				callback(ret);
			}
		});
	}
	window.ajax = a;

	var u = {};
	/**
	 * 循环获取页面表单信息,并拼接成data对象,将以表单项id为id
	 * 
	 * @param selector
	 *            选择器,选择一组表单项
	 */
	u.getData = function(selector) {
		var data = {};
		jQuery(selector).each(function() {
			if (jQuery.trim(this.value)) {
				data[this.id] = this.value;
			}
		});
		return data;
	}
	/**
	 * 使用通用删除方法删掉指定项
	 * 
	 * @data 方法data参数
	 * @param id :
	 *            目标id
	 * @param targetClass :
	 *            目标类名
	 * @param subClasses :
	 *            子集类名(逗号分隔, 若存在此项则检查子集中条目,若存在条目则禁止删除)
	 * @param subFields :
	 *            本类id在子集中字段名(逗号分隔,与上条数量相同,顺序对应)
	 * @param successFn :
	 *            删除成功后基本回调外,追加执行内容
	 */
	u.delTarget = function(data, callback) {
		// 去除data中的回调函数部分.
		var successFn = data.successFn;
		data.successFn = undefined;
		layer.confirm('确认删除该项？', function(index) {
			a.post('del-target.action', data, function(ret) {
				if ('function' == typeof callback) {
					callback(ret);
				} else {
					if (ret == 'S00000') {
						m.toast('成功删除!', 'success', function() {
							if ('function' == typeof successFn) {
								successFn();
							} else {
								page.refresh();
							}
						});
					} else {
						m.toast('该项存在其它关联项,无法直接删除!', 'fail');
					}
				}
			});
		});
	}
	/**
	 * 使用通用编辑方法编辑指定箱
	 * 
	 * @data 方法data参数:
	 * @param id :
	 *            目标id,置空则为添加
	 * @param targetClass :
	 *            目标类名
	 * @param unique :
	 *            目标唯一列(逗号分隔, 存在此项则检查其它条目,是否有重复值)
	 * @param ignore :
	 *            目标忽略列(逗号分隔, 存在此项则在编辑时自动忽略指定列的数据,相应数据将保持不变)
	 * @param something... :
	 *            目标对象信息.需与对应bean中的字段保持一致.
	 * @param refresh :
	 *            刷新方法
	 */
	u.editTarget = function(data, callback) {
		// 去除data中的回调函数部分.
		var refresh = data.refresh;
		data.refresh = undefined;
		a.post('add-or-edit.action', data, function(ret) {
			if ('function' == typeof callback) {
				callback(ret);
			} else {
				if (ret == 'S00000') {
					m.toast('成功保存!', 'success', function() {
						refresh();
						layer_close();
					});
				} else {
					m.toast('添加失败: 已存在重复项!', 'fail');
				}
			}
		});
	}
	/**
	 * 使用通用查询方法,自动获取全部数据
	 * 
	 * @data 方法data参数
	 * @param targetClass :
	 *            目标类名
	 * @param orderBy :
	 *            排序规则,若指定则按一定规则排序
	 * @others 若需使用默认回调,则需以下参数
	 * @param model :
	 *            指定js模板
	 * @param target :
	 *            默认回调的展示位置
	 * @param successFn(可选) :
	 *            默认回调执行完后的额外方法
	 */
	u.getAll = function(data, callback) {
		var successFn = data.successFn;
		data.successFn = undefined;
		a.json('get-all.action', data, function(ret) {
			if ('function' == typeof callback) {
				callback(ret);
			} else {
				u.tpl(ret, data.model, data.target, successFn);
			}
		});
	}
	/**
	 * 模板填充
	 * 
	 * @param data :
	 *            数据信息
	 * @param model :
	 *            模板('#id')
	 * @param target :
	 *            目标位置('#id')
	 * @param fn :
	 *            填充后回调(可空)
	 */
	u.tpl = function(data, model, target, fn) {
		tpl(data, model, function(html) {
			jQuery(target).html(html);
		}, fn);
	}
	/**
	 * 模板追加
	 * 
	 * @param data :
	 *            数据信息
	 * @param model :
	 *            模板('#id')
	 * @param target :
	 *            目标位置('#id')
	 * @param fn :
	 *            填充后回调(可空)
	 */
	u.tpladd = function(data, model, target, fn) {
		tpl(data, model, function(html) {
			jQuery(target).append(html);
		}, fn);
	}
	/**
	 * 模板填充
	 * 
	 * @param data
	 *            数据
	 * @param model
	 *            模板
	 * @param callBack
	 *            回调
	 * @param fn
	 *            额外方法
	 * @returns
	 */
	function tpl(data, model, callBack, fn) {
		laytpl(jQuery(model).html()).render(data, function(html) {
			callBack(html);
			'function' == typeof fn && fn();
		});
	}
	/**
	 * 链接字符串转换為js对象
	 */
	u.toObj = function() {
		// 若无,返回空
		if (location.search) {
			// 获取链接字符串并去除'?'
			var str = decodeURI(location.search).substr(1);
			// 将链接字符串按组拆分
			var info = str.split("&");
			// 创建data;
			var data = {};
			for (var i = 0; i < info.length; i++) {
				if (info[i]) {
					// 将key和value分开,存入缓存数组,并写入data
					var temp = info[i].split("=");
					if(temp[1]) {
						data[temp[0]] = temp[1];
					}
				}
			}
			return data;
		}
		return {};
	}
	/**
	 * 点击放大图片
	 * 
	 * @param url
	 *            图片地址
	 * @author TongYinLing
	 */
	u.largerPic = function(url) {
		var img = new Image(); // 图片预加载
		img.src = url;
		var width = Number(img.width) + 18;
		var height = Number(img.height) + 18;
		if (img) {
			layer.open({
				type : 2,
				title : false,
				area : [ width + 'px', height + 'px' ],
				closeBtn : 0,
				skin : 'layui-layer-nobg',
				shadeClose : true,
				content : url
			});
		} else {
			alert("图片加载失败");
		}
	}

	/**
	 * 以隐藏中间四位的方式显示手机号
	 */
	u.hidePhone = function(phone) {
		if (phone) {
			return phone.slice(0, 3) + '****' + phone.slice(-4)
		}
		return '';
	}

	/**
	 * 是否存在
	 */
	u.isExist = function(item, arr) {
		return arr.indexOf(item) != -1;
	}
	/**
	 * 获取数字值
	 */
	u.getNum = function(value) {
		return Number(jQuery.trim(value));
	}

	/**
	 * 获取Input中数字
	 */
	u.inputNum = function(selector) {
		return Number(jQuery.trim(jQuery(selector).val()));
	}

	/**
	 * 处理图片路径
	 */
	u.imgRemark = function(src, remark) {
		return src.replace('.jpg', '-' + remark + '.jpg');
	}

	/**
	 * 获取文件名
	 */
	u.fileName = function(path) {
		if(path) {
			return path.substring(path.lastIndexOf('/') + 1);
		}
		return '';	
	}
	
	/**
	 * 星汉网络的扩展包
	 */
	window.extApi = u;

	var m = {};
	// 成功
	m.ret = 'success';
	// 失败
	m.fail = 'fail';
	// 警告
	m.warn = 'warn';
	// 错误
	m.err = 'error';
	/**
	 * 自动隐藏的提示信息
	 */
	m.toast = function(msg, type, fn) {
		var icon;
		if (type != undefined) {
			switch (type) {
			case m.ret:
				icon = 6;
				break;
			case m.fail:
				icon = 5
				break;
			case m.warn:
				icon = 0
				break;
			case m.err:
				icon = 2
				break;
			// 默认,无
			default:
				break;
			}
		}
		// 显示提示
		layer.msg(msg, {
			icon : icon,
			time : 1000,
			end : fn
		});
	}
	/**
	 * 锚点小提示
	 */
	m.tips = function(content, target, others) {
		if (!others) {
			others = {};
		}
		if (!others.direction) {
			others.direction = 3;
		}
		if (!others.color) {
			others.color = '#293C55';
		}
		location.hash = target;
		layer.tips(content, target, {
			time : 2000,
			tips : [ others.direction, others.color ],
			tipsMore : true
		});
	}
	/**
	 * 告警提示信息，依赖于layer插件
	 */
	m.alert = function(msg, type) {
		var icon;
		switch (type) {
		case m.ret:
			icon = 1;
			break;
		case m.fail:
			icon = 2;
			break;
		default:
			break;
		}
		// 显示提示
		layer.alert(msg, {
			icon : icon
		});
	}

	window.msg = m;

	/**
	 * layer编辑页扩展
	 */
	var e = {};
	/**
	 * 弹出窗口
	 * 
	 * @Param winName
	 *            窗口名称
	 * @Param pageName
	 *            页面名称
	 * @Param className
	 *            类名
	 * @Param id
	 *            对应id
	 * @Param h
	 *            页面高
	 * @Param w
	 *            页面宽
	 */
	e.show = function(winName, pageName, className, id, w, h, others) {
		layer_show(winName, getUrl(pageName, className, id, others), w, h);
	}

	/**
	 * 弹出窗口并铺满
	 * 
	 * @Param winName
	 *            窗口名称
	 * @Param pageName
	 *            页面名称
	 * @Param className
	 *            类名
	 * @Param id
	 *            对应id
	 */
	e.full = function(winName, pageName, className, id, others) {
		layer_full(winName, getUrl(pageName, className, id, others));
	}

	/**
	 * 获得url
	 * 
	 * @param pageName
	 * @param className
	 * @param id
	 * @returns
	 */
	function getUrl(pageName, className, id, others) {
		var url = 'edit-page.action?targetClass=' + className + '&page='
				+ pageName;
		if (others) {
			for ( var key in others) {
				url += '&' + key + '=' + others[key];
			}
		}
		if (id) {
			url += '&id=' + id;
		}
		return url;
	}
	window.extLayer = e;

	/**
	 * 下拉框自动渲染
	 */
	var s = {};

	/**
	 * 添加模板
	 * 
	 */
	function pushScriptModel(conf) {
		var script = '<script type="text/html" id="' + conf.id + '-select">';
		// 默认初始选项
		if (conf.defaultOption) {
			if (!conf.defaultOption.value) {
				conf.defaultOption.value = '';
			}
			script += '<option value="' + conf.defaultOption.value + '">'
					+ conf.defaultOption.text + '</option>';
		}
		// 选项组
		if (conf.optionArr) {
			for (var i = 0; i < conf.optionArr.length; i++) {
				script += '<option value="' + conf.optionArr[i][0] + '">'
						+ conf.optionArr[i][1] + '</option>';
			}
		}
		script += '{{# for(var i = 0; i < d.length; i++) { }}';
		// 选项配置
		if (!conf.option) {
			conf.option = {
				valueKey : 'id',
				textKey : 'name',
				others : ''
			}
		} else {
			// 选项值
			if (!conf.option.valueKey) {
				conf.option.valueKey = 'id';
			}
			// 选项文本
			if (!conf.option.textKey) {
				conf.option.textKey = 'name';
			}
			// 其它信息
			if (!conf.option.others) {
				conf.option.others = '';
			}
		}
		script += '<option value="{{d[i].' + conf.option.valueKey + '}}" '
				+ conf.option.others + '>{{d[i].' + conf.option.textKey
				+ '}}</option>';
		script += '{{# } }}</script>';

		jQuery('html').append(script);
	}
	/**
	 * 获取全部信息,填充下拉列表
	 * 
	 * <pre>
	 * conf : {
	 *  id : 目标select的id标识
	 *  targetClass : 目标数据类
	 *  initValue : 默认选项
	 *  defaultOption : { 可选,默认初始选项的内容,无则没有默认初始选项
	 *  	value : 可选,默认初始选项的值,默认值为''
	 *  	text : 必填,默认初始选项的文本.
	 *  }
	 *  optionArr : [ 可选, 选项内容组
	 *  	[
	 *  		value : 初始选项值
	 *  		text : 初始选项文本
	 *  	],...
	 *  ]
	 *  option : { 可选,选项值配置
	 *  	valueKey : 可选,值的key,默认为id.
	 *  	textKey : 可选,文本的key,默认为name.
	 *  	others : 可选,其它信息,默认为''.
	 *  }
	 * }
	 * fn : 其它回调函数
	 * </pre>
	 */
	s.all = function(conf, fn) {
		pushScriptModel(conf);
		u.getAll({
			targetClass : conf.targetClass,
			model : '#' + conf.id + '-select',
			target : '#' + conf.id,
			successFn : function() {
				// 初始化选择
				if (conf.initValue) {
					jQuery('#' + conf.id).val(conf.initValue);
				}
				// 其它
				'function' === typeof fn && fn();
			}
		})
	}
	/**
	 * 联动选框
	 * 
	 * <pre>
	 * conf : {
	 *  id : 目标select的id标识
	 *  linkId : 链接到的select的id标识, 并作为向后台传递的关联值的key
	 *  url : 查询数据信息的url
	 *  initValue : 默认选项
	 *  defaultOption : { 可选,默认初始选项的内容,无则没有默认初始选项
	 *  	value : 可选,默认初始选项的值,默认值为''
	 *  	text : 必填,默认初始选项的文本.
	 *  }
	 *  optionArr : [ 可选, 选项内容组
	 *  	[
	 *  		value : 初始选项值
	 *  		text : 初始选项文本
	 *  	],...
	 *  ]
	 *  option : { 可选,选项值配置
	 *  	valueKey : 可选,值的key,默认为id.
	 *  	textKey : 可选,文本的key,默认为name.
	 *  	others : 可选,其它信息,默认为''.
	 *  }
	 * }
	 * fn : 其它回调函数
	 * </pre>
	 */
	s.link = function(conf, fn) {
		jQuery('#' + conf.linkId).change(function() {
			if(this.value) {
				var data = {};
				data[conf.linkId] = this.value;
				a.json(conf.url, data, function(ret) {
					if (ret.length) {
						pushScriptModel(conf);
						extApi.tpl(ret, '#' + conf.id + '-select', '#'
								+ conf.id, function() {
							// 初始化选择
							if (conf.initValue) {
								jQuery('#' + conf.id).val(conf.initValue);
							}
							// 其它
							'function' === typeof fn && fn();
						});
					}
				});
			}
		});
		// 触发一次
		jQuery('#' + conf.linkId).change();
	}

	window.select = s;
})(window);
