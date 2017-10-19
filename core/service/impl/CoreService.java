/**
 * www.xinghansoft.com 版权所有 © 大连星汉网络有限公司
 * 
 * @author Corpse-work
 * @Date 2016年12月16日 下午5:44:46
 */
package xhsoft.template.core.service.impl;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.stereotype.Service;

import xhsoft.template.core.service.ICoreService;
import xhsoft.utils.EnvUtils;
import xhsoft.utils.JsonUtils;
import xhsoft.utils.ReflectUtils;
import xhsoft.utils.StringUtils;
import xhsoft.web.model.request.BaseQueryRequest;
import xhsoft.web.model.response.ResponsePage;
import xhsoft.web.tools.XHPageUtils;

/**
 * 通用Service
 * 
 * @author Corpse-work
 */
@Service
public class CoreService implements ICoreService
{
	@Autowired
	private transient HibernateTemplate hibernateTemplate;

	/**
	 * 日志记录
	 */
	private transient Logger logger = Logger.getLogger(CoreService.class);

	/*
	 * (non-Javadoc)
	 * @see xhsoft.oa.base.service.ICommonService#editTarget(java.lang.Class, java.lang.Object,
	 * java.lang.String)
	 * @author Corpse-work
	 * @Date 2016年12月16日
	 */
	@Override
	public boolean editTarget(String id, Class targetClass, Object target, String unique,
			String ignore, String update) throws ReflectiveOperationException
	{
		if (StringUtils.isNullOrEmpty(id))
		{
			// create new
			if (isUsable(targetClass, target, null, unique))
			{
				logger.info(StringUtils.format("类{0}存储新对象{1}.", targetClass,
						JsonUtils.fromObject(target)));

				hibernateTemplate.save(target);
				return true;
			}
		}
		else
		{
			// edit old
			Object oldObj = hibernateTemplate.get(targetClass, id);
			logger.info(StringUtils.format("类 {0} 中原对象 {1}.", targetClass,
					JsonUtils.fromObject(oldObj)));
			if (isUsable(targetClass, target, oldObj, unique))
			{
				if (StringUtils.isNullOrEmpty(update))
				{ // update为空,按忽略进行
					String[] ignores = new String[]{};
					// 添加忽略
					if (!StringUtils.isNullOrEmpty(ignore))
					{
						ignores = ignore.split(",");
					}
					// 复制信息
					BeanUtils.copyProperties(target, oldObj, ignores);
				}
				else
				{ // update有值,按反射进行
					ReflectUtils.copyProperties(target, oldObj, update.split(","));
				}
				logger.info("更新信息为: " + JsonUtils.fromObject(oldObj));
				hibernateTemplate.update(oldObj);
				return true;
			}
		}
		return false;
	}
	/**
	 * 判断目标内容是否可用
	 * 
	 * @param targetClass
	 *            目标类
	 * @param target
	 *            目标对象
	 * @param oldObj
	 *            旧对象
	 * @param unique
	 *            唯一字段，多个时以“,"分隔
	 * @return
	 * @author Corpse-work
	 * @throws SecurityException
	 * @throws NoSuchMethodException
	 * @throws InvocationTargetException
	 * @throws IllegalArgumentException
	 * @throws IllegalAccessException
	 * @Date 2016年12月16日
	 */
	private boolean isUsable(Class targetClass, Object target, Object oldObj, String unique)
			throws ReflectiveOperationException
	{
		boolean flag = true;
		if (StringUtils.isNullOrEmpty(unique))
		{
			// 不存在唯一字段,可用
			return flag;
		}
		else
		{
			String[] uniqueArr = unique.split(",");
			for (int i = 0; i < uniqueArr.length; i++)
			{
				// 获取唯一字段对应值
				String targetValue = org.apache.commons.beanutils.BeanUtils.getProperty(target,
						uniqueArr[i]);
				if (oldObj != null)
				{
					// 存在旧对象,编辑,对比唯一字段值有无变化
					String oldValue = org.apache.commons.beanutils.BeanUtils.getProperty(oldObj,
							uniqueArr[i]);
					if (oldValue.equals(targetValue))
					{
						// 无变化,可用
						continue;
					}
				}
				// 检查唯一字段值是否存在
				if (isExits(targetClass, uniqueArr[i], targetValue))
				{
					flag = false;
					break;
				}
			}
			return flag;
		}
	}

	/**
	 * 验重
	 * 
	 * @param targetClass
	 *            目标类
	 * @param unique
	 *            唯一字段
	 * @param targetValue
	 *            目标值
	 * @return
	 * @author Corpse-work
	 * @Date 2016年12月16日
	 */
	private boolean isExits(Class targetClass, String unique, String targetValue)
	{
		String hql = StringUtils.format("FROM {0} WHERE {1} = BINARY(''{2}'')",
				targetClass.getName(), unique, targetValue);
		List<Object> list = hibernateTemplate.find(hql);
		return EnvUtils.isNotEmpty(list);
	}

	/*
	 * (non-Javadoc)
	 * @see xhsoft.oa.base.service.ICommonService#delTarget(java.lang.Class, java.lang.String,
	 * java.lang.String)
	 * @author Corpse-work
	 * @Date 2016年12月19日
	 */
	@Override
	public boolean delTarget(Class targetClass, String targetId, String subClasses,
			String subFields)
	{
		boolean isNotCorrelation = false;
		if (StringUtils.isNullOrEmpty(subClasses))
		{
			// 没有需检查的子表, 无关联项
			isNotCorrelation = true;
		}
		else
		{
			// 检查子表
			String[] subClassArr = subClasses.split(",");
			String[] subFieldArr = subFields.split(",");
			for (int i = 0; i < subClassArr.length; i++)
			{
				String hql = StringUtils.format("FROM {0} WHERE {1} = ''{2}''", subClassArr[i],
						subFieldArr[i], targetId);
				List<Object> list = hibernateTemplate.find(hql);
				if (EnvUtils.isNotEmpty(list))
				{
					isNotCorrelation = false;
					break;
				}
			}
		}
		// 无关联项,则删除
		if (isNotCorrelation)
		{
			logger.info("删除记录: " + targetClass + " - " + targetId);
			hibernateTemplate.delete(hibernateTemplate.get(targetClass, targetId));
			return true;
		}
		return false;
	}

	/*
	 * (non-Javadoc)
	 * @see xhsoft.oa.base.service.ICommonService#getAllList(java.lang.String, java.lang.String)
	 * @author Corpse-work
	 * @Date 2016年12月19日
	 */
	@Override
	public List<?> getAllList(String targetClassName, String orderBy)
	{
		StringBuilder hql = new StringBuilder("FROM ");
		hql.append(targetClassName);
		if (StringUtils.isNullOrEmpty(orderBy))
		{
			hql.append(" ORDER BY opTime DESC");
		}
		else
		{
			hql.append(" ORDER BY ");
			hql.append(orderBy);
		}

		return hibernateTemplate.find(hql.toString());
	}

	@Override
	public Object getById(String id, Class targetClass)
	{
		return hibernateTemplate.get(targetClass, id);
	}
	/*
	 * (non-Javadoc)
	 * @see xhsoft.template.core.service.ICoreService#editTarget(java.lang.String, java.lang.Class,
	 * java.lang.Object, java.lang.String)
	 * @author Corpse-work
	 * @Date 2017年4月10日
	 */
	@Override
	public boolean editTarget(String id, Class targetClass, Object target, String unique)
			throws ReflectiveOperationException
	{
		return editTarget(id, targetClass, target, unique, null, null);
	}
	/*
	 * (non-Javadoc)
	 * @see xhsoft.template.core.service.ICoreService#editTarget(java.lang.Class, java.lang.Object,
	 * java.lang.String)
	 * @author Corpse-work
	 * @Date 2017年4月10日
	 */
	@Override
	public boolean editTarget(Class targetClass, Object target, String unique)
			throws ReflectiveOperationException
	{
		return editTarget(null, targetClass, target, unique, null, null);
	}
	/*
	 * (non-Javadoc)
	 * @see xhsoft.template.core.service.ICoreService#editTarget(java.lang.Class, java.lang.Object)
	 * @author Corpse-work
	 * @Date 2017年4月10日
	 */
	@Override
	public boolean editTarget(Class targetClass, Object target) throws ReflectiveOperationException
	{
		return editTarget(null, targetClass, target, null, null, null);
	}
	/*
	 * (non-Javadoc)
	 * @see
	 * xhsoft.template.core.service.ICoreService#pageData(xhsoft.web.model.request.BaseQueryRequest,
	 * java.lang.String, java.lang.String)
	 * @author Corpse-work
	 * @Date 2017年5月24日
	 */
	@Override
	public ResponsePage pageData(BaseQueryRequest condition, String targetClassName, String orderBy)
	{
		StringBuilder hql = new StringBuilder("FROM ");
		hql.append(targetClassName);
		if (StringUtils.isNullOrEmpty(orderBy))
		{
			hql.append(" ORDER BY opTime DESC");
		}
		else
		{
			hql.append(" ORDER BY ");
			hql.append(orderBy);
		}
		return XHPageUtils.dealPageInfo(hibernateTemplate, condition, hql.toString());
	}

}
