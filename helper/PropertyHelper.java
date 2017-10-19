/**
 * www.xinghansoft.com 版权所有 © 大连星汉网络有限公司
 * 
 * @author JiangZhongYan
 * @Date 2015年12月28日 下午2:34:10
 */
package xhsoft.template.core.helper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 自定义配置文件，内容解析服务 在【<b>b2c-servlet.xml</b>】文件中配置 使用的时候，使用Autowired标签初始化，同其余Service类似
 * 
 * @author JiangZhongYan
 */
@Component
public class PropertyHelper
{
	/**
	 * 超级管理员登录账号
	 */
	@Value("${admin.account}")
	private String superAdminAccount;

	/**
	 * 超级管理员登录密码
	 */
	@Value("${admin.password}")
	private String superAdminPassword;

	/**
	 * @return 超级管理员登录账号
	 */
	public String getSuperAdminAccount()
	{
		return superAdminAccount;
	}

	/**
	 * @return 超级管理员登录密码
	 */
	public String getSuperAdminPassword()
	{
		return superAdminPassword;
	}
}
