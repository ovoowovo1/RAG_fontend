import React, { useState, useEffect } from 'react';
import { Modal, Input, message } from 'antd';
import { useDispatch } from 'react-redux';
import { renameDocument } from '../../redux/documentSlice';

const RenameModal = ({ visible, onCancel, docId, currentName }) => {
    const dispatch = useDispatch();
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && currentName) {
            const nameWithoutExt = currentName.replace(/\.pdf$/i, '');
            setNewName(nameWithoutExt);
        }
    }, [visible, currentName]);

    const handleRename = async () => {
        if (!newName.trim()) {
            message.warning('請輸入新的文件名稱');
            return;
        }

        if (newName.trim() === currentName.replace(/\.pdf$/i, '')) {
            message.info('名稱沒有變更');
            onCancel();
            return;
        }

        setLoading(true);
        try {
            await dispatch(renameDocument({ docId, newName: newName.trim() })).unwrap();
            message.success('文件已重新命名');
            setNewName('');
            onCancel();
        } catch (error) {
            message.error(error || '重新命名失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setNewName('');
        onCancel();
    };

    return (
        <Modal
            title="重新命名文件"
            open={visible}
            onOk={handleRename}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="確認"
            cancelText="取消"
            destroyOnClose
        >
            <div className="py-4">
                <Input
                    placeholder="請輸入新的文件名稱"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onPressEnter={handleRename}
                    autoFocus
                    maxLength={255}
                />
                <p className="text-xs text-gray-400 mt-2">
                    按 Enter 鍵快速確認
                </p>
            </div>
        </Modal>
    );
};

export default RenameModal;

