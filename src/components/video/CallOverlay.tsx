import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { endCall, toggleMute, toggleCamera } from '../../store/slices/callSlice';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../hooks/useWebRTC';
import { Button } from '../ui/Button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function CallOverlay() {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { status, isIncoming, caller, receiver, isMuted, isCameraOff, chatId } = useSelector((state: RootState) => state.call);
  const { localStream, remoteStream, startLocalStream, initiateOutgoingCall } = useWebRTC();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // If status is ringing and we are caller, trigger the call start
  useEffect(() => {
    if (status === 'ringing' && !isIncoming) {
      initiateOutgoingCall();
    }
  }, [status, isIncoming, initiateOutgoingCall]);

  // If status is active and we are receiver, ensure local stream is started
  useEffect(() => {
    if (status === 'active' && isIncoming && !localStream) {
      startLocalStream();
    }
  }, [status, isIncoming, localStream, startLocalStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // IMPORTANT: For the receiver, don't show the full-screen overlay while ringing
  // The IncomingCallModal handles that part.
  if (status === 'idle' || (status === 'ringing' && isIncoming)) return null;

  const handleEndCall = () => {
    socket?.emit('end_call', { 
      to: isIncoming ? caller?._id : receiver?._id, 
      chatId 
    });
    dispatch(endCall());
  };

  const otherUser = isIncoming ? caller : receiver;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-xl pointer-events-auto">
      {/* Remote Video (Full Screen) */}
      <div className="relative flex-1 overflow-hidden">
        {remoteStream ? (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <img 
                src={otherUser?.profilePicture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
                alt="Connecting" 
                className="w-32 h-32 rounded-full border-4 border-primary shadow-2xl relative z-10"
              />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{otherUser?.username}</h3>
              <p className="text-primary animate-pulse font-medium tracking-widest uppercase text-xs">
                {status === 'ringing' ? 'Calling...' : 'Connecting...'}
              </p>
            </div>
          </div>
        )}

        {/* Local Video (Floating) */}
        <motion.div 
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          className="absolute top-6 right-6 w-40 h-56 rounded-3xl overflow-hidden border-2 border-white/20 bg-background/20 backdrop-blur-md shadow-2xl z-20 cursor-move"
        >
          {isCameraOff ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <VideoOff className="h-8 w-8 text-slate-600" />
            </div>
          ) : (
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}
        </motion.div>

        {/* Controls Overlay */}
        <div className="absolute bottom-10 left-0 right-0 z-30 px-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-md mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-[2.5rem] flex items-center justify-center space-x-6 shadow-2xl"
          >
            <Button 
              size="icon"
              variant="ghost"
              onClick={() => dispatch(toggleMute())}
              className={cn(
                "w-12 h-12 rounded-full transition-all duration-300",
                isMuted ? "bg-red-500 text-white" : "text-white hover:bg-white/10"
              )}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <Button 
              size="icon"
              variant="ghost"
              onClick={() => dispatch(toggleCamera())}
              className={cn(
                "w-12 h-12 rounded-full transition-all duration-300",
                isCameraOff ? "bg-red-500 text-white" : "text-white hover:bg-white/10"
              )}
            >
              {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>

            <Button 
              size="icon"
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/40 transition-transform active:scale-95"
            >
              <PhoneOff className="h-7 w-7" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
