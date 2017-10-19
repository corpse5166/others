/**
 * www.xinghansoft.com
 * 版权所有 © 大连星汉网络有限公司
 * 
 * @author Corpse-work
 * @Date 2016年11月3日 下午4:08:50
 */
package xhsoft.web.tools.logined;

import javax.servlet.http.HttpServletRequest;

import xhsoft.utils.StringUtils;
import xhsoft.web.utils.SessionUtils;

/**
 * 登录相关方法抽象
 * 
 * @author Corpse-work
 */
public abstract class AbsLoginHelper
{
	/**
	 * Session存储用户名键
	 */
	public static final String USER_NAME = "sessionName";

	/**
	 * Session存储用户id键
	 */
	public static final String USER_ID = "sessionId";

	/**
	 * 已登录
	 */
	protected static final String IS_LOGINED = "isLogined";

	/**
	 * 登录
	 * 
	 * @author Corpse-work
	 * @Date 2016年11月3日
	 */
	public static void logined(HttpServletRequest request)
	{
		SessionUtils.setSession(request, IS_LOGINED, IS_LOGINED);
	}

	/**
	 * 验证是否登录
	 * 
	 * @return
	 * @author Corpse-work
	 * @Date 2016年11月3日
	 */
	protected boolean isLogined(HttpServletRequest request)
	{
		return !StringUtils.isNullOrEmpty(SessionUtils.getSession(request, IS_LOGINED));
	}

	/**
	 * 字段映射,因Session的Key不可与ModelAndView中Object的Key相同,故将其转换
	 * 可重写以供扩展
	 * 
	 * @param other
	 * @return
	 * @author Corpse-work
	 * @Date 2016年11月3日
	 */
	public String othersKey(String other)
	{
		switch (other)
		{
			case USER_ID :
				return "userId";
			case USER_NAME :
				return "userName";
			default :
				return null;
		}
	}

	/**
	 * 获取登录页面地址
	 * 可重写以供扩展
	 * 
	 * @param request
	 * @return
	 * @author Corpse-work
	 * @Date 2016年11月3日
	 */
	public String getLoginUrl(HttpServletRequest request)
	{
		String rootUrl = getRootUrl(request);
		return rootUrl + "/login.action";
	}

	/**
	 * 获取根路径
	 * 
	 * @param request
	 * @return
	 * @author Corpse-work
	 * @Date 2017年3月1日
	 */
	protected String getRootUrl(HttpServletRequest request)
	{
		String url = request.getRequestURL().toString();
		return url.substring(0, url.lastIndexOf("/"));
	}
}
