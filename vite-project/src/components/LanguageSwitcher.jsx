import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LanguageSwitcher = () => {
  const { i18n: i18nInstance } = useTranslation();

  const handleLanguageChange = (value) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select
      value={i18nInstance.language}
      onChange={handleLanguageChange}
      style={{ width: 120 }}
      suffixIcon={<GlobalOutlined />}
      options={[
        { value: 'en', label: 'English' },
        { value: 'zh-TW', label: '繁體中文' }
      ]}
    />
  );
};

export default LanguageSwitcher;

