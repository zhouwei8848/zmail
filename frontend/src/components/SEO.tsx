import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'DJSMAIL-24小时匿名邮箱',
  description = '创建临时邮箱地址，接收邮件，无需注册，保护您的隐私安全',
  keywords = '临时邮箱,匿名邮箱,一次性邮箱,隐私保护,电子邮件,DJSMAIL',
}) => {
  const location = useLocation();
  const fullTitle = `${title} | 创建临时邮箱地址，接收邮件，无需注册，保护您的隐私安全`;

  useEffect(() => {
    // 更新页面标题
    document.title = fullTitle;
    
    // 更新元标签
    const metaTags = {
      'description': description,
      'keywords': keywords,
    };
    
    // 更新常规元标签
    Object.entries(metaTags).forEach(([name, content]) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (element) {
        element.setAttribute('content', content);
      }
    });
  }, [fullTitle, description, keywords]);

  return null; // 这个组件不渲染任何内容
};

export default SEO; 
