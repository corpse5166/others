/**
 * www.xinghansoft.com
 * 版权所有 © 大连星汉网络有限公司
 * 
 * @author Corpse-work
 * @Date 2016年10月21日 下午12:19:53
 */
package xhsoft.web.tools.logined;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;

import net.sf.json.JSONObject;
import xhsoft.web.utils.SessionUtils;

/**
 * 用于登录校验
 * 
 * @author Corpse-work
 */
@Aspect
@Component
public class LoginedAspect
{
	@Autowired
	private AbsLoginHelper loginHelper;

	@Around(value = "@annotation(logined)")
	public Object checkLogin(ProceedingJoinPoint join, Logined logined) throws Throwable
	{
		Object[] args = join.getArgs();
		// 验证登录身份
		HttpServletRequest request = (HttpServletRequest) args[0];
		if (loginHelper.isLogined(request))
		{
			// 若已登录,执行方法并返回信息
			Object ret = join.proceed();
			// 判断是否存在追加信息
			if (ret != null && logined.others().length > 0)
			{
				// 判断返回值类型
				if (ret instanceof ModelAndView)
				{
					ModelAndView mv = (ModelAndView) ret;
					for (String other : logined.others())
					{
						mv.addObject(loginHelper.othersKey(other),
								SessionUtils.getSession(request, other));
					}
					return mv;
				}
				else
				{
					// 新json包
					JSONObject res = new JSONObject();
					// 将原返回信息置于content中
					res.put("content", ret);
					// 将附加信息置于extra中
					JSONObject extra = new JSONObject();
					// 遍历,从Session中获取附加信息
					for (String other : logined.others())
					{
						extra.put(loginHelper.othersKey(other),
								SessionUtils.getSession(request, other));
					}
					res.put("extra", extra);
					return res.toString();
				}
			}
			// 空值,或无追加信息则直接返回
			return ret;
		}
		else
		{
			// 未登录,跳转登录页面
			directLoginPage(request, (HttpServletResponse) args[1]);
		}
		return null;
	}

	/**
	 * 跳转到登录页面
	 * 
	 * @param request
	 * @param response
	 * @throws IOException
	 * @author JiangZhongYan
	 * @Date 2015年7月3日
	 */
	private void directLoginPage(HttpServletRequest request, HttpServletResponse response)
			throws IOException
	{
		PrintWriter outWriter = response.getWriter();
		StringBuilder builder = new StringBuilder();
		builder.append("<script type=\"text/javascript\">");
		builder.append("top.location.href='");
		builder.append(loginHelper.getLoginUrl(request));
		builder.append("';");
		builder.append("</script>");

		outWriter.print(builder.toString());
	}
}
