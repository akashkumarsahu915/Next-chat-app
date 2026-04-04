import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useSocket } from '../context/SocketContext';
import { setCallActive, endCall } from '../store/slices/callSlice';
import { addToast } from '../store/slices/toastSlice';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC() {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { status, isIncoming, caller, receiver, chatId, isMuted, isCameraOff } = useSelector((state: RootState) => state.call);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    localStreamRef.current = null;
    pendingIceCandidates.current = [];
  }, []);

  const createPeerConnection = useCallback((targetId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc_signal', {
          to: targetId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnection.current = pc;
    return pc;
  }, [socket]);

  // Initialize Media Stream (shared by caller and receiver)
  const startLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;

      // If a peer connection already exists (for receiver), add tracks now
      if (peerConnection.current) {
        stream.getTracks().forEach(track => {
          peerConnection.current!.addTrack(track, stream);
        });
      }
      return stream;
    } catch (err) {
      console.error('Failed to get media devices:', err);
      dispatch(addToast({ message: 'Could not access camera/microphone', type: 'error' }));
      dispatch(endCall());
      return null;
    }
  }, [dispatch]);

  // Start Outgoing Call (Caller only)
  const initiateOutgoingCall = useCallback(async () => {
    if (!socket || !receiver || !chatId) return;

    const stream = await startLocalStream();
    if (stream) {
      socket.emit('call_user', {
        userToCall: receiver._id,
        chatId
      });
    }
  }, [socket, receiver, chatId, startLocalStream]);

  // Handle Incoming Signal
  useEffect(() => {
    if (!socket) return;

    const processPendingIceCandidates = async () => {
      if (peerConnection.current?.remoteDescription && pendingIceCandidates.current.length > 0) {
        for (const candidate of pendingIceCandidates.current) {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding delayed ice candidate', e);
          }
        }
        pendingIceCandidates.current = [];
      }
    };

    const handleSignal = async ({ from, signal }: { from: string; signal: any }) => {
      if (signal.type === 'offer') {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc_signal', { to: from, signal: answer });
        
        // Process any candidates that arrived before the offer was fully handled
        await processPendingIceCandidates();
      } else if (signal.type === 'answer') {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
          await processPendingIceCandidates();
        }
      } else if (signal.type === 'candidate') {
        if (peerConnection.current?.remoteDescription) {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        } else {
          // Queue candidate if remote description is not yet set
          pendingIceCandidates.current.push(signal.candidate);
        }
      }
    };

    socket.on('webrtc_signal', handleSignal);
    return () => {
      socket.off('webrtc_signal', handleSignal);
    };
  }, [socket, createPeerConnection]);

  // Handle Transition to Active
  useEffect(() => {
    if (status === 'active' && !isIncoming && receiver) {
      // Caller: create offer
      (async () => {
        const pc = createPeerConnection(receiver._id);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit('webrtc_signal', { to: receiver._id, signal: offer });
      })();
    }
  }, [status, isIncoming, receiver, socket, createPeerConnection]);

  // Mute/Camera Controls
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOff;
      });
    }
  }, [isCameraOff, localStream]);

  // Cleanup on end
  useEffect(() => {
    if (status === 'idle') {
      cleanup();
    }
  }, [status, cleanup]);

  return {
    localStream,
    remoteStream,
    startLocalStream,
    initiateOutgoingCall,
  };
}
