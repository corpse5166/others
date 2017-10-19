/**
 * www.xinghansoft.com 版权所有 © 大连星汉网络有限公司
 * 
 * @author Corpse-work
 * @Date 2016年12月15日 上午11:01:45
 */
package xhsoft.template.admin.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import xhsoft.template.core.helper.ConstHelper;
import xhsoft.template.core.helper.LoginHelper;
import xhsoft.template.core.service.ICoreService;
import xhsoft.utils.JsonUtils;
import xhsoft.utils.StringUtils;
import xhsoft.web.controller.BaseController;
import xhsoft.web.exp.BusinessExeption;
import xhsoft.web.log.SystemControllerLog;
import xhsoft.web.mv.ExtModelAndView;
import xhsoft.web.tools.FileUpload;
import xhsoft.web.tools.XHPageUtils;
import xhsoft.web.tools.logined.Logined;

/**
 * 索引controller
 * 
 * @author Corpse-work
 */
@Controller("admin_core")
@RequestMapping(value = "admin")
public class CoreController extends BaseController
{
	@Autowired
	private transient ICoreService coreService;

	/**
	 * 通用打开页面
	 * 
	 * @param request
	 * @param response
	 * @param url
	 *            页面路径
	 * @return
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined(others = {LoginHelper.USER_NAME})
	@RequestMapping(value = "{url}")
	public ModelAndView page(HttpServletRequest request, HttpServletResponse response,
			@PathVariable final String url)
	{
		return new ExtModelAndView(StringUtils.format("admin/{0}.html", url), request, response);
	}

	/**
	 * 通用获取详情
	 * 
	 * @param request
	 * @param response
	 * @param targetClass
	 *            目标类
	 * @param id
	 *            目标id
	 * @return
	 * @throws java.lang.ClassNotFoundException
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined
	@ResponseBody
	@RequestMapping("get-detail")
	public String getDetail(HttpServletRequest request, HttpServletResponse response,
			@RequestParam final String targetClass, @RequestParam final String id)
			throws java.lang.ClassNotFoundException
	{
		return JsonUtils.fromObject(
				coreService.getById(id, Class.forName(ConstHelper.BEAN_PACKAGE + targetClass)));
	}

	/**
	 * 通用分页查询
	 * 
	 * @param request
	 * @param response
	 * @param targetClass
	 *            目标类
	 * @param orderBy
	 *            排序(可选), ORDER BY .......
	 * @return
	 * @throws java.lang.ClassNotFoundException
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined
	@ResponseBody
	@RequestMapping(value = "page-data")
	public String pageData(HttpServletRequest request, HttpServletResponse response,
			@RequestParam final String targetClass,
			@RequestParam(required = false) final String orderBy)
			throws java.lang.ClassNotFoundException
	{
		return JsonUtils.fromObject(
				coreService.pageData(XHPageUtils.getPageInfo(request), targetClass, orderBy));
	}

	/**
	 * 通用打开编辑页面
	 * 
	 * @param request
	 * @param response
	 * @param page
	 *            页面名
	 * @param id
	 *            目标id(可选)
	 * @param targetClass
	 *            目标类(可选)
	 * @return
	 * @throws BusinessExeption
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined
	@RequestMapping(value = "edit-page")
	public ModelAndView editPage(HttpServletRequest request, HttpServletResponse response,
			@RequestParam final String page, @RequestParam(required = false) final String id,
			@RequestParam(required = false) final String targetClass) throws BusinessExeption
	{
		ModelAndView mv = new ExtModelAndView(StringUtils.format("admin/{0}.html", page), request,
				response);
		try
		{
			// 附加目标对象信息
			if (!StringUtils.isNullOrEmpty(id) && !StringUtils.isNullOrEmpty(targetClass))
			{
				Class targetCls = Class.forName(ConstHelper.BEAN_PACKAGE + targetClass);
				mv.addObject("info", this.coreService.getById(id, targetCls));
			}
			return mv;
		}
		catch (java.lang.ClassNotFoundException e)
		{
			throw new BusinessExeption(ClassNotFoundException, e);
		}
	}

	/**
	 * 通用添加或编辑信息
	 * 
	 * @param request
	 * @param response
	 * @param targetClass
	 *            目标类
	 * @param id
	 *            目标id
	 * @param unique
	 *            可选,唯一字段名(无空格逗号隔开)
	 * @param ignore
	 *            可选,忽略字段名(无空格逗号隔开), 在更新内容时这些字段将不会被更新, 与update互斥
	 * @param update
	 *            可选,更新字段名(无空格逗号隔开), 在更新内容时只更新这些字段, 与ignore互斥,优先级高于ignore
	 * @return
	 * @throws ReflectiveOperationException
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined
	@ResponseBody
	@SystemControllerLog
	@RequestMapping(value = "add-or-edit")
	public String addOrEdit(HttpServletRequest request, HttpServletResponse response,
			@RequestParam final String targetClass, @RequestParam(required = false) final String id,
			@RequestParam(required = false) final String unique,
			@RequestParam(required = false) final String ignore,
			@RequestParam(required = false) final String update) throws ReflectiveOperationException
	{
		// 创建新实例
		Class targetCls = Class.forName(ConstHelper.BEAN_PACKAGE + targetClass);
		Object target = populate(targetCls, request);

		// do..
		return coreService.editTarget(id, targetCls, target, unique, ignore, update)
				? SUCCESS
				: FAIL;
	}

	/**
	 * 通用删除目标对象
	 * 
	 * @param request
	 * @param response
	 * @param id
	 *            目标id
	 * @param targetClass
	 *            目标类
	 * @param subClasses
	 *            可选,相关子类(无空格逗号隔开), 指定子类与此项的id相关,存在则不可删除
	 * @param subFields
	 *            可选,此项的id于相关子类中的字段名
	 * @return
	 * @throws java.lang.ClassNotFoundException
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined
	@ResponseBody
	@SystemControllerLog
	@RequestMapping(value = "del-target")
	public String delTarget(HttpServletRequest request, HttpServletResponse response,
			@RequestParam final String id, @RequestParam final String targetClass,
			@RequestParam(required = false) final String subClasses,
			@RequestParam(required = false) final String subFields)
			throws java.lang.ClassNotFoundException
	{
		Class targetCls = Class.forName(ConstHelper.BEAN_PACKAGE + targetClass);

		return coreService.delTarget(targetCls, id, subClasses, subFields) ? SUCCESS : FAIL;
	}

	/**
	 * 通用获取全部
	 * 
	 * @param request
	 * @param response
	 * @param targetClass
	 *            目标类
	 * @param orderBy
	 *            可选,排序方式, ORDER BY .......
	 * @return
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined
	@ResponseBody
	@RequestMapping(value = "get-all")
	public String getAllList(HttpServletRequest request, HttpServletResponse response,
			@RequestParam final String targetClass,
			@RequestParam(required = false) final String orderBy)
	{
		return JsonUtils.fromCollection(coreService.getAllList(targetClass, orderBy));
	}

	/**
	 * 通用上传文件
	 * 
	 * @param request
	 * @param response
	 * @param inputName
	 *            文件表单域名
	 * @param path
	 *            可选,文件存储路径
	 * @param oldFilePath
	 *            可选,旧文件路径
	 * @return
	 * @throws xhsoft.common.FrameworkException
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined
	@ResponseBody
	@SystemControllerLog
	@RequestMapping(value = "upload-file")
	public String fileUpload(HttpServletRequest request, HttpServletResponse response,
			@RequestParam final String inputName, @RequestParam(required = false) final String path,
			@RequestParam(required = false) final String oldFilePath)
			throws xhsoft.common.FrameworkException
	{
		return FileUpload.uploadDelOld(request, inputName, FileUpload.toFolder(path), oldFilePath);
	}

	/**
	 * 通用删除文件
	 * 
	 * @param request
	 * @param response
	 * @param path
	 *            文件路径
	 * @throws xhsoft.common.FrameworkException
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined
	@SystemControllerLog
	@RequestMapping(value = "del-file")
	public void delFile(HttpServletRequest request, HttpServletResponse response,
			@RequestParam final String path) throws xhsoft.common.FrameworkException
	{
		FileUpload.delFile(request, path);
	}

	/**
	 * 图片压缩上传接口
	 * 
	 * @param request
	 * @param response
	 * @param inputName
	 *            图片表单域名
	 * @param path
	 *            可选,图片存储路径
	 * @param compress
	 *            可选,压缩参数
	 * @param oldFilePath
	 *            可选,旧图片路径
	 * @return
	 * @throws java.io.IOException
	 * @author Corpse-work
	 * @Date 2017年9月15日
	 */
	@Logined
	@ResponseBody
	@SystemControllerLog
	@RequestMapping(value = "img-compress")
	public String imgCompress(HttpServletRequest request, HttpServletResponse response,
			@RequestParam final String inputName, @RequestParam(required = false) final String path,
			@RequestParam(required = false) final String compress,
			@RequestParam(required = false) final String oldFilePath) throws java.io.IOException
	{
		return FileUpload.uoloadImg(request, inputName, FileUpload.toFolder(path), compress,
				oldFilePath);
	}
}
