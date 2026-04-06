import React from 'react';
import { X, UserMinus, UserPlus, Shield, Loader2, Info } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setActiveModal } from '../../store/slices/uiSlice';
import { addToast } from '../../store/slices/toastSlice';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useGetGroupMembersQuery, useRemoveUserFromGroupMutation } from '../../store/slices/group.slice';
import { setSelectedChat } from '../../store/slices/chatSlice';

export function GroupInfoModal() {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { selectedChatId, chats } = useSelector((state: RootState) => state.chat);
  
  const selectedChat = chats.find(c => c._id === selectedChatId);
  const { data: membersData, isLoading: isLoadingMembers } = useGetGroupMembersQuery(selectedChatId as string, {
    skip: !selectedChatId
  });

  const [removeUser, { isLoading: isRemoving }] = useRemoveUserFromGroupMutation();

  const handleRemoveMember = async (userId: string, username: string) => {
    if (!selectedChatId) return;
    
    // If user is removing themselves, it's a "Leave Group" action
    const isSelf = userId === currentUser?._id;
    
    try {
      await removeUser({ chatId: selectedChatId, userId }).unwrap();
      dispatch(addToast({ 
        message: isSelf ? `You left ${selectedChat?.groupName}` : `${username} removed from the group`, 
        type: 'success' 
      }));
      
      if (isSelf) {
        dispatch(setSelectedChat(null));
        dispatch(setActiveModal(null));
      }
    } catch (error: any) {
      console.error('Failed to remove user:', error);
      const errorMessage = error?.data?.message || 'Failed to update group members';
      dispatch(addToast({ message: errorMessage, type: 'error' }));
    }
  };

  if (!selectedChat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground truncate max-w-[200px]">{selectedChat.groupName}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Group Information</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => dispatch(setActiveModal(null))} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Group Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Members</p>
              <p className="text-2xl font-bold text-foreground">{membersData?.members.length || selectedChat.participants.length}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Created</p>
              <p className="text-sm font-bold text-foreground">
                {new Date(selectedChat.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
                <span>Members List</span>
                {isLoadingMembers && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-primary hover:text-primary hover:bg-primary/10 rounded-full text-[11px] font-bold"
                onClick={() => dispatch(setActiveModal('add-user'))}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Add Member
              </Button>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {isLoadingMembers && !membersData ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-xl animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-muted rounded" />
                      <div className="h-2 w-32 bg-muted rounded" />
                    </div>
                  </div>
                ))
              ) : membersData?.members.map((member) => {
                const isMe = member._id === currentUser?._id;
                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar name={member.username} src={member.profilePicture} size="md" />
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-semibold text-foreground">{member.username}</span>
                          {isMe && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">You</span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">UID: {member.uid}</span>
                      </div>
                    </div>

                    {!isMe && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isRemoving}
                        onClick={() => handleRemoveMember(member._id, member.username)}
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border-t border-border flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl font-bold text-xs" 
            onClick={() => dispatch(setActiveModal(null))}
          >
            Close
          </Button>
          <Button 
            variant="danger" 
            className="flex-1 rounded-2xl font-bold text-xs" 
            disabled={isRemoving}
            onClick={() => handleRemoveMember(currentUser?._id as string, currentUser?.username as string)}
          >
            Leave Group
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
