import React from 'react';
import { cn } from '../../lib/utils';
import { Message } from '../../types';
import { Trash2, Check, CheckCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteMessage } from '../../store/slices/chatSlice';
import { RootState } from '../../store';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  avatarSrc?: string;
  senderName?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn, showAvatar, avatarSrc, senderName }) => {
  const dispatch = useDispatch();
  const { selectedChatId } = useSelector((state: RootState) => state.chat);

  const handleDelete = () => {
    if (selectedChatId) {
      dispatch(deleteMessage({ chatId: selectedChatId, messageId: message.id }));
    }
  };

  const renderStatus = () => {
    if (!isOwn) return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-primary-foreground/60" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-primary-foreground/60" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-emerald-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex w-full items-end space-x-2 mb-4 group', isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row')}>
      {showAvatar && !isOwn && (
        <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 border border-border shadow-sm">
          <img src={avatarSrc || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderName}`} alt={senderName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        </div>
      )}
      <div className={cn('flex flex-col max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
        {senderName && !isOwn && <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">{senderName}</span>}
        <div className="flex items-center space-x-2 group relative">
          {isOwn && (
            <button 
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-all rounded-full hover:bg-red-500/10"
              title="Delete message"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl text-sm shadow-sm relative',
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-none'
                : 'bg-card text-foreground border border-border rounded-bl-none'
            )}
          >
            {message.type === 'image' ? (
              <img src={message.content} alt="Sent image" className="max-w-full rounded-lg" referrerPolicy="no-referrer" />
            ) : (
              <p className="leading-relaxed break-words">{message.content}</p>
            )}
            
            <div className={cn(
              "flex items-center justify-end space-x-1 mt-1 -mb-1",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              <span className="text-[9px] font-medium">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {renderStatus()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
