import React, { useState } from 'react';
import { Modal, Button, Input, message, Progress } from 'antd';
import { useTranslation } from 'react-i18next';
import { uploadLink } from '../api/upload.js';
import useUploadProgress from '../hooks/useUploadProgress.jsx';

const LinkUploadModal = ({ visible, onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const [link, setLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const { progress, showProgress, startTracking, stopTracking, abortTracking, genClientId } = useUploadProgress();

  const handleOk = async () => {
    const url = (link || '').trim();
    if (!url) {
      message.warning(t('linkUploadModal.enterLink'));
      return;
    }
    try {
      setUploading(true);
      const cid = startTracking(genClientId());
      await uploadLink(url, cid);
      message.success(t('linkUploadModal.submitSuccess'));
      onSuccess && onSuccess();
      onCancel();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || t('linkUploadModal.submitFailed');
      message.error(errorMessage);
    } finally {
      setUploading(false);
      stopTracking(1500);
    }
  };

  const handleCancel = () => {
    setLink('');
    abortTracking();
    onCancel();
  };

  return (
    <Modal
      title={t('linkUploadModal.title')}
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={uploading ? t('linkUploadModal.submitting') : t('linkUploadModal.submit')}
      okButtonProps={{ disabled: !link.trim(), loading: uploading }}
      destroyOnClose
    >
      <Input
        placeholder={t('linkUploadModal.placeholder')}
        value={link}
        onChange={(e) => setLink(e.target.value)}
        onPressEnter={handleOk}
      />
      {(uploading || showProgress) && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} status={uploading ? 'active' : (progress === 100 ? 'success' : undefined)} />
        </div>
      )}
    </Modal>
  );
};

export default LinkUploadModal;


