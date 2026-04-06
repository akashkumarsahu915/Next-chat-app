import { Phone, Video, MoreVertical, Search, ChevronLeft, Ban, Flag, AlertTriangle, UserPlus, LogOut, Info } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedChat } from '../../store/slices/chatSlice';
import { setActiveModal } from '../../store/slices/uiSlice';
import { blockUser } from '../../store/slices/friendsSlice';
import { addToast } from '../../store/slices/toastSlice';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Chat } from '../../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { RootState } from '../../store';

interface ChatHeaderProps {
  chat: Chat;
}

import { initiateCall } from '../../store/slices/callSlice';
import { useRemoveUserFromGroupMutation } from '../../store/slices/group.slice';

export function ChatHeader({ chat }: ChatHeaderProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [modalType, setModalType] = useState<'block' | 'report'>('block');
  const [removeUser] = useRemoveUserFromGroupMutation();

  // Identify the other participant for private chats
  const otherParticipant = chat.isGroup 
    ? null 
    : chat.participants.find(p => p._id !== user?._id);
  
  const chatName = chat.isGroup ? chat.groupName : otherParticipant?.username;
  const chatPic = chat.isGroup ? undefined : otherParticipant?.profilePicture;
  const isOnline = chat.isGroup ? false : otherParticipant?.isOnline;

  const handleStartCall = () => {
    if (otherParticipant && !chat.isGroup) {
      dispatch(initiateCall({ receiver: otherParticipant, chatId: chat._id }));
    } else {
      dispatch(addToast({ message: 'Video calling is only available for 1-on-1 chats', type: 'info' }));
    }
  };

  const handleBlock = () => {
    if (otherParticipant) {
      dispatch(blockUser(otherParticipant._id));
      dispatch(setSelectedChat(null));
      dispatch(addToast({ 
        message: `${otherParticipant.username} has been blocked`, 
        type: 'info' 
      }));
    }
    setShowBlockModal(false);
  };

  const handleReport = () => {
    dispatch(addToast({ 
      message: `Report submitted for ${chatName}`, 
      type: 'success' 
    }));
    setShowBlockModal(false);
  };
  
  const handleLeaveGroup = async () => {
    if (!chat._id || !user?._id) return;
    try {
      await removeUser({ chatId: chat._id, userId: user._id }).unwrap();
      dispatch(addToast({ message: `You left ${chatName}`, type: 'success' }));
      dispatch(setSelectedChat(null));
    } catch (error: any) {
      console.error('Failed to leave group:', error);
      const errorMessage = error?.data?.message || 'Failed to leave group';
      dispatch(addToast({ message: errorMessage, type: 'error' }));
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-card border-b border-border relative">
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden rounded-full"
          onClick={() => dispatch(setSelectedChat(null))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Avatar 
          name={chatName || 'Chat'} 
          src={chatPic} 
          isOnline={isOnline} 
          size="md" 
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {chatName}
          </span>
          {!chat.isGroup && (
            <span className={cn(
              "text-[10px] font-medium",
              isOnline ? "text-emerald-500" : "text-muted-foreground"
            )}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          )}
          {chat.isGroup && (
            <span className="text-[10px] text-muted-foreground font-medium">
              {chat.participants.length} Members
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
          <Phone className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-muted-foreground hover:text-primary transition-colors"
          onClick={handleStartCall}
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
          <Search className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-2">
                    {!chat.isGroup && (
                      <button
                        onClick={() => {
                          setModalType('block');
                          setShowBlockModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Ban className="h-4 w-4" />
                        <span className="font-medium">Block User</span>
                      </button>
                    )}
                    {chat.isGroup && (
                      <>
                        <button
                          onClick={() => {
                            dispatch(setActiveModal('group-info'));
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Group Info</span>
                        </button>
                        <button
                          onClick={() => {
                            dispatch(setActiveModal('add-user'));
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-primary hover:bg-primary/10 transition-colors"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span className="font-medium">Add Member</span>
                        </button>
                        <button
                          onClick={() => {
                            handleLeaveGroup();
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="font-medium">Leave Group</span>
                        </button>
                        <div className="my-1 border-t border-border/50" />
                      </>
                    )}
                    <button
                      onClick={() => {
                        setModalType('report');
                        setShowBlockModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                      <span className="font-medium">Report {chat.isGroup ? 'Group' : 'User'}</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title={modalType === 'block' ? 'Block User' : `Report ${chat.isGroup ? 'Group' : 'User'}`}
      >
        <div className="p-6 text-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
            modalType === 'block' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
          )}>
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {modalType === 'block' ? 'Are you sure?' : 'Submit Report?'}
          </h3>
          <p className="text-muted-foreground mb-8">
            {modalType === 'block' 
              ? `You are about to block ${chatName}. You will no longer be able to message each other.`
              : `Are you sure you want to report ${chatName} for inappropriate behavior?`}
          </p>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl"
              onClick={() => setShowBlockModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant={modalType === 'block' ? "danger" : "primary"}
              className="flex-1 rounded-xl"
              onClick={modalType === 'block' ? handleBlock : handleReport}
            >
              {modalType === 'block' ? 'Block' : 'Report'}
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
