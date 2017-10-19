/**
 * www.xinghansoft.com 版权所有 © 大连星汉网络有限公司
 * 
 * @author Corpse-work
 * @Date 2016年12月16日 下午5:32:24
 */
package xhsoft.template.core.service;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import xhsoft.web.model.request.BaseQueryRequest;
import xhsoft.web.model.response.ResponsePage;

/**
 * @author Corpse-work
 */
public interface ICoreService
{
	/**
	 * 通用编辑目标对象
	 * 
	 * @param targetClass
	 *            目标类
	 * @param target
	 *            目标对象
	 * @param unique
	 *            唯一字段(存在则自动验重)多个时以“,"分隔
	 * @param ignore
	 *            忽略字段(编辑时不修改)
	 * @return
	 * @author Corpse-work
	 * @throws SecurityException
	 * @throws NoSuchMethodException
	 * @throws InvocationTargetException
	 * @throws IllegalArgumentException
	 * @throws IllegalAccessException
	 * @Date 2016年12月16日
	 */
	boolean editTarget(String id, Class targetClass, Object target, String unique, String ignore, String update)
			throws ReflectiveOperationException;
	boolean editTarget(String id, Class targetClass, Object target, String unique)
			throws ReflectiveOperationException;
	boolean editTarget(Class targetClass, Object target, String unique)
			throws ReflectiveOperationException;
	boolean editTarget(Class targetClass, Object target) throws ReflectiveOperationException;

	/**
	 * 通用删除目标对象
	 * 
	 * @param targetClass
	 *            目标类
	 * @param targetId
	 *            目标id
	 * @param subClasses
	 *            子表(存在则检查子表是否存在此项,存在则不删除)
	 * @param subFields
	 *            子表对应字段名
	 * @return
	 * @author Corpse-work
	 * @Date 2016年12月19日
	 */
	boolean delTarget(Class targetClass, String targetId, String subClasses, String subFields);

	/**
	 * 通用获取全部
	 * 
	 * @param targetClassName
	 *            目标类名
	 * @param orderBy
	 *            排序规则
	 * @return
	 * @author Corpse-work
	 * @Date 2016年12月19日
	 */
	List<?> getAllList(String targetClassName, String orderBy);
	/**
	 * 根据ID查询对象
	 * 
	 * @param id
	 *            记录ID
	 * @param targetClass
	 *            对象类型
	 * @return
	 * @author TongYinLing 2017年1月10日
	 */
	Object getById(String id, Class targetClass);
	/**
	 * 仅分页查询
	 * 
	 * @param pageInfo
	 * @param targetClassName
	 * @param parameter
	 * @return
	 * @author Corpse-work
	 * @Date 2017年5月24日
	 */
	ResponsePage pageData(BaseQueryRequest condition, String targetClassName, String orderBy);
}
