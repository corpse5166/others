(function(window) {
	var u = {};
	var callbacks = {};
	
	/**
	 * 添加上传域
	 * 
	 * @param path
	 *            文件上传路径
	 * @param oldFilePath
	 *            旧文件路径
	 * @returns
	 */
	function pushUploadForm(conf) {
		var html = '<form id="form-' + conf.id + '" method="post" enctype="multipart/form-data"  target="frameFile" style="display: none;">';
		html += '<input type="file" accept="' + (conf.accept || '*') + '" id="' + conf.id + '" name="' + conf.id + '" class="input-file" onchange="upload.file(\'' + conf.id + '\');">'
		html += '<input type="hidden" value="' + conf.id + '" id="inputName" name="inputName">';
		html += '<input type="hidden" value="' + (conf.path || '') + '" id="path" name="path">';
		html += '<input type="hidden" value="' + (conf.oldFilePath || '') + '" id="oldFilePath" name="oldFilePath">';
		html += '<input type="hidden" value="' + (conf.compress || '') + '" id="compress" name="compress">';
		html += '</form>';

		jQuery('body').append(html);
	}

	/**
	 * 初始化文件上传
	 * 
	 * @data 流程: 向页面尾部添加一个隐藏的文件上传表单域,并在其中包含上传所需内容,将上传成功回调方法存入回调方法集,
	 *       并且为页面上指定按钮绑定点击上传事件.
	 * @data 注意: 表单域id默认为 'fileUpload', 上传事件触发按钮的id规则为 'btn-' + 表单域id.
	 * @data conf参数属性:
	 * @param id
	 *            	表单域id, 可选, 默认为 'fileUpload'. 当仅有一处文件上传时,默认即可,指定id用于应对多个.
	 * @param path
	 *            	上传文件存储路径, 可选(建议), 默认为'', 默认服务器端文件会存储于'upload/'根路径下.
	 * @param accept
	 *            	上传文件类型, 可选(建议), 默认为'*', 默认会接收所有文件.
	 *            	注:因现图片使用压缩存储,请上传图片时务必指定此项为accept.否则将原图存储.
	 * @param oldFilePath
	 *            	旧文件路径, 可选(建议), 默认为'', 默认会使服务器端产生文件冗余
	 * @param compress
	 * 			   	压缩方式(可选,按需求指定): 默认除gif图片外,均会进行等尺寸压缩,等尺寸压缩存储时无后缀
	 * 				因此, gif图片需指定accept为gif.否则将会被压缩为静态jpeg.
	 * 				00% 按比例压缩
	 * 				000h 等比定高压缩
	 * 				000w 等比定宽压缩
	 * 				00x00 指定宽高压缩(宽x高)
	 * 				注:逗号(',')隔开,会自动生成不同后缀的指定文件,后缀与所指定的相同.
	 * @param callback
	 *            上传文件成功后回调函数(旧文件路径自动写入,无需再次写入)
	 * @other 常用文件类型与accept值对应关系
	 * 
	 * <pre>
	 * 图像	image/*
	 * .gif 		image/gif
	 * .jpeg 	image/jpeg
	 * .png 		image/png
	 * 音频	audio/*
	 * .mp3 	audio/mpeg
	 * 视频	video/*
	 * .mp4 	video/mp4
	 * .txt 	text/plain
	 * .pdf 	application/pdf
	 * .doc 		application/msword
	 * .xls 	application/vnd.ms-excel
	 * .ppt 	application/vnd.ms-powerpoint
	 * </pre>
	 */
	u.init = function(conf, callback) {
		conf = conf || {};
		conf.id = conf.id || 'fileUpload';
		// 添加上传域
		pushUploadForm(conf);
		// 将回调写入回调方法集中
		callbacks[conf.id] = callback;
		// 为上传按钮绑定事件
		jQuery('#btn-' + conf.id).click(function() {
			jQuery('#' + conf.id).click();
		});
	}

	/**
	 * 上传文件到服务器
	 * 
	 * @param targetId
	 *            目标上传域id
	 */
	u.file = function(targetId) {
		var url = 'upload-file.action';
		// 若接收的为gif以外的图片形式,将进行压缩存储.
		var file = jQuery('#' + targetId)[0].files[0];
		if(file.type.indexOf('image') != -1 && file.type.indexOf('gif') == -1) {
			url = 'img-compress.action';
		}
		jQuery('#form-' + targetId).ajaxSubmit({
			url : url,
			type : 'post',
			beforeSubmit : function() {
				layer.load();
			},
			success : function(data) {
				layer.closeAll('loading');
				jQuery('#form-' + targetId + ' #oldFilePath').val(data);
				jQuery('#' + targetId).val('');
				// 回调
				callbacks[targetId](data);
			}
		});
	}
	
	/**
	 * 移除文件上传
	 */
	u.del = function(id) {
		var form = jQuery('#form-' + id);
		var path = form.find('#oldFilePath').val();
		jQuery.post('del-file.action', {path : path}, function() {
			form.remove();
		});
	}
	
	window.upload = u;
})(window);
