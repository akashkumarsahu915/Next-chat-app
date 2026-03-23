import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addMessage, setChats } from '../store/slices/chatSlice';
import { Layout } from '../components/layout/Layout';
import { MobileHeader } from '../components/layout/MobileHeader';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatBubble } from '../components/chat/ChatBubble';
import { MessageInput } from '../components/chat/MessageInput';
import { EmptyState } from '../components/chat/EmptyState';
import { Message } from '../types';
import { notificationService } from '../lib/notificationService';
import { ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

export function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { chats, selectedChatId, messages, isTyping } = useSelector((state: RootState) => state.chat);
  const { notificationSettings } = useSelector((state: RootState) => state.ui);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : [];
  const isOtherTyping = selectedChatId ? isTyping[selectedChatId] : false;

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Show button if user is more than 300px away from bottom
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 300;
      setShowScrollToBottom(!isAtBottom);
    }
  };

  useEffect(() => {
    // Mock initial chats
    dispatch(setChats([
      {
        id: 'chat-1',
        isGroup: false,
        participants: [{ id: '2', uid: '234567', username: 'Sarah Wilson', email: 'sarah@example.com', isOnline: true, isPrivate: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }],
        unreadCount: 2,
        lastMessage: { id: 'm1', senderId: '2', content: 'Hey, how are you?', timestamp: new Date().toISOString(), type: 'text', status: 'read' }
      },
      {
        id: 'chat-2',
        isGroup: false,
        participants: [{ id: '3', uid: '345678', username: 'John Doe', email: 'john@example.com', isOnline: false, isPrivate: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' }],
        unreadCount: 0,
        lastMessage: { id: 'm2', senderId: '1', content: 'See you tomorrow!', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'text', status: 'read' }
      }
    ]));
  }, [dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const handleSendMessage = (content: string, type: 'text' | 'image') => {
    if (!selectedChatId || !user) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      content,
      timestamp: new Date().toISOString(),
      type,
      status: 'sent'
    };

    dispatch(addMessage({ chatId: selectedChatId, message: newMessage }));

    // Mock response
    setTimeout(async () => {
      const response: Message = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: selectedChat?.participants[0].id || 'bot',
        content: `Thanks for the ${type}!`,
        timestamp: new Date().toISOString(),
        type: 'text',
        status: 'read'
      };
      dispatch(addMessage({ chatId: selectedChatId, message: response }));
      
      // Trigger notification if enabled
      if (notificationSettings.pushEnabled && notificationSettings.newMessages) {
        await notificationService.notify(
          `New message from ${selectedChat?.participants[0].username}`,
          response.content,
          'message'
        );
      }
    }, 1000);
  };

  return (
    <Layout>
      {selectedChat ? (
        <div className="flex-1 flex flex-col h-full bg-background relative">
          <ChatHeader chat={selectedChat} />
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 scroll-smooth"
          >
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm">No messages yet. Say hi!</p>
              </div>
            ) : (
              currentMessages.map((msg) => (
                <ChatBubble 
                  key={msg.id}
                  message={msg} 
                  isOwn={msg.senderId === user?.id} 
                  senderName={msg.senderId === user?.id ? user.username : selectedChat.participants[0].username}
                  avatarSrc={msg.senderId === user?.id ? user.avatar : selectedChat.participants[0].avatar}
                  showAvatar={true}
                />
              ))
            )}
            {isOtherTyping && (
              <div className="flex items-center space-x-2 p-2 animate-pulse">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-slate-400 italic">
                  {selectedChat.participants[0].username} is typing...
                </span>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showScrollToBottom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-24 right-6 z-40"
              >
                <Button
                  size="icon"
                  onClick={scrollToBottom}
                  className="rounded-full w-10 h-10 shadow-lg bg-background border border-border text-foreground hover:bg-accent"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
          <MobileHeader title="NexChat" />
          <EmptyState />
        </div>
      )}
    </Layout>
  );
}
