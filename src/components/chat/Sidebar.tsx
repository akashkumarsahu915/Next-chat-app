import React, { useState } from 'react';
import { Search, Plus, MessageSquare, Users, Settings, LogOut, User as UserIcon, X, Sun, Moon, UserPlus, Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSelectedChat } from '../../store/slices/chatSlice';
import { toggleTheme, setActiveModal } from '../../store/slices/uiSlice';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';
import { useGetChatsQuery } from '../../store/rtk/apis/chat.slice';

export function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChatId } = useSelector((state: RootState) => state.chat);
  const { theme } = useSelector((state: RootState) => state.ui);
  const { incomingRequests, sentRequests, blockedUserIds } = useSelector((state: RootState) => state.friends);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: chatData, isLoading } = useGetChatsQuery();

  const chats = chatData?.chats || [];

  const filteredChats = chats.filter((chat) => {
    // Filter out chats with blocked users
    const hasBlockedParticipant = chat.participants.some(p => blockedUserIds.includes(p._id));
    if (hasBlockedParticipant) return false;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const chatName = chat.isGroup ? chat.groupName : chat.participants.find(p => p._id !== user?._id)?.username;
    return chatName?.toLowerCase().includes(query);
  });

  const handleChatSelect = (chatId: string) => {
    dispatch(setSelectedChat(chatId));
    navigate('/');
  };

  return (
    <aside className="h-full w-full lg:w-80 flex flex-col bg-card border-r border-border shadow-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar name={user?.username || 'Guest'} src={user?.profilePicture} size="md" isOnline={true} />
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate w-24">{user?.username || 'Guest'}</span>
            <span className="text-xs text-emerald-500">Online</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <NotificationDropdown />
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => dispatch(setActiveModal('new-chat'))}
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 space-y-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start space-x-3 px-3 py-6 rounded-2xl bg-muted/50 hover:bg-muted border border-border/50 transition-all group"
          onClick={() => navigate('/requests')}
        >
          <div className="relative">
            <UserPlus className="h-5 w-5 text-primary" />
            {incomingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-bold text-foreground block">Friend Requests</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                {incomingRequests.length} Incoming
              </span>
              <span className="text-[10px] text-muted-foreground opacity-30">•</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                {sentRequests.length} Sent
              </span>
            </div>
          </div>
          <Plus className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>

        <Input 
          placeholder="Search chats..." 
          icon={<Search className="h-4 w-4" />}
          className="bg-muted border-none placeholder:text-muted-foreground"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">{searchQuery ? 'No chats match your search' : 'No conversations yet'}</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherParticipant = chat.participants.find(p => p._id !== user?._id);
            const chatName = chat.isGroup ? chat.groupName : otherParticipant?.username;
            const chatPic = chat.isGroup ? undefined : otherParticipant?.profilePicture;
            // unreadCount for the current user
            const unreadCount = user?._id ? chat.unreadCounts?.[user._id] || 0 : 0;
            const lastMsg = chat.lastMessage;

            return (
              <button
                key={chat._id}
                onClick={() => handleChatSelect(chat._id)}
                className={cn(
                  'w-full flex items-center space-x-3 p-3 rounded-xl transition-all hover:bg-muted',
                  selectedChatId === chat._id && 'bg-primary/10'
                )}
              >
                <Avatar 
                  name={chatName || 'Chat'} 
                  src={chatPic} 
                  isOnline={!chat.isGroup && otherParticipant?.isOnline}
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn(
                      'text-sm font-medium truncate',
                      selectedChatId === chat._id ? 'text-primary' : 'text-foreground'
                    )}>
                      {chatName}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate flex-1 leading-relaxed">
                      {lastMsg?.content || 'No messages yet'}
                    </p>
                    {!chat.isGroup && otherParticipant && (
                      <span className={cn(
                        "ml-2 text-[9px] font-bold uppercase tracking-tighter shrink-0",
                        otherParticipant.isOnline ? "text-emerald-500" : "text-muted-foreground/50"
                      )}>
                        {otherParticipant.isOnline ? 'Online' : 'Offline'}
                      </span>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg shadow-primary/20">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Footer Nav - Desktop Only */}
      <div className="hidden lg:grid p-4 border-t border-border grid-cols-4 gap-1 bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => navigate('/explore')} className="rounded-xl">
          <Users className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="rounded-xl">
          <UserIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="rounded-xl">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </aside>
  );
}
