/**
 * 数据内容校验js工具
 * =====================================================================
 * 传入参数介绍:
 * @param data : object - (必须)待校验数据对象
 * ***************************************************************************
 * @param condition : object - (必须)校验条件对象
 * key与数据对象的key对应
 * -----------------------------------------------------------------------------------
 * 基本参数:
 * @param type : string - (可选)校验目标的类型,默认为str,即String类型.
 * ※※ type请引用本js已定义的常量, 不要传字符串形式的值. ※※
 * @param nullable : boolean - (可选)校验目标是否可空,默认为不可空.
 * -----------------------------------------------------------------------------------
 * string 类型额外参数 : 
 * @param minLength : int - (可选)字符串最小长度
 * @param maxLength : int - (可选)字符串最大长度
 * -----------------------------------------------------------------------------------
 * number 类型额外参数:
 * @param isInt : boolean - (可选)true 则校验整数
 * @param min : number - (可选)最小值, num大于等于此值
 * @param max : number - (可选)最大值, num小于等于此值
 * @param floor : number - (可选)下限, num大于此值
 * @param top : number - (可选)上限, num小于此值
 * ***************************************************************************
 * @param tips : object - (可选)自定义提示信息
 * 该对象的key与data的key相同,每个key对应一个提示信息对象.
 * 提示信息对象的key参见默认提示信息
 * 需指定tips样式时,额外传入direction(显示方向), color(框体颜色)两个参数.
 * ***************************************************************************
 * 例:
 * validity.check({
 * 		name : 'xxxx',
 * 		phone : '13000000000',
 * 		age : '13'
 * }, {
 * 		name : {
 * 			minLength : 3
 * 		},
 * 		phone : {
 * 			type : validity.phone
 * 		},
 *		age : {
 *			type : validity.num,
 *			min : 0
 *		}
 * }, {
 * 		name : {
 * 			isNull : '请填写姓名哦~'
 * 		}
 * });
 * =====================================================================
 * corpse 2017.6.2
 */
(function(window) {
	var v = {};

	/**
	 * 校验类型
	 */
	// 手机
	v.phone = 'phone';
	// 数字
	v.num = 'number';
	// 时间
	v.time = 'time';
	// 字符串
	v.str = 'string';
	
	/**
	 * 默认提示信息
	 */
	var dText = {
		phone : '请填写符合格式的手机号或座机电话号码。',
		time : '请填写符合“00:00”格式的时间。',
		isNull : '请填写该项，不可留空。',
		isNaN : '请填写一个数字。',
		isInt : '请填写一个整数。',
		min : '请填写一个大于等于##的数字。',
		max : '请填写一个小于等于##的数字。',
		floor : '请填写一个大于##的数字。',
		top : '请填写一个小于##的数字。',
		minLength : '请填写至少##个字。',
		maxLength : '请填写至多##个字。'
	}
	// 默认tips样式
	var defaDir = 3;
	var defaCol = '#293C55';
	
	/**
	 * 自定义提示信息
	 */
	var cText = {};
	/**
	 * 执行检查
	 * 参数说明见文件头
	 * @return true : 检查通过
	 */
	v.check = function(data, condition, tips) {
		var isOK = true;
		// 填充自定义提示信息
		if (tips) {
			cText = tips;
		}
		// 循环校验
		for (var key in condition) {
			// 校验条件
			var c = condition[key];
			// 校验目标
			var t = data[key];
			if (t) {
				switch (c.type) {
				case v.phone:
					isOK = v.isPhone(t);
					isOK || echoTips(key, v.phone);
					break;
				case v.num:
					var ret = isNum(t, c);
					isOK = ret.validity;
					isOK || echoTips(key, ret.type, c[ret.type]);
					break;
				case v.time:
					isOK = v.isTime(t);
					isOK || echoTips(key, v.time);
					break;
				case v.str:
				default:
					var ret = isStr(t, c);
					isOK = ret.validity;
					isOK || echoTips(key, ret.type, c[ret.type]);
				break;
				}
			} else if (!c.nullable) {
				isOK = false;
				isOK || echoTips(key, 'isNull');
			}
			if(!isOK) {
				break;
			}
		}
		return isOK;
	}
	
	/**
	 * 验证手机号是否符合格式
	 */
	v.isPhone = function(phone) {
		return /^\d*$/.test(phone) || /^\d*[-\d]*$/.test(phone);
	}
	/**
	 * 验证时间是否符合格式
	 */
	v.isTime = function(time) {
		return /([0-1][0-9]|[2][0-3]):[0-5][0-9]/g.test(time);
	}
	
	/**
	 * 数字校验,符合条件返回true,反之返回false.
	 * 
	 * @data 方法condition参数:
	 * @param isInt :
	 *            boolean - true 则校验整数
	 * @param min :
	 *            number - 最小值, num大于等于此值
	 * @param max :
	 *            number - 最大值, num小于等于此值
	 * @param floor :
	 *            number - 下限, num大于此值
	 * @param top :
	 *            number - 上限, num小于此值
	 */
	v.isNum = function(num, condition) {
		return isNum(num, condition).validity;
	}
	
	/**
	 * 字符串校验,符合条件返回true,反之返回false.
	 * 
	 * @data 方法condition参数:
	 * @param minLength :
	 *            number - 字符串最小长度
	 * @param maxLenght :
	 *            number - 字符串最大长度
	 */
	v.isStr = function(str, condition) {
		return isStr(str, condition).validity;
	}
	
	/**
	 * 设置tips默认样式
	 */
	v.setTipsDefa = function(direction, color)
	{
		if (direction) {
			defaDir = direction;
		}
		if (color) {
			defaCol = color;
		}
	}
	
	/**
	 * 显示tips
	 * 
	 * @param target
	 *            目标
	 * @param type
	 *            类型
	 * @param value
	 *            值
	 * @returns
	 */
	function echoTips(target, type, value) {
		var custom = cText[target] || {};
		var content = custom[type] || dText[type];
		// 置换提示信息中的数值内容
		if (!custom[type] && value != undefined) {
			content = content.replace('##', value);
		}
		// 弹出提示
		tips(content, '#' + target, custom.direction, custom.color);
	}

	/**
	 * 弹出tips
	 * 
	 * @param content
	 *            内容
	 * @param target
	 *            目标位置
	 * @param direction
	 *            方向
	 * @param color
	 *            颜色
	 * @returns
	 */
	function tips(content, target, direction, color) {
		location.hash = target;
		layer.tips(content, target, {
			time : 2000,
			tips : [ direction || defaDir, color || defaCol ],
			tipsMore : true
		});
	}

	/**
	 * 数值校验,返回结果的同时并附加是哪一项不符合
	 * 
	 * @param num
	 *            数值
	 * @param condition
	 *            条件
	 * @returns
	 */
	function isNum(num, condition) {
		var ret = {
			validity : false
		};
		// 非数字直接返回false
		if (isNaN(num)) {
			ret.type = 'isNaN';
			return ret;
		}
		// 根据条件校验
		if (condition) {
			// 校验整数
			if (condition.isInt && num % 1 != 0) {
				ret.type = 'isInt';
				return ret;
			}
			// 校验区间(闭)
			if (condition.min != undefined && num < condition.min) {
				ret.type = 'min';
				return ret;
			}
			if (condition.max != undefined && num > condition.max) {
				ret.type = 'max';
				return ret;
			}
			// 校验区间(开)
			if (condition.floor != undefined && num <= condition.floor) {
				ret.type = 'floor';
				return ret;
			}
			if (condition.top != undefined && num >= condition.top) {
				ret.type = 'top';
				return ret;
			}
		}
		ret.validity = true;
		return ret;
	}

	/**
	 * 校验字符串
	 * 
	 * @param str
	 *            目标字符串
	 * @param condition
	 *            校验条件
	 * @returns
	 */
	function isStr(str, condition) {
		var ret = {
			validity : false,
		};
		if (condition) {
			// 校验最小长度
			if (condition.minLength != undefined
					&& str.length < condition.minLength) {
				ret.type = 'minLength';
				return ret;
			}
			// 校验最大长度
			if (condition.maxLength != undefined
					&& str.length > condition.maxLength) {
				ret.type = "maxLength";
				return ret;
			}
		}
		ret.validity = true;
		return ret;
	}

	window.validity = v;
})(window)