import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import HeaderMailbox from './HeaderMailbox';
import Container from './Container';
import { EMAIL_DOMAIN } from '../config';

interface HeaderProps {
  mailbox: Mailbox | null;
  onMailboxChange?: (mailbox: Mailbox) => void;
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  mailbox = null, 
  onMailboxChange = () => {}, 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  
  return (
    <header className="border-b">
      <Container>
        <div className="flex flex-col py-3">
          <Link to="/" className="text-2xl font-bold">
            {t('app.title')}
          </Link>
          
          <p className="text-sm text-gray-500 mb-3">注册时保护真实邮箱，避免垃圾邮件和信息泄露</p>
          
          {mailbox && (
            <div className="flex items-center bg-muted/70 rounded-md px-3 py-1.5 w-full overflow-hidden">
              <div className="w-full overflow-hidden">
                <HeaderMailbox 
                  mailbox={mailbox} 
                  onMailboxChange={onMailboxChange}
                  domain={EMAIL_DOMAIN}
                  isLoading={isLoading}
                />
              </div>
              <div className="ml-3 pl-3 border-l border-muted-foreground/20 flex items-center flex-shrink-0">
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
};

export default Header; 
