import { Phone, Video, MoreVertical, Search, ChevronLeft, Ban, Flag, AlertTriangle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSelectedChat } from '../../store/slices/chatSlice';
import { blockUser } from '../../store/slices/friendsSlice';
import { addToast } from '../../store/slices/toastSlice';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Chat } from '../../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface ChatHeaderProps {
  chat: Chat;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [modalType, setModalType] = useState<'block' | 'report'>('block');
  const participant = chat.participants[0];

  const handleBlock = () => {
    if (participant) {
      dispatch(blockUser(participant.id));
      dispatch(setSelectedChat(null));
      dispatch(addToast({ 
        message: `${participant.username} has been blocked`, 
        type: 'info' 
      }));
    }
    setShowBlockModal(false);
  };

  const handleReport = () => {
    dispatch(addToast({ 
      message: `Report submitted for ${participant?.username}`, 
      type: 'success' 
    }));
    setShowBlockModal(false);
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
          name={chat.name || participant?.username || 'Chat'} 
          src={participant?.avatar} 
          isOnline={participant?.isOnline} 
          size="md" 
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {chat.name || participant?.username}
          </span>
          <span className="text-[10px] text-emerald-500 font-medium">
            {participant?.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
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
                    <button
                      onClick={() => {
                        setModalType('report');
                        setShowBlockModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                      <span className="font-medium">Report User</span>
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
        title={modalType === 'block' ? 'Block User' : 'Report User'}
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
              ? `You are about to block ${participant?.username}. You will no longer be able to message each other.`
              : `Are you sure you want to report ${participant?.username} for inappropriate behavior?`}
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
