import React, { useState } from 'react';
import { X, Search, Users, UserPlus, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { setActiveModal } from '../../store/slices/uiSlice';
import { setChats, setSelectedChat } from '../../store/slices/chatSlice';
import { addToast } from '../../store/slices/toastSlice';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import { User, Chat } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

import { useGetFriendListQuery } from '../../store/slices/friends.slice';
import { useAccessChatMutation } from '../../store/slices/chat.slice';
import { useCreateGroupMutation } from '../../store/slices/group.slice';
import { Loader2 } from 'lucide-react';

export function NewChatModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats } = useSelector((state: RootState) => state.chat);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');

  const { data: friendData, isLoading: isLoadingFriends, isError: friendError } = useGetFriendListQuery();
  const [accessChat, { isLoading: isCreatingChat }] = useAccessChatMutation();
  const [createGroup, { isLoading: isCreatingGroup }] = useCreateGroupMutation();

  const friends = friendData?.friends || [];

  const filteredUsers = friends.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (user: User) => {
    if (selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      if (!isGroup) {
        setSelectedUsers([user]);
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;
    if (isGroup && !groupName.trim()) return;

    if (!isGroup) {
      try {
        const chat = await accessChat({ userId: selectedUsers[0]._id }).unwrap();
        dispatch(setSelectedChat(chat._id));
        dispatch(setActiveModal(null));
        navigate('/');
      } catch (error: any) {
        console.error('Failed to access chat:', error);
      }
    } else {
      try {
        const chat = await createGroup({ 
          groupName, 
          participants: selectedUsers.map(u => u._id) 
        }).unwrap();
        
        // The API returns the chat object with its _id
        dispatch(setSelectedChat(chat._id));
        dispatch(addToast({ 
          message: `Group "${groupName}" created successfully!`, 
          type: 'success' 
        }));
        dispatch(setActiveModal(null));
        navigate('/');
      } catch (error: any) {
        console.error('Failed to create group:', error);
      }
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">New Conversation</h2>
            <p className="text-sm text-muted-foreground">Start a new chat or create a group</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => dispatch(setActiveModal(null))} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2 p-1 bg-muted rounded-2xl">
            <button 
              onClick={() => { setIsGroup(false); setSelectedUsers([]); }}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-sm font-medium transition-all",
                !isGroup ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserPlus className="h-4 w-4" />
              <span>Direct Message</span>
            </button>
            <button 
              onClick={() => { setIsGroup(true); setSelectedUsers([]); }}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-sm font-medium transition-all",
                isGroup ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              <span>Group Chat</span>
            </button>
          </div>

          {isGroup && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <Input 
                placeholder="Group Name" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-muted border-none"
              />
            </motion.div>
          )}

          <Input 
            placeholder="Search people..." 
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted border-none"
          />

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {isLoadingFriends ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">Loading friends...</p>
              </div>
            ) : friendError ? (
              <div className="text-center py-10">
                <p className="text-xs text-red-500">Failed to load friends</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isSelected = selectedUsers.find(u => u._id === user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => toggleUser(user)}
                    className={cn(
                      "w-full flex items-center space-x-3 p-3 rounded-xl transition-all hover:bg-muted",
                      isSelected && "bg-primary/10"
                    )}
                  >
                    <div className="relative">
                      <Avatar name={user.username} src={user.profilePicture} isOnline={user.isOnline} />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-card">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-xs text-muted-foreground">No friends found</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-muted/50 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'} selected
          </p>
          <Button 
            onClick={handleCreateChat} 
            disabled={selectedUsers.length === 0 || (isGroup && !groupName.trim()) || isCreatingChat || isCreatingGroup}
            className="rounded-2xl px-6 min-w-[120px]"
          >
            {(isCreatingChat || isCreatingGroup) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Chat'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
