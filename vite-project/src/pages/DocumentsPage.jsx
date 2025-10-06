import React from 'react';
import { useSelector } from 'react-redux';

import DocumentList from '../components/DocumentList.jsx';
import DocumentsTabs from '../components/DocumentsTabs.jsx';
import Chat from '../components/Chat.jsx';
import StudioCard from '../components/Studio/StudioCard.jsx';

import useMediaQuery from '../hooks/useMediaQuery';
import useLayoutWidth from '../hooks/useLayoutWidth';

const DocumentsPage = () => {
    const {
        selectedShowDocumentContentID,
        isDocumentListCollapsed,
    } = useSelector((state) => state.documents);
    const { isStudioCardCollapsed, isQuizReaderOpen } = useSelector((state) => state.studio);
    const isMediumScreen = useMediaQuery('(max-width: 1024px)');

    // 使用自定義 Hook 計算佈局寬度
    const { documentListWidth, chatWidth, studioCardWidth } = useLayoutWidth({
        isDocumentListCollapsed,
        isStudioCardCollapsed,
        isQuizReaderOpen,
        selectedShowDocumentContentID,
    });

    return (
        <>
            {
                isMediumScreen ? (
                    <div className={`h-screen flex overflow-hidden bg-gray-100 flex-col`}>
                        <DocumentsTabs
                            sourcesContent={< DocumentList />}
                            chatContent={<Chat />}
                        />
                    </div>
                ) : (
                    <div className={`h-screen p-4 flex overflow-hidden gap-4  bg-gray-100 `}>
                        <DocumentList widthSize={documentListWidth} />
                        <Chat widthSize={chatWidth} />
                        <StudioCard widthSize={studioCardWidth} />
                    </div>
                )}
        </>
    );
};

export default DocumentsPage;