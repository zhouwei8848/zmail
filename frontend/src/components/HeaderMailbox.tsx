import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createRandomMailbox, createCustomMailbox } from '../utils/api';

interface HeaderMailboxProps {
  mailbox: Mailbox | null;
  onMailboxChange: (mailbox: Mailbox) => void;
  domain: string;
  isLoading: boolean;
}

const HeaderMailbox: React.FC<HeaderMailboxProps> = ({ 
  mailbox, 
  onMailboxChange,
  domain,
  isLoading
}) => {
  const { t } = useTranslation();
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [customAddressError, setCustomAddressError] = useState<string | null>(null);
  const [customAddressSuccess, setCustomAddressSuccess] = useState<string | null>(null);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  const copyTooltipTimeoutRef = useRef<number | null>(null);
  const refreshSuccessTimeoutRef = useRef<number | null>(null);
  const successMessageTimeoutRef = useRef<number | null>(null);
  const errorMessageTimeoutRef = useRef<number | null>(null);
  
  // 清除提示的定时器
  useEffect(() => {
    return () => {
      if (copyTooltipTimeoutRef.current) {
        window.clearTimeout(copyTooltipTimeoutRef.current);
      }
      if (refreshSuccessTimeoutRef.current) {
        window.clearTimeout(refreshSuccessTimeoutRef.current);
      }
      if (successMessageTimeoutRef.current) {
        window.clearTimeout(successMessageTimeoutRef.current);
      }
      if (errorMessageTimeoutRef.current) {
        window.clearTimeout(errorMessageTimeoutRef.current);
      }
    };
  }, []);
  
  if (!mailbox || isLoading) return null;
  
  // 复制邮箱地址到剪贴板
  const copyToClipboard = () => {
    // 清除之前的错误信息
    setCopyError(null);
    
    const fullAddress = mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${domain}`;
    navigator.clipboard.writeText(fullAddress)
      .then(() => {
        // 显示复制成功提示
        setShowCopyTooltip(true);
        
        // 2秒后隐藏提示
        if (copyTooltipTimeoutRef.current) {
          window.clearTimeout(copyTooltipTimeoutRef.current);
        }
        copyTooltipTimeoutRef.current = window.setTimeout(() => {
          setShowCopyTooltip(false);
        }, 2000);
      })
      .catch(() => {
        // 显示复制失败错误
        setCopyError(t('mailbox.copyFailed'));
        
        // 3秒后隐藏错误
        if (errorMessageTimeoutRef.current) {
          window.clearTimeout(errorMessageTimeoutRef.current);
        }
        errorMessageTimeoutRef.current = window.setTimeout(() => {
          setCopyError(null);
        }, 3000);
      });
  };
  
  // 更换随机邮箱
  const handleRefreshMailbox = async () => {
    // 清除之前的错误信息
    setRefreshError(null);
    
    setIsActionLoading(true);
    const result = await createRandomMailbox();
    setIsActionLoading(false);
    
    if (result.success && result.mailbox) {
      onMailboxChange(result.mailbox);
      
      // 显示更新成功提示
      setShowRefreshSuccess(true);
      
      // 3秒后隐藏提示
      if (refreshSuccessTimeoutRef.current) {
        window.clearTimeout(refreshSuccessTimeoutRef.current);
      }
      refreshSuccessTimeoutRef.current = window.setTimeout(() => {
        setShowRefreshSuccess(false);
      }, 3000);
    } else {
      // 显示刷新失败错误
      setRefreshError(t('mailbox.refreshFailed'));
      
      // 3秒后隐藏错误
      if (errorMessageTimeoutRef.current) {
        window.clearTimeout(errorMessageTimeoutRef.current);
      }
      errorMessageTimeoutRef.current = window.setTimeout(() => {
        setRefreshError(null);
      }, 3000);
    }
  };
  
  // 创建自定义邮箱
  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误和成功信息
    setCustomAddressError(null);
    setCustomAddressSuccess(null);
    
    if (!customAddress.trim()) {
      setCustomAddressError(t('mailbox.invalidAddress'));
      return;
    }
    
    setIsActionLoading(true);
    const result = await createCustomMailbox(customAddress);
    setIsActionLoading(false);
    
    if (result.success && result.mailbox) {
      onMailboxChange(result.mailbox);
      
      // 显示成功消息在表单下方
      setCustomAddressSuccess(t('mailbox.createSuccess'));
      
      // 3秒后自动关闭表单
      if (successMessageTimeoutRef.current) {
        window.clearTimeout(successMessageTimeoutRef.current);
      }
      successMessageTimeoutRef.current = window.setTimeout(() => {
        setIsCustomMode(false);
        setCustomAddress('');
        setCustomAddressSuccess(null);
      }, 3000);
    } else {
      // 检查错误信息是否包含"邮箱地址已存在"
      const isAddressExistsError = 
        result.error === 'Address already exists' || 
        String(result.error).includes('已存在');
      
      if (isAddressExistsError) {
        setCustomAddressError(t('mailbox.addressExists'));
      } else {
        setCustomAddressError(t('mailbox.createFailed'));
      }
    }
  };
  
  // 取消自定义模式
  const handleCancelCustom = () => {
    setIsCustomMode(false);
    setCustomAddress('');
    setCustomAddressError(null);
    setCustomAddressSuccess(null);
  };
  
  // 按钮基础样式
  const buttonBaseClass = "flex items-center justify-center rounded-md transition-all duration-200";
  const copyButtonClass = `${buttonBaseClass} hover:bg-primary/20 hover:text-primary hover:scale-110 mx-1`;
  const refreshButtonClass = `${buttonBaseClass} bg-muted hover:bg-primary/20 hover:text-primary hover:scale-110 mr-1`;
  const customizeButtonClass = `${buttonBaseClass} bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-110`;
  
  return (
    <div className="flex flex-col items-center w-full">
      {isCustomMode ? (
        <form onSubmit={handleCreateCustom} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => {
                  setCustomAddress(e.target.value);
                  if (customAddressError) setCustomAddressError(null);
                  if (customAddressSuccess) setCustomAddressSuccess(null);
                }}
                className={`w-32 md:w-40 px-2 py-1 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  customAddressError ? 'border-red-500' : ''
                }`}
                placeholder={t('mailbox.customAddressPlaceholder')}
                disabled={isActionLoading}
                autoFocus
              />
              <span className="px-2 py-1 text-sm border-y border-r rounded-r-md bg-muted">
                @{domain}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelCustom}
              className="px-2 py-1 text-sm rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              disabled={isActionLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
              disabled={isActionLoading}
            >
              {isActionLoading ? t('common.loading') : t('common.create')}
            </button>
          </div>
          
          {/* 错误信息显示 */}
          {customAddressError && (
            <div className="text-red-500 text-xs px-1">
              {customAddressError}
            </div>
          )}
          
          {/* 成功信息显示 */}
          {customAddressSuccess && (
            <div className="text-green-500 text-xs px-1">
              {customAddressSuccess}
            </div>
          )}
        </form>
      ) : (
        <>
          {/* 桌面版显示 */}
          <div className="hidden md:flex flex-col items-center w-full">
            {/* 邮箱地址显示 */}
            <div className="flex items-center w-full mb-3">
              <code className="px-3 py-1.5 text-base font-medium overflow-x-auto max-w-full whitespace-nowrap">
                {mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${domain}`}
              </code>
            </div>
            
            {/* 操作按钮 - 排成一行 */}
            <div className="flex items-center justify-center space-x-2 w-full">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition duration-200"
                disabled={isActionLoading}
              >
                {t('mailbox.copyAddress') || '复制邮箱'}
              </button>
              
              <button
                onClick={handleRefreshMailbox}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition duration-200"
                disabled={isActionLoading}
              >
                {t('mailbox.changeAddress') || '换个邮箱'}
              </button>
              
              <button
                onClick={() => setIsCustomMode(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition duration-200"
                disabled={isActionLoading}
              >
                {t('mailbox.customAddress') || '自定义邮箱'}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition duration-200"
              >
                {t('email.refresh') || '刷新邮件'}
              </button>
            </div>
            
            {/* 错误信息显示 */}
            {(copyError || refreshError) && (
              <div className="text-red-500 text-xs mt-2">
                {copyError || refreshError}
              </div>
            )}
            
            {/* 复制成功提示 */}
            {showCopyTooltip && (
              <div className="text-green-500 text-xs mt-2">
                {t('mailbox.copySuccess')}
              </div>
            )}
            
            {/* 更新成功提示 */}
            {showRefreshSuccess && (
              <div className="text-green-500 text-xs mt-2">
                {t('mailbox.refreshSuccess')}
              </div>
            )}
          </div>
          
          {/* 移动版显示 */}
          <div className="flex md:hidden flex-col items-center w-full">
            {/* 邮箱地址显示 */}
            <div className="flex items-center w-full mb-3">
              <code className="px-3 py-1.5 text-sm font-medium overflow-x-auto max-w-full whitespace-nowrap">
                {mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${domain}`}
              </code>
            </div>
            
            {/* 操作按钮 - 两行排列 */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/80 transition duration-200"
                disabled={isActionLoading}
              >
                {t('mailbox.copyAddress') || '复制邮箱'}
              </button>
              
              <button
                onClick={handleRefreshMailbox}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/80 transition duration-200"
                disabled={isActionLoading}
              >
                {t('mailbox.changeAddress') || '换个邮箱'}
              </button>
              
              <button
                onClick={() => setIsCustomMode(true)}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/80 transition duration-200"
                disabled={isActionLoading}
              >
                {t('mailbox.customAddress') || '自定义邮箱'}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/80 transition duration-200"
              >
                {t('email.refresh') || '刷新邮件'}
              </button>
            </div>
            
            {/* 错误信息显示 */}
            {(copyError || refreshError) && (
              <div className="text-red-500 text-xs mt-2">
                {copyError || refreshError}
              </div>
            )}
            
            {/* 复制成功提示 */}
            {showCopyTooltip && (
              <div className="text-green-500 text-xs mt-2">
                {t('mailbox.copySuccess')}
              </div>
            )}
            
            {/* 更新成功提示 */}
            {showRefreshSuccess && (
              <div className="text-green-500 text-xs mt-2">
                {t('mailbox.refreshSuccess')}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderMailbox; 
