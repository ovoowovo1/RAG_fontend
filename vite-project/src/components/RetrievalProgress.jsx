import React from 'react';
import { Progress, Card, Row, Col, Typography, Tag, Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import { SearchOutlined, DatabaseOutlined, FileTextOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const RetrievalProgress = ({ progressMessages = [] }) => {
    const { t } = useTranslation();
    const isCompleted = progressMessages.some(msg => msg.message?.includes(t('retrievalProgress.queryCompleted')));

    const parseProgress = (messages) => {
        // ############ STEP 1: 在任務物件中增加 count 屬性 ############
        const tasks = {
           // graph: { name: t('retrievalProgress.graphRetrieval'), status: 'waiting', icon: <DatabaseOutlined />, color: '#1890ff', count: null },
            vector: { name: t('retrievalProgress.vectorRetrieval'), status: 'waiting', icon: <SearchOutlined />, color: '#52c41a', count: null },
            fulltext: { name: t('retrievalProgress.fulltextRetrieval'), status: 'waiting', icon: <FileTextOutlined />, color: '#faad14', count: null }
        };

        messages.forEach(msg => {
            // 建立一個類型與任務名稱的對應
            const typeToTask = {
                'graph': 'graph',
                'vector': 'vector',
                'fulltext': 'fulltext',
                'fulltextProgress': 'fulltext',
                'vectorProgress': 'vector',
                'graphProgress': 'graph',
                'aiProgress': 'ai',
            };

            const taskName = typeToTask[msg.type];

            // 若找不到對應任務（例如 aiProgress 對應到不存在的 ai），則略過
            if (taskName && tasks[taskName]) {
                if (msg.type.endsWith('Progress')) {
                    // 處理進度事件
                    if (tasks[taskName].status === 'waiting') {
                        tasks[taskName].status = 'running';
                    }
                } else {
                    // 處理完成事件
                    tasks[taskName].status = 'completed';
                    tasks[taskName].count = msg.data;
                }
            }
        });


        return tasks;
    };

    const tasks = parseProgress(progressMessages);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'running': return <LoadingOutlined style={{ color: '#1890ff' }} />;
            default: return null;
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'running': return <Tag color="processing">{t('retrievalProgress.running')}</Tag>;
            case 'waiting': return <Tag color="default">{t('retrievalProgress.waiting')}</Tag>;
            default: return null; // 'completed' 狀態將由結果數量標籤替代
        }
    };

    const taskCount = Object.keys(tasks).length; // 實際存在的任務數量
    const completedCount = Object.values(tasks).filter(task => task.status === 'completed').length;
    const runningCount = Object.values(tasks).filter(task => task.status === 'running').length;
    const progressPerTask = 100 / taskCount; // 每個任務的進度百分比
    const totalProgress = completedCount * progressPerTask + runningCount * (progressPerTask / 2);
    const finalProgress = isCompleted ? 100 : totalProgress;

    const lastNonResultMessage = [...progressMessages].reverse().find(msg => msg.type !== 'result');
    const lastProgressMessage = lastNonResultMessage?.message;

    return (
        <Card
            size="small"
            className="mb-2 w-full"
            style={{
                backgroundColor: isCompleted ? '#f6ffed' : '#fff',
                border: isCompleted ? '1px solid #b7eb8f' : '1px solid #d9d9d9'
            }}
        >
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <Text strong style={{ fontSize: '12px' }}>
                            {isCompleted ? t('retrievalProgress.completed') : t('retrievalProgress.inProgress')}
                        </Text>
                        <Text style={{ fontSize: '11px', color: '#666' }}>
                            {Math.round(finalProgress)}%
                        </Text>
                    </div>
                    <Progress
                        percent={finalProgress}
                        size="small"
                        strokeColor={isCompleted ? '#52c41a' : '#1890ff'}
                        showInfo={false}
                    />
                </div>

                <Flex gap="small" wrap>
                    {Object.entries(tasks).map(([key, task]) => (
                        <Flex
                            key={key}
                            vertical
                            align="center"
                            flex="1"
                            style={{ minWidth: '80px' }}
                        >
                            <Flex align="center" gap={4} style={{ fontSize: '16px', marginBottom: '4px' }}>
                                <span style={{ color: task.color }}>{task.icon}</span>
                                {getStatusIcon(task.status)}
                            </Flex>
                            <Text style={{ fontSize: '11px', textAlign: 'center' }}>{task.name}</Text>

                          
                            {task.status === 'completed' && typeof task.count === 'number' ? (
                                <Tag>
                                    {task.count} {t('retrievalProgress.results')}
                                </Tag>
                            ) : (
                                getStatusTag(task.status)
                            )}
                        </Flex>

                    ))}
                </Flex>

                {!isCompleted && lastProgressMessage && (
                    <div className="border-t pt-2 mt-2">
                        <Text ellipsis={'expandable'} style={{ fontSize: '11px', color: '#888' }} className='truncate'>
                            {t('retrievalProgress.latestProgress')}: {lastProgressMessage}
                        </Text>
                    </div>
                )}
            </div>
        </Card >
    );
};

export default RetrievalProgress;