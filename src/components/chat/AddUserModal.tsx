import React, { useState } from 'react';
import { X, Search, Check, Loader2, UserPlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setActiveModal } from '../../store/slices/uiSlice';
import { addToast } from '../../store/slices/toastSlice';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useGetFriendListQuery, useSearchUsersQuery } from '../../store/slices/friends.slice';
import { useAddUserToGroupMutation } from '../../store/slices/group.slice';

export function AddUserModal() {
  const dispatch = useDispatch();
  const { selectedChatId, chats } = useSelector((state: RootState) => state.chat);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedChat = chats.find(c => c._id === selectedChatId);
  const existingParticipantIds = selectedChat?.participants.map(p => p._id) || [];

  const { data: friendData, isLoading: isLoadingFriends } = useGetFriendListQuery();
  const { data: searchResults, isFetching: isSearching } = useSearchUsersQuery(searchQuery, {
    skip: searchQuery.length < 2
  });

  const [addUser, { isLoading: isAdding }] = useAddUserToGroupMutation();

  const friends = friendData?.friends || [];
  
  // Combine friends and search results, filtering out search results that are already in friends list to avoid duplicates
  const displayedUsers = searchQuery.length >= 2 && searchResults 
    ? [...friends.filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase())), 
       ...searchResults.filter(s => !friends.some(f => f._id === s._id))]
    : friends.filter(f => 
        f.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleAddUser = async (userId: string, username: string) => {
    if (!selectedChatId) return;
    
    try {
      await addUser({ chatId: selectedChatId, userId }).unwrap();
      dispatch(addToast({ 
        message: `${username} added to the group`, 
        type: 'success' 
      }));
      dispatch(setActiveModal(null));
    } catch (error: any) {
      console.error('Failed to add user:', error);
      const errorMessage = error?.data?.message || 'Failed to add user to group';
      dispatch(addToast({ message: errorMessage, type: 'error' }));
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
            <h2 className="text-xl font-bold text-foreground">Add to Group</h2>
            <p className="text-sm text-muted-foreground">Invite a friend to {selectedChat?.groupName || 'this group'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => dispatch(setActiveModal(null))} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <Input 
            placeholder="Search by name or email..." 
            icon={isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
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
            ) : displayedUsers.length > 0 ? (
              displayedUsers.map((user) => {
                const isAlreadyInGroup = existingParticipantIds.includes(user._id);
                return (
                  <button
                    key={user._id}
                    disabled={isAlreadyInGroup || isAdding}
                    onClick={() => handleAddUser(user._id, user.username)}
                    className={cn(
                      "w-full flex items-center space-x-3 p-3 rounded-xl transition-all group",
                      isAlreadyInGroup ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
                    )}
                  >
                    <Avatar name={user.username} src={user.profilePicture} isOnline={user.isOnline} />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {isAlreadyInGroup ? (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded-md">Member</span>
                    ) : (
                      <UserPlus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-xs text-muted-foreground">No users found</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-muted/50 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full rounded-2xl" 
            onClick={() => dispatch(setActiveModal(null))}
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
