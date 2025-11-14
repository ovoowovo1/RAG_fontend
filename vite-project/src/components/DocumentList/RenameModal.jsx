import React, { useState, useEffect } from 'react';
import { Modal, Input, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { renameDocument } from '../../redux/documentSlice';

const RenameModal = ({ visible, onCancel, docId, currentName }) => {
    const { t } = useTranslation();
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
            message.warning(t('renameModal.enterNewName'));
            return;
        }

        if (newName.trim() === currentName.replace(/\.pdf$/i, '')) {
            message.info(t('renameModal.nameUnchanged'));
            onCancel();
            return;
        }

        setLoading(true);
        try {
            await dispatch(renameDocument({ docId, newName: newName.trim() })).unwrap();
            message.success(t('renameModal.renameSuccess'));
            setNewName('');
            onCancel();
        } catch (error) {
            message.error(error || t('renameModal.renameFailed'));
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
            title={t('renameModal.title')}
            open={visible}
            onOk={handleRename}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText={t('renameModal.confirm')}
            cancelText={t('renameModal.cancel')}
            destroyOnClose
        >
            <div className="py-4">
                <Input
                    placeholder={t('renameModal.placeholder')}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onPressEnter={handleRename}
                    autoFocus
                    maxLength={255}
                />
                <p className="text-xs text-gray-400 mt-2">
                    {t('renameModal.hint')}
                </p>
            </div>
        </Modal>
    );
};

export default RenameModal;

