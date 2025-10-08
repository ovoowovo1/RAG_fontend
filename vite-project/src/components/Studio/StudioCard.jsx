import React, { useState, useEffect } from 'react'
import { Card, Typography, Button, message, Divider, List, Tag } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { MenuFoldOutlined, MenuUnfoldOutlined, DeleteOutlined } from '@ant-design/icons'

import AudioCard from './AudioCard'
import VideoCard from './VideoCard'
import MindMap from './MindMap'
import ReportCard from './ReportCard'
import FlashCard from './FlashCard'
import QuizCard from './QuizCard'
import QuizReader from './QuizReader'
import CollapsedIcon from './CollapsedIcon'

import { toggleStudioCardCollapse, setQuizReaderOpen } from '../../redux/studioSlice'
import { getAllQuizzes, deleteQuiz } from '../../api/quiz'


export default function StudioCard({ widthSize = null }) {
    const dispatch = useDispatch();
    const { Title } = Typography;
    const isStudioCardCollapsed = useSelector((state) => state.studio.isStudioCardCollapsed);

    const [listLoading, setListLoading] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    // 加載測驗列表
    const loadQuizzes = async () => {
        setListLoading(true);
        try {
            const response = await getAllQuizzes();
            setQuizzes(response.data.quizzes || []);
        } catch (error) {
            console.error('獲取測驗列表失敗:', error);
            message.error('獲取測驗列表失敗');
        } finally {
            setListLoading(false);
        }
    };


    useEffect(() => {
        loadQuizzes();
    }, []);



    const handleDeleteQuiz = async (quizId, e) => {
        e.stopPropagation();
        try {
            await deleteQuiz(quizId);
            message.success('測驗已刪除');
            loadQuizzes();
        } catch (error) {
            console.error('刪除測驗失敗:', error);
            message.error('刪除測驗失敗');
        }
    };

    const handleQuizClick = (quiz) => {
        setSelectedQuiz(quiz);
        dispatch(setQuizReaderOpen(true));
    };

    const handleCloseQuiz = () => {
        setSelectedQuiz(null);
        dispatch(setQuizReaderOpen(false));
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '未知時間';
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (

        <Card
            className={`h-full border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out`}
            style={{ width: widthSize || '100%' }}
            hoverable
            styles={{ body: { height: '100%', padding: isStudioCardCollapsed ? '1.5rem 0.75rem' : '1.5rem', display: 'flex', flexDirection: 'column' } }}
        >
            {
                isStudioCardCollapsed ? (
                    // 折疊狀態：只顯示展開按鈕
                    <>
                        <div className="flex flex-col items-center h-full">
                            <Button
                                onClick={() => dispatch(toggleStudioCardCollapse())}
                                shape='circle'
                                type="text"
                                icon={< MenuFoldOutlined />}
                                title="展開 Studio"
                            />

                            <CollapsedIcon />
                            <Divider />

                        </div>
                    </>
                ) : selectedQuiz ? (
                    // 顯示測驗閱讀器
                    <QuizReader
                        quizId={selectedQuiz.id}
                        quizName={selectedQuiz.name}
                        onClose={handleCloseQuiz}
                    />
                ) : (
                    <>
                        <div className="flex mb-4">
                            <Title level={4} className="m-0">Studio</Title>


                            <Button
                                className="ml-auto"
                                onClick={() => dispatch(toggleStudioCardCollapse())}
                                shape='circle'
                                type="text"
                                icon={<MenuUnfoldOutlined />}
                                title="折疊 Studio"
                            />
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <AudioCard />
                            <VideoCard />
                            <MindMap />
                            <ReportCard />
                            <FlashCard />
                            <QuizCard onQuizGenerated={loadQuizzes} />
                        </div>

                        <Divider />


                        <div className="flex-1 overflow-y-auto">
                            <List
                                dataSource={quizzes}
                                split={false}
                                loading={listLoading}
                                locale={{ emptyText: '尚無測驗記錄' }}
                                renderItem={(item) => (
                                    <List.Item
                                        className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg mb-2 transition-colors"
                                        onClick={() => handleQuizClick(item)}
                                    >
                                        <div className="w-full">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800 mb-1">
                                                        {item.name || '未命名測驗'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Tag color="green">{item.num_questions} 題</Tag>

                                                    </div>
                                                </div>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={(e) => handleDeleteQuiz(item.id, e)}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatDate(item.created_at)}
                                            </div>
                                            {item.documents && item.documents.length > 0 && (
                                                <div className="text-xs text-gray-600 mt-1 truncate">
                                                    來源: {item.documents.map(d => d.name).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>

                    </>
                )
            }
        </Card>

    )
}
