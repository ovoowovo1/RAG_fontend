import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import enUS from 'antd/locale/en_US';
import i18n from './i18n';

// 導入組件
import DocumentsPage from './pages/DocumentsPage';

// 主應用程式組件
export default function App() {
  const [antdLocale, setAntdLocale] = useState(i18n.language === 'zh-TW' ? zhTW : enUS);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setAntdLocale(lng === 'zh-TW' ? zhTW : enUS);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <ConfigProvider locale={antdLocale}>
      <Router>
        <div className='h-screen flex flex-col'>
          <Routes>
            <Route path="/" element={<DocumentsPage />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}
