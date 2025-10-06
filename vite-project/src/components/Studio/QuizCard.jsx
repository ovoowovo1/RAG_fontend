import React, { useState } from 'react'
import { generateQuiz } from '../../api/quiz'
import { message } from 'antd'
import { useSelector } from 'react-redux'
import { Card, Typography } from 'antd'




export default function QuizCard({ onQuizGenerated }) {
    const { Title } = Typography;
    const { selectedFileIds } = useSelector((state) => state.documents);
    const [loading, setLoading] = useState(false);

    const handleGenerateQuiz = async () => {
        // 檢查是否有選中的文件
        if (!selectedFileIds || selectedFileIds.length === 0) {
            message.warning('請先選擇至少一個文件來生成測驗');
            return;
        }

        setLoading(true);
        try {
            const response = await generateQuiz(selectedFileIds, {
                difficulty: 'medium',
                numQuestions: 10
            });

            message.success(`成功生成 ${response.data.questions.length} 題測驗題目！`);
            console.log('生成的測驗:', response.data);

            // 通知父組件刷新列表
            if (onQuizGenerated) {
                onQuizGenerated();
            }

        } catch (error) {
            console.error('生成測驗失敗:', error);
            message.error(error.response?.data?.detail || '生成測驗失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };


    return (
        <Card
            className="bg-green-100 hover:bg-green-200 cursor-pointer"
            styles={{ body: { padding: '0.5rem', backgroundColor: 'transparent' } }}
            onClick={handleGenerateQuiz}
            loading={loading}
        >
            <div className="flex justify-between">
                <span className="material-icons-outlined text-lime-600">quiz</span>
                <span className="material-icons-outlined text-lime-600">edit</span>

            </div>
            <Title level={5} style={{ color: '#65a30d', marginTop: '1rem' }}>
                Quiz
            </Title>
        </Card>
    )
}
