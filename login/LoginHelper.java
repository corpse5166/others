/**
 * www.xinghansoft.com
 * 版权所有 © 大连星汉网络有限公司
 * 
 * @author Corpse-work
 * @Date 2017年1月6日 下午2:02:47
 */
package xhsoft.template.core.helper;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

import xhsoft.web.tools.logined.AbsLoginHelper;

/**
 * 登录校验模块用于每个项目自定义配置的子类
 * 通过扩展,实现和重写父类方法来对每个项目进行登录校验功能的自定
 * 
 * @author Corpse-work
 */
@Component
public class LoginHelper extends AbsLoginHelper
{
	/*
	 * (non-Javadoc)
	 * @see xhsoft.web.tools.logined.AbsLoginHelper#isLogined(javax.servlet.http.HttpServletRequest)
	 * @author Corpse-work
	 * @Date 2017年3月1日
	 */
	@Override
	protected boolean isLogined(HttpServletRequest request)
	{
		// TODO 在系统未做登录校验时,默认将登录检测设置为直接通过
		// 当登录校验部分完成后,请删除此重写方法已进行正常的登陆校验
		// 或在此方法内,完成适配当前项目的登陆校验逻辑
		return true;
	}
}
