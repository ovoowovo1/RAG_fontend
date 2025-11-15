import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useSelector } from 'react-redux';
import { Card, Button, Spin, message, Switch, Tooltip, Space, Typography } from 'antd';
import { UserOutlined, ReloadOutlined, CopyOutlined, ClearOutlined ,FileImageOutlined   } from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import { useTranslation } from 'react-i18next';
import MarkdownIt from 'markdown-it';


import { handleProChatRequest, handleProChatRequestWithProgress, generateWelcomeMessage } from '../utils/proChatHelpers.jsx';
import Citation from '../components/Citation.jsx';
import TTSButton from '../components/TTSButton.jsx';
import RetrievalProgress from '../components/RetrievalProgress.jsx';
import extractMessageText from '../utils/extractMessageText';




const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

const renderMessageContent = (content) => {
    // 處理包含圖像的對象
    if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
        // 優先處理結構化內容（answer_with_citations）
        if (content.answer_with_citations && Array.isArray(content.answer_with_citations)) {
            const hasImage = content.hasImage && content.imageData;
            return (
                <div className="prose max-w-none markdown-content leading-relaxed text-sm">
                    <div className="prose max-w-none markdown-content leading-relaxed text-sm">
                        {content.answer_with_citations.map((part, index) => {
                            if (part.type === 'text') {
                                let renderedHtml = md.render(part.value);
                                if (renderedHtml.startsWith('<p>') && renderedHtml.endsWith('</p>\n') && (renderedHtml.match(/<p>/g) || []).length === 1) {
                                    renderedHtml = renderedHtml.slice(3, renderedHtml.length - 5);
                                }
                                return <span key={index} dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
                            }
                            if (part.type === 'citation') {
                                return <Citation key={index} part={part} index={index} />;
                            }
                            return null;
                        })}
                    </div>
                    {hasImage && (
                        <div className="mt-4">
                            <img 
                                src={content.imageData} 
                                alt="Generated image" 
                                className="max-w-full rounded-lg shadow-md"
                                style={{ maxHeight: '500px', objectFit: 'contain' }}
                            />
                        </div>
                    )}
                </div>
            );
        }
        // 處理包含圖像但沒有結構化內容的情況
        if (content.hasImage && content.imageData) {
            return (
                <div className="prose max-w-none markdown-content leading-relaxed text-sm">
                    {content.answer && (
                        <div dangerouslySetInnerHTML={{ __html: md.render(content.answer) }} />
                    )}
                    <div className="mt-4">
                        <img 
                            src={content.imageData} 
                            alt="Generated image" 
                            className="max-w-full rounded-lg shadow-md"
                            style={{ maxHeight: '500px', objectFit: 'contain' }}
                        />
                    </div>
                </div>
            );
        }
        // 如果沒有圖像，嘗試渲染 answer 字段
        if (content.answer) {
            const renderedContent = md.render(content.answer);
            return <div dangerouslySetInnerHTML={{ __html: renderedContent }} className="prose max-w-none markdown-content leading-relaxed text-sm" />;
        }
    }
    if (typeof content === 'string') {
        const renderedContent = md.render(content);
        return <div dangerouslySetInnerHTML={{ __html: renderedContent }} className="prose max-w-none markdown-content leading-relaxed text-sm" />;
    }
    if (Array.isArray(content)) {
        return (
            <div className="prose max-w-none markdown-content leading-relaxed text-sm">
                {content.map((part, index) => {
                    if (part.type === 'text') {
                        let renderedHtml = md.render(part.value);
                        if (renderedHtml.startsWith('<p>') && renderedHtml.endsWith('</p>\n') && (renderedHtml.match(/<p>/g) || []).length === 1) {
                            renderedHtml = renderedHtml.slice(3, renderedHtml.length - 5);
                        }
                        return <span key={index} dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
                    }
                    if (part.type === 'citation') {
                        return <Citation key={index} part={part} index={index} />;
                    }
                    return null;
                })}
            </div>
        );
    }
    return <div>{String(content)}</div>;
};

export default function Chat({ widthSize = null }) {
    const { t } = useTranslation();
    const { items: documents, selectedFileIds } = useSelector((state) => state.documents);
    const filteredDocuments = useMemo(() => documents, [documents]);

    const [content, setContent] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [enableProgress, setEnableProgress] = useState(true);
    const [progressMessages, setProgressMessages] = useState([]);
    const [generateImage, setGenerateImage] = useState(false);

    const handleChatRequest = useCallback((userMessage) => {
        if (!userMessage.trim()) return;

        setIsLoading(true);
        setProgressMessages([]);

        const userMessageObj = { id: `user-${Date.now()}`, message: userMessage, status: 'local' };
        const loadingMessageObj = { id: `loading-${Date.now()}`, message: t('chat.processingQuery'), status: 'loading' };

        flushSync(() => {
            setMessages(prev => [...prev, userMessageObj, loadingMessageObj]);
        });

        const messagesForAPI = [{ content: userMessage }];
        const requestOptions = {
            requestBody: {
                selectedFileIds: selectedFileIds.length > 0 ? selectedFileIds : undefined,
                documentCount: filteredDocuments.length,
                selectedCount: selectedFileIds.length,
                generateImage: generateImage,
            },
        };

        const handleSuccess = async (response) => {
            const responseText = await response.text();
            let responseContent;
            try { responseContent = JSON.parse(responseText); } catch (e) { responseContent = responseText; }
            
            // 檢查是否有生成的圖像
            let messageWithImage = responseContent;
            if (typeof responseContent === 'object' && responseContent.generated_image) {
                // 如果有圖像，將其添加到消息內容中
                messageWithImage = {
                    ...responseContent,
                    hasImage: true,
                    imageData: responseContent.generated_image
                };
            }
            
            setMessages(prev => [
                ...prev.filter(msg => msg.status !== 'loading'),
                { id: `ai-${Date.now()}`, message: messageWithImage, status: 'ai' },
            ]);
        };

        const handleError = (error) => {
            console.error('聊天請求錯誤:', error);
            setMessages(prev => [
                ...prev.filter(msg => msg.status !== 'loading'),
                { id: `ai-error-${Date.now()}`, message: t('chat.errorOccurred'), status: 'ai' },
            ]);
        };

        const apiCall = enableProgress
            ? handleProChatRequestWithProgress(messagesForAPI, {
                ...requestOptions,
                onProgress: (progressEvent) => {
                    setProgressMessages(prev => [...prev, progressEvent]);
                },
            })
            : handleProChatRequest(messagesForAPI, requestOptions);

        apiCall.then(handleSuccess).catch(handleError).finally(() => {
            setIsLoading(false);
        });
    }, [selectedFileIds, filteredDocuments, enableProgress, generateImage, t]);

    // 監聽來自其他組件的消息發送事件
    useEffect(() => {
        const handleSendToChat = (event) => {
            const { message } = event.detail;
            if (message && message.trim()) {
                handleChatRequest(message);
            }
        };

        window.addEventListener('sendToChat', handleSendToChat);
        return () => {
            window.removeEventListener('sendToChat', handleSendToChat);
        };
    }, [handleChatRequest]);

    const handleClearChat = useCallback(() => {
        setMessages([]);
        setContent('');
        setProgressMessages([]);
    }, []);

    const handleCopy = useCallback((messageContent) => {
        console.log('handleCopy called with:', typeof messageContent, messageContent);
        const textToCopy = extractMessageText(messageContent);
        console.log('Copying text:', textToCopy);
        if (!textToCopy.trim()) {
            message.warning(t('chat.noContentToCopy'));
            return;
        }
        navigator.clipboard.writeText(textToCopy)
            .then(() => message.success(t('chat.copiedToClipboard')))
            .catch(() => message.error(t('chat.copyFailed')));
    }, [t]);

    const handleResend = useCallback((messageContent) => {
        const msgToResend = messages.find(msg => msg.message === messageContent && msg.status === 'local');
        if (msgToResend) {
            handleChatRequest(msgToResend.message);
        }
    }, [messages, handleChatRequest]);

    const roles = useMemo(() => ({
        ai: {
            placement: 'start',
            avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
            style: { width: '80%' },
        },
        local: {
            placement: 'end',
            avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
        },
    }), []);

    return (
        <Card hoverable className={`h-full flex flex-col transition-all duration-300 ease-in-out`} style={{ width: widthSize || '100%' }} styles={{ body: { height: '100%', padding: 0, display: 'flex', flexDirection: 'column' } }}>
            <div className="flex flex-col h-full gap-4">
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        <Bubble content={generateWelcomeMessage(filteredDocuments.length, selectedFileIds.length)} placement="start" variant="outlined" avatar={{ icon: <UserOutlined />, style: { background: '#fde3cf' } }} />
                    ) : (
                        <Bubble.List
                            roles={roles}
                            items={messages.map(({ id, message, status }, index) => {
   
                                let finalContent;

                                if (status === 'loading' && enableProgress) {
      
                                    finalContent = (
                                        <div className='w-full'>
                                            <RetrievalProgress progressMessages={progressMessages} />
                                            <div className="flex items-center gap-2 mt-2">
                                                <Spin size="small" />
                                                <span>{message}</span>
                                            </div>
                                        </div>
                                    );
                                } else if (status === 'ai') {
                                    const isLastMessage = index === messages.length - 1;

                                    if (isLastMessage && enableProgress && progressMessages.length > 0) {
                                        finalContent = (
                                            <div className='w-full'>
                                                <RetrievalProgress progressMessages={progressMessages} />
                                                {renderMessageContent(message)}
                                            </div>
                                        );
                                    } else {
                                        finalContent = renderMessageContent(message);
                                    }
                                } else { 
                                    finalContent = message;
                                }

                                return {
                                    variant: "outlined",
                                    key: id,
                                   
                                    styles: {
                                        content: { width: status === 'local' ? '' : '100%' }
                                    },
                               
                                    footer: status === 'loading' ? null : (
                                        status === 'local' ? (
                                            <div className='flex gap-2'>
                                                <Button type="text" size="small" icon={<ReloadOutlined />} onClick={() => handleResend(message)} title={t('chat.resend')} />
                                                <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(message)} title={t('chat.copyMessage')} />
                                            </div>
                                        ) : (
                                            <div className='flex gap-2'>
                                                <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(message)} title={t('chat.copyResponse')} />
                                                <TTSButton text={message} />
                                            </div>
                                        )
                                    ),
                                      // 我們不再傳遞 loading: true，而是自己控制內容
                                    role: status === 'local' ? 'local' : 'ai',
                                    content: finalContent,
                                    'data-original-message': JSON.stringify(message),
                                };
                            })}
                        />
                    )}
                </div>
                <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2 items-center mb-2">
                        <Tooltip title={t('chat.progressTooltip')}>
                            <div className="flex items-center gap-2">
                                <Switch size="small" checked={enableProgress} onChange={setEnableProgress} />
                                <span className="text-xs text-gray-500">{t('chat.progressDisplay')}</span>
                            </div>
                        </Tooltip>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="flex-1">
                            <Sender

                                loading={isLoading}
                                value={content}
                                onChange={setContent}
                                allowSpeech
                                onSubmit={nextContent => { handleChatRequest(nextContent); setContent(''); }}
                                placeholder={t('chat.inputPlaceholder')}
                                actions={(_, info) => {
                                    const { SendButton, LoadingButton, ClearButton, SpeechButton } = info.components;
                                    return (
                                        <>
                                            <Space size="small">
                                                <Typography.Text type="secondary">
                                                    <small>{t('chat.enterToSubmit')}</small>
                                                </Typography.Text>
                                                { messages.length > 0 && <Button type="text" icon={<ClearOutlined />} onClick={handleClearChat} title={t('chat.clearChat')} className="flex-shrink-0" /> }
                                                <SpeechButton />
                                                {isLoading ? (
                                                    <LoadingButton type="default" icon={<Spin size="small" />} disabled />
                                                ) : (
                                                    <SendButton type="primary" disabled={false} />
                                                )}
                                            </Space>

                                        </>
                                    )
                                }}

                                footer={
                                    <div className="flex gap-2 items-center">
                                        <Tooltip title={generateImage ? t('chat.disableImageGeneration') : t('chat.enableImageGeneration')}>
                                            <Button 
                                                type={generateImage ? "primary" : "text"} 
                                                icon={<FileImageOutlined />} 
                                                className="flex-shrink-0"
                                                onClick={() => setGenerateImage(!generateImage)}
                                            />
                                        </Tooltip>
                                    </div>
                                }

                            />
                        </div>

                    </div>
                </div>
            </div>
        </Card>
    );
}