/**
 * www.xinghansoft.com
 * 版权所有 © 大连星汉网络有限公司
 * 
 * @author Corpse-work
 * @Date 2016年10月21日 上午11:43:11
 */
package xhsoft.web.tools.logined;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 
 * @author Corpse-work
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Logined
{
	/**
	 * 其它附加信息
	 * @return
	 * @author Corpse-work 
	 * @Date 2016年10月21日
	 */
	String[] others() default {};
}
