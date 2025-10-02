import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { LinkOutlined, FilePdfOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AddSourceModal = ({ visible, onCancel, onSelect }) => {
  return (
    <Modal
      title="新增來源"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnClose
    >
      <div className="flex flex-col gap-4">
        <Text className="text-zinc-500">請選擇要新增的來源種類</Text>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="default"
            size="large"
            icon={<FilePdfOutlined />}
            onClick={() => onSelect && onSelect('pdf')}
          >
            上傳 PDF
          </Button>
          <Button
            type="default"
            size="large"
            icon={<LinkOutlined />}
            onClick={() => onSelect && onSelect('link')}
          >
            新增連結
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddSourceModal;


