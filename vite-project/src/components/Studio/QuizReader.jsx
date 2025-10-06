import React, { useState, useEffect } from 'react'
import { Button, Radio, Typography, Space, Progress, Card, message, Spin } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { getQuizById } from '../../api/quiz'

const { Title, Text, Paragraph } = Typography

export default function QuizReader({ quizId, quizName, onClose }) {
    const [loading, setLoading] = useState(true)
    const [questions, setQuestions] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [userAnswers, setUserAnswers] = useState([])
    const [isFinished, setIsFinished] = useState(false)

    // 加載測驗數據
    useEffect(() => {
        const loadQuiz = async () => {
            setLoading(true)
            try {
                const response = await getQuizById(quizId)
                setQuestions(response.data.quiz.questions || [])
                setUserAnswers(new Array(response.data.quiz.questions.length).fill(null))
            } catch (error) {
                console.error('加載測驗失敗:', error)
                message.error('加載測驗失敗')
            } finally {
                setLoading(false)
            }
        }
        loadQuiz()
    }, [quizId])

    const currentQuestion = questions[currentIndex]

    const handleAnswerSelect = (answerIndex) => {
        if (showResult) return // 已經顯示結果就不能再選擇
        setSelectedAnswer(answerIndex)
    }

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) {
            message.warning('請選擇一個答案')
            return
        }
        
        // 保存答案
        const newAnswers = [...userAnswers]
        newAnswers[currentIndex] = selectedAnswer
        setUserAnswers(newAnswers)
        
        // 顯示結果
        setShowResult(true)
    }

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            // 下一題
            setCurrentIndex(currentIndex + 1)
            setSelectedAnswer(userAnswers[currentIndex + 1])
            setShowResult(userAnswers[currentIndex + 1] !== null)
        } else {
            // 完成測驗
            setIsFinished(true)
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            setSelectedAnswer(userAnswers[currentIndex - 1])
            setShowResult(userAnswers[currentIndex - 1] !== null)
        }
    }

    const calculateScore = () => {
        let correct = 0
        questions.forEach((question, index) => {
            if (userAnswers[index] === question.answer_index) {
                correct++
            }
        })
        return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spin size="large" />
            </div>
        )
    }

    if (isFinished) {
        const score = calculateScore()
        return (
            <div className="flex flex-col h-full p-6">
                <div className="flex items-center mb-6">
                    <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />} 
                        onClick={onClose}
                    >
                        返回
                    </Button>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center mb-8">
                        <Title level={2}>測驗完成！</Title>
                        <Title level={1} className="text-green-600">
                            {score.correct}/{score.total}
                        </Title>
                        <Title level={3} className="text-gray-600">
                            {score.percentage}%
                        </Title>
                    </div>
                    
                    <Progress
                        type="circle"
                        percent={score.percentage}
                        size={200}
                        strokeColor={{
                            '0%': '#87d068',
                            '100%': '#52c41a'
                        }}
                    />
                    
                    <Space className="mt-8">
                        <Button size="large" onClick={onClose}>
                            返回列表
                        </Button>
                        <Button 
                            size="large" 
                            type="primary"
                            onClick={() => {
                                setCurrentIndex(0)
                                setUserAnswers(new Array(questions.length).fill(null))
                                setSelectedAnswer(null)
                                setShowResult(false)
                                setIsFinished(false)
                            }}
                        >
                            重新測驗
                        </Button>
                    </Space>
                </div>
            </div>
        )
    }

    const isCorrect = selectedAnswer === currentQuestion.answer_index

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />} 
                        onClick={onClose}
                    />
                    <Title level={5} className="m-0">{quizName || '測驗'}</Title>
                </div>
                <Text className="text-gray-500">
                    {currentIndex + 1} / {questions.length}
                </Text>
            </div>

            {/* Progress Bar */}
            <Progress 
                percent={Math.round(((currentIndex + 1) / questions.length) * 100)} 
                showInfo={false}
                strokeColor="#52c41a"
            />

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <Card className="mb-4">
                    <Title level={4}>{currentQuestion.question}</Title>
                </Card>

                <Space direction="vertical" className="w-full" size="middle">
                    {currentQuestion.choices.map((choice, index) => {
                        let className = "w-full text-left p-4 rounded-lg border-2 transition-all"
                        
                        if (showResult) {
                            if (index === currentQuestion.answer_index) {
                                className += " border-green-500 bg-green-50"
                            } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.answer_index) {
                                className += " border-red-500 bg-red-50"
                            } else {
                                className += " border-gray-200"
                            }
                        } else {
                            if (index === selectedAnswer) {
                                className += " border-blue-500 bg-blue-50"
                            } else {
                                className += " border-gray-300 hover:border-blue-300"
                            }
                        }

                        return (
                            <button
                                key={index}
                                className={className}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={showResult}
                            >
                                <div className="flex items-center justify-between">
                                    <Text>{choice}</Text>
                                    {showResult && index === currentQuestion.answer_index && (
                                        <CheckCircleOutlined className="text-green-600 text-xl" />
                                    )}
                                    {showResult && index === selectedAnswer && selectedAnswer !== currentQuestion.answer_index && (
                                        <CloseCircleOutlined className="text-red-600 text-xl" />
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </Space>

                {/* Rationale */}
                {showResult && (
                    <Card className="mt-4" style={{ backgroundColor: isCorrect ? '#f6ffed' : '#fff2e8' }}>
                        <Space direction="vertical" size="small">
                            <Text strong className={isCorrect ? 'text-green-600' : 'text-orange-600'}>
                                {isCorrect ? '✓ 答對了！' : '✗ 答錯了'}
                            </Text>
                            <Paragraph className="mb-0">
                                <Text strong>解釋：</Text> {currentQuestion.rationale}
                            </Paragraph>
                        </Space>
                    </Card>
                )}
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between items-center p-4 border-t">
                <Button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    icon={<ArrowLeftOutlined />}
                >
                    上一題
                </Button>

                {!showResult ? (
                    <Button 
                        type="primary"
                        onClick={handleSubmitAnswer}
                    >
                        提交答案
                    </Button>
                ) : (
                    <Button 
                        type="primary"
                        onClick={handleNext}
                        icon={currentIndex === questions.length - 1 ? undefined : <ArrowRightOutlined />}
                    >
                        {currentIndex === questions.length - 1 ? '完成測驗' : '下一題'}
                    </Button>
                )}
            </div>
        </div>
    )
}
