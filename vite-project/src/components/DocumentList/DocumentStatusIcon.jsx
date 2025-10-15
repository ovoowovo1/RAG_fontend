import React from 'react';
import { Button, Dropdown } from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

const DocumentStatusIcon = ({
    status,
    docId,
    isCollapsed = false,
    isHovered,
    dropdownOpen,
    onMouseEnter,
    onMouseLeave,
    onDropdownOpenChange,
    onDelete,
    onRename,
}) => {
    const menuItems = [
        {
            key: '1',
            label: '刪除',
            icon: <DeleteOutlined />,
            onClick: () => onDelete(docId),
        },
        {
            key: '2',
            label: '重新命名',
            icon: <EditOutlined />,
            onClick: () => onRename(docId),
        }
    ];

    switch (status) {
        case 'processed':
            return <CheckCircleOutlined className={`text-green-500 ${isCollapsed ? 'ml-0' : 'ml-2'}`} />;
        case 'processing':
            return <ClockCircleOutlined className={`text-blue-500 ${isCollapsed ? 'ml-0' : 'ml-2'}`} />;
        case 'failed':
            return <ExclamationCircleOutlined className={`text-red-500 ${isCollapsed ? 'ml-0' : 'ml-2'}`} />;
        default:
            return (
                <div
                    className={`rounded ${isCollapsed ? 'ml-0' : 'ml-2'}`}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {isHovered && !isCollapsed ? (
                        <Dropdown
                            menu={{ items: menuItems }}
                            placement="bottomLeft"
                            trigger={['click']}
                            open={dropdownOpen === docId}
                            onOpenChange={onDropdownOpenChange}
                        >
                            <Button shape="circle" type="text" icon={<MoreOutlined className="text-zinc-500" />} />
                        </Dropdown>
                    ) : (
                        <Button shape="circle" type="text" icon={<FileTextOutlined className="text-zinc-500" />} />
                    )}
                </div>
            );
    }
};

export default DocumentStatusIcon;

