import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addMessage, setMessages, setChats } from '../store/slices/chatSlice';

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
import { useGetChatsQuery, useGetMessagesQuery, useSendMessageMutation, useMarkChatAsReadMutation } from '../store/rtk/apis/chat.slice';
import { useSendGroupMessageMutation, useGetGroupMessagesQuery, useMarkGroupChatAsReadMutation } from '../store/slices/group.slice';
import { useSocket } from '../context/SocketContext';
import { markAsReadSuccess } from '../store/slices/chatSlice';


export function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChatId, messages, isTyping } = useSelector((state: RootState) => state.chat);
  const { notificationSettings } = useSelector((state: RootState) => state.ui);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const { data: chatData } = useGetChatsQuery();
  const { chats } = useSelector((state: RootState) => state.chat);
  const [sendMessage] = useSendMessageMutation();
  const [sendGroupMessage] = useSendGroupMessageMutation();
  const [markAsRead] = useMarkChatAsReadMutation();
  const [markGroupChatAsRead] = useMarkGroupChatAsReadMutation();
  const markAsReadRef = useRef<string | null>(null);
  const { socket } = useSocket();

  // Sync API data to Redux for real-time updates
  useEffect(() => {
    if (chatData?.chats) {
      dispatch(setChats(chatData.chats));
    }
  }, [chatData, dispatch]);

  // Socket: Join/Leave Chat Room

  useEffect(() => {
    if (socket && selectedChatId) {
      const joinRoom = () => {
        socket.emit('join_chat', selectedChatId);
        console.log(`Joined chat: ${selectedChatId}`);
      };

      joinRoom();
      socket.on('connect', joinRoom);

      return () => {
        socket.off('connect', joinRoom);
        console.log(`Unsubscribing from focused join events for: ${selectedChatId}`);
      };
    }
  }, [socket, selectedChatId]);


  // Socket: Listen for real-time events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      console.log('[DEBUG] Received new_message event in Dashboard:', newMessage);
      
      // Skip if it's our own message (handled optimistically or via REST response)
      const senderId = typeof newMessage.senderId === 'string' ? newMessage.senderId : newMessage.senderId._id;
      const isOurMessage = senderId === user?._id;
      
      console.log('[DEBUG] Message Filter Result:', { 
        senderId, 
        currentUserId: user?._id, 
        isOurMessage, 
        chatId: newMessage.chatId, 
        selectedChatId 
      });

      if (isOurMessage) {
        console.log('[DEBUG] Dropping message (it is our own)');
        return;
      }

      // Add message to Redux store
      console.log('[DEBUG] Dispatching addMessage to Redux');
      dispatch(addMessage({ chatId: newMessage.chatId, message: newMessage }));
      
      // If it's the current chat, mark as read
      if (newMessage.chatId === selectedChatId) {
        console.log('[DEBUG] Current chat active, triggering markAsRead');
        if (selectedChat?.isGroup) {
          markGroupChatAsRead(selectedChatId);
        } else {
          markAsRead(selectedChatId);
        }
      }
    };



    const handleMessagesRead = ({ chatId, userId }: { chatId: string, userId: string }) => {
      if (userId === user?._id) {
        dispatch(markAsReadSuccess({ chatId, userId }));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, selectedChatId, user?._id, dispatch, markAsRead]);


  // Fetch message history when selectedChatId changes
  const selectedChat = (chats || []).find(c => c._id === selectedChatId);

  const { data: historyData, isLoading: isHistoryLoading } = useGetMessagesQuery(
    { chatId: selectedChatId as string, page: 1, limit: 20 },
    { skip: !selectedChatId || selectedChat?.isGroup }
  );

  const { data: groupHistoryData, isLoading: isGroupHistoryLoading } = useGetGroupMessagesQuery(
    selectedChatId as string,
    { skip: !selectedChatId || !selectedChat?.isGroup }
  );

  const isMessagesLoading = selectedChat?.isGroup ? isGroupHistoryLoading : isHistoryLoading;
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
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 300;
      setShowScrollToBottom(!isAtBottom);
    }
  };

  // Mark as read when selecting chat
  useEffect(() => {
    if (selectedChatId && markAsReadRef.current !== selectedChatId) {
      if (selectedChat?.isGroup) {
        markGroupChatAsRead(selectedChatId);
      } else {
        markAsRead(selectedChatId);
      }
      markAsReadRef.current = selectedChatId;
    }
  }, [selectedChatId, selectedChat?.isGroup, markAsRead, markGroupChatAsRead]);

  // Sync history messages to Redux store
  useEffect(() => {
    if (!selectedChatId) return;

    if (selectedChat?.isGroup) {
      if (groupHistoryData) {
        dispatch(setMessages({
          chatId: selectedChatId,
          messages: groupHistoryData
        }));
      }
    } else {
      if (historyData?.messages) {
        dispatch(setMessages({
          chatId: selectedChatId,
          messages: historyData.messages
        }));
      }
    }
  }, [historyData, groupHistoryData, selectedChatId, selectedChat?.isGroup, dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const handleSendMessage = async (content: string, type: 'text' | 'image') => {
    if (!selectedChatId || !user) return;

    // Optional: Optimistic update
    const tempId = Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      _id: tempId,
      chatId: selectedChatId,
      senderId: user._id,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: type as any,
      status: 'sending'
    };
    dispatch(addMessage({ chatId: selectedChatId, message: newMessage }));

    try {
      if (selectedChat?.isGroup) {
        await sendGroupMessage({
          chatId: selectedChatId,
          content,
          type
        }).unwrap();
      } else {
        await sendMessage({
          chatId: selectedChatId,
          content,
          type
        }).unwrap();
      }

      // The history will automatically re-fetch due to tag invalidation
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optional: handle error UI
    }
  };

  return (
    <>
      {selectedChat ? (
        <div className="flex-1 flex flex-col h-full bg-background relative uppercase-none">
          <ChatHeader chat={selectedChat} />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 scroll-smooth"
          >
            {isMessagesLoading && currentMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm">No messages yet. Say hi!</p>
              </div>
            ) : (
              currentMessages.map((msg) => (
                <ChatBubble
                  key={msg._id}
                  message={msg}
                  isOwn={(typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id) === user?._id}
                  senderName={
                    (typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id) === user?._id
                      ? user.username
                      : (typeof msg.senderId === 'string' ? 'Someone' : msg.senderId.username || 'Someone')
                  }
                  avatarSrc={
                    (typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id) === user?._id
                      ? user.profilePicture
                      : (typeof msg.senderId === 'string' ? undefined : msg.senderId.profilePicture)
                  }
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
                  {selectedChat?.isGroup ? 'Someone' : selectedChat?.participants.find(p => p._id !== user?._id)?.username} is typing...
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
        <div className="flex-1 flex flex-col h-full uppercase-none">
          <MobileHeader title="NexChat" />
          <EmptyState />
        </div>
      )}
    </>
  );
}
