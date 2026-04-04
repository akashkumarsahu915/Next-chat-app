import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { acceptCall, endCall } from '../../store/slices/callSlice';
import { useSocket } from '../../context/SocketContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function IncomingCallModal() {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { status, isIncoming, caller, chatId } = useSelector((state: RootState) => state.call);

  if (status !== 'ringing' || !isIncoming || !caller) return null;

  const handleAccept = () => {
    dispatch(acceptCall());
    socket?.emit('accept_call', { to: caller._id, chatId });
  };

  const handleDecline = () => {
    dispatch(endCall());
    socket?.emit('reject_call', { to: caller._id, chatId });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-border p-8 text-center"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
          <Avatar 
            name={caller.username} 
            src={caller.profilePicture} 
            size="xl" 
            className="mx-auto relative z-10 border-4 border-card shadow-xl"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">{caller.username}</h2>
        <p className="text-muted-foreground mb-8">is calling you...</p>
        
        <div className="flex items-center justify-center space-x-6">
          <button 
            onClick={handleDecline}
            className="w-16 h-16 rounded-full bg-[#ef4444] text-white hover:bg-[#dc2626] transition-all duration-300 flex items-center justify-center shadow-lg shadow-red-500/20"
          >
            <PhoneOff className="h-7 w-7" />
          </button>
          
          <button 
            onClick={handleAccept}
            className="w-16 h-16 rounded-full bg-[#10b981] text-white hover:bg-[#059669] shadow-lg shadow-emerald-500/30 transition-all duration-300 scale-110 flex items-center justify-center"
          >
            <Phone className="h-7 w-7" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
