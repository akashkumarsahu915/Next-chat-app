import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Image as ImageIcon, Paperclip } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { setTyping } from '../../store/slices/chatSlice';
import { RootState } from '../../store';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'image') => void;
  className?: string;
}

export function MessageInput({ onSendMessage, className }: MessageInputProps) {
  const dispatch = useDispatch();
  const { selectedChatId } = useSelector((state: RootState) => state.chat);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, 'text');
      setMessage('');
      if (selectedChatId) {
        dispatch(setTyping({ chatId: selectedChatId, isTyping: false }));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (!selectedChatId) return;

    // Dispatch typing true
    dispatch(setTyping({ chatId: selectedChatId, isTyping: true }));

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to dispatch typing false after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      dispatch(setTyping({ chatId: selectedChatId, isTyping: false }));
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('flex items-end space-x-2 p-4 bg-card border-t border-border', className)}>
      <div className="flex space-x-1 mb-1">
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
          <Smile className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-muted-foreground hover:text-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Mock image upload
              onSendMessage(URL.createObjectURL(file), 'image');
            }
          }}
        />
      </div>
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="w-full max-h-32 min-h-[44px] resize-none rounded-2xl border border-input bg-muted px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground"
          rows={1}
        />
      </div>
      <Button 
        onClick={handleSend} 
        disabled={!message.trim()} 
        className="rounded-full h-11 w-11 p-0 flex items-center justify-center shadow-primary/20 shadow-lg"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
