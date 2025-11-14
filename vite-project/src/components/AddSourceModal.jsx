import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { LinkOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const AddSourceModal = ({ visible, onCancel, onSelect }) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('addSourceModal.title')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnClose
    >
      <div className="flex flex-col gap-4">
        <Text className="text-zinc-500">{t('addSourceModal.selectType')}</Text>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="default"
            size="large"
            icon={<FilePdfOutlined />}
            onClick={() => onSelect && onSelect('pdf')}
          >
            {t('addSourceModal.uploadPdf')}
          </Button>
          <Button
            type="default"
            size="large"
            icon={<LinkOutlined />}
            onClick={() => onSelect && onSelect('link')}
          >
            {t('addSourceModal.addLink')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddSourceModal;


