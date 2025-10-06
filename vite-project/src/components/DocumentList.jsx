import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, List, Typography, Button, Input, message, Dropdown } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, ShrinkOutlined, PlusOutlined, DeleteOutlined, MoreOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import {
    fetchDocuments,
    deleteDocument,
    setSearchTerm,
    setSelectedShowDocumentContentID,
    toggleFileSelection,
    toggleSelectAll,
    toggleDocumentListCollapse,
} from '../redux/documentSlice';

import DocumentContentViewer from './DocumentContentViewer';
import UploadModal from './UploadModal';
import AddSourceModal from './AddSourceModal';
import LinkUploadModal from './LinkUploadModal';

const { Title, Text } = Typography;
const { Search } = Input;

export default function DocumentList({ widthSize, isMediumScreen }) {
    const dispatch = useDispatch();
    const {
        items: documents,
        loading,
        error,
        selectedFileIds,
        selectedShowDocumentContentID,
        searchTerm,
        isDocumentListCollapsed,
    } = useSelector((state) => state.documents);

    const [hoveredDocId, setHoveredDocId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [addSourceModalVisible, setAddSourceModalVisible] = useState(false);
    const [linkModalVisible, setLinkModalVisible] = useState(false);

    useEffect(() => {
        dispatch(fetchDocuments());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const handleDeleteClick = (docId) => {
        dispatch(deleteDocument(docId)).then(() => {
            message.success('文件已刪除');
        });
    };

    const handleFileSelect = (fileId, isSelected) => {
        dispatch(toggleFileSelection(fileId));
    };

    const handleSelectAll = () => {
        const allFileIds = filteredDocuments.map(doc => doc.id);
        dispatch(toggleSelectAll(allFileIds));
    };

    const filteredDocuments = useMemo(() =>
        documents.filter(doc =>
            doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
        ), [documents, searchTerm]);

    const isFileSelected = (docId) => selectedFileIds.includes(docId);

    const selectedAll = useMemo(() =>
        filteredDocuments.length > 0 && selectedFileIds.length === filteredDocuments.length,
        [selectedFileIds, filteredDocuments]
    );

    const items = (docId) => [
        {
            key: '1',
            label: '刪除',
            icon: <DeleteOutlined />,
            onClick: () => handleDeleteClick(docId),
        },
    ];

    const getStatusIcon = (status, docId, isCollapsed = false) => {
        const isHovered = hoveredDocId === docId || dropdownOpen === docId;
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
                        onMouseEnter={() => setHoveredDocId(docId)}
                        onMouseLeave={() => {
                            if (dropdownOpen !== docId) {
                                setHoveredDocId(null);
                            }
                        }}
                    >
                        {isHovered && !isCollapsed ? (
                            <Dropdown
                                menu={{ items: items(docId) }}
                                placement="bottomLeft"
                                trigger={['click']}
                                open={dropdownOpen === docId}
                                onOpenChange={(open) => {
                                    setDropdownOpen(open ? docId : null);
                                    setHoveredDocId(open ? docId : null);
                                }}
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

    return (
        <>
            <Card
                className={`h-full  border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out`}
                style={{ width: widthSize || '100%' }}
                hoverable
                styles={{ body: { height: '100%', padding: isDocumentListCollapsed ? '1.5rem 0.75rem' : '1.5rem', display: 'flex', flexDirection: 'column' } }}
            >
                {isDocumentListCollapsed && !isMediumScreen ? (
                    // 折疊狀態：示展開按鈕
                    <>
                        <div className="flex flex-col items-center h-full">
                            <Button
                                onClick={() => dispatch(toggleDocumentListCollapse())}
                                shape='circle'
                                type="text"
                                icon={<MenuUnfoldOutlined />}
                                title="展開文件列表"
                            />

                            <Button
                                className='ml-auto mt-4'
                                type="primary"
                                icon={<PlusOutlined />}
                                shape='circle'
                                onClick={() => setAddSourceModalVisible(true)}
                            >
                            </Button>


                            <List
                                split={false}
                                loading={loading}
                                dataSource={filteredDocuments}
                                renderItem={(doc) => (
                                    <List.Item
                                        className={`cursor-pointer  ${selectedFileIds.includes(doc.id) ? 'bg-blue-50' : ''}`}
                                    >
                                        <div 
                                            className="items-center w-full" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                dispatch(setSelectedShowDocumentContentID(doc.id));
                                                dispatch(toggleDocumentListCollapse());
                                            }}
                                        >
                                            {getStatusIcon(doc.status, doc.id, true)}
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </>


                ) : (
                    <>
                        <div className="flex mb-4">
                            <Title level={4} className="m-0">Sources</Title>


                            <Button
                                className={`ml-auto ${selectedShowDocumentContentID ? 'hidden' : ''} ${isMediumScreen ? 'hidden' : ''}`}
                                onClick={() => dispatch(toggleDocumentListCollapse())}
                                shape='circle'
                                type="text"
                                icon={<MenuFoldOutlined />}
                                title="折疊文件列表"
                            />


                            <Button
                                className={`ml-auto ${selectedShowDocumentContentID ? '' : 'hidden'}`}
                                onClick={() => dispatch(setSelectedShowDocumentContentID(null))}
                                shape='circle'
                                type="text"
                                icon={<ShrinkOutlined />}
                            />
                        </div>
                        <DocumentContentViewer selectedShowDocumentContentID={selectedShowDocumentContentID} />
                        {!selectedShowDocumentContentID && (
                            <>
                                <Search
                                    placeholder="搜尋文件..."
                                    value={searchTerm}
                                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                                    className="mb-4"
                                    allowClear
                                />
                                <div className="flex items-center text-zinc-300 cursor-pointer py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedAll}
                                        onChange={handleSelectAll}
                                        className="mr-2"
                                    />
                                    <Text className="text-zinc-300">Select all sources</Text>
                                    <Button
                                        className='ml-auto'
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setAddSourceModalVisible(true)}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <div className="border-t border-gray-100 flex-1 overflow-y-auto min-h-0">
                                    <List
                                        split={false}
                                        loading={loading}
                                        dataSource={filteredDocuments}
                                        renderItem={(doc) => (
                                            <List.Item
                                                className={`cursor-pointer hover:bg-gray-50 ${selectedFileIds.includes(doc.id) ? 'bg-blue-50' : ''}`}
                                            >
                                                <div className="flex items-center w-full">
                                                    <div className="flex items-center">{getStatusIcon(doc.status, doc.id)}</div>
                                                    <div className="flex-1 mx-3 flex items-center min-w-0" onClick={(e) => { e.stopPropagation(); dispatch(setSelectedShowDocumentContentID(doc.id)); }}>
                                                        <Text className="text-sm truncate" title={doc.filename}>{doc.filename}</Text>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={isFileSelected(doc.id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleFileSelect(doc.id, e.target.checked);
                                                        }}
                                                        className="mr-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                                <div className="p-4 border-t border-gray-100">
                                    <Text className="text-zinc-400 text-xs">
                                        {filteredDocuments.length} sources
                                        {selectedFileIds.length > 0 && (
                                            <span className="ml-2 text-blue-500">({selectedFileIds.length} selected)</span>
                                        )}
                                    </Text>
                                </div>
                            </>
                        )}
                    </>
                )}

            </Card>




            <UploadModal
                visible={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                onSuccess={() => dispatch(fetchDocuments())}
            />
            <AddSourceModal
                visible={addSourceModalVisible}
                onCancel={() => setAddSourceModalVisible(false)}
                onSelect={(type) => {
                    setAddSourceModalVisible(false);
                    if (type === 'pdf') {
                        setUploadModalVisible(true);
                    } else if (type === 'link') {
                        setLinkModalVisible(true);
                    }
                }}
            />
            <LinkUploadModal
                visible={linkModalVisible}
                onCancel={() => setLinkModalVisible(false)}
                onSuccess={() => dispatch(fetchDocuments())}
            />
        </>
    );
}
