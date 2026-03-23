import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import { addToast } from '../store/slices/toastSlice';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MessageSquare, Mail, Lock, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock user login
    const uid = Math.floor(100000 + Math.random() * 900000).toString();
    dispatch(setUser({
      id: '1',
      uid,
      username: 'Alex Rivera',
      email: 'alex@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      isOnline: true,
      isPrivate: false,
      bio: 'Chatting on NexChat!',
      status: 'Available'
    }));
    dispatch(addToast({ 
      message: isLogin ? 'Successfully logged in! Welcome back.' : 'Account created! Welcome to NexChat.', 
      type: 'success' 
    }));
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">NexChat</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isLogin ? 'Welcome back! Please login.' : 'Create an account to start chatting.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <Input 
              label="Username" 
              placeholder="Enter your username" 
              icon={<UserIcon className="h-4 w-4" />} 
            />
          )}
          <Input 
            label="Email" 
            type="email" 
            placeholder="Enter your email" 
            icon={<Mail className="h-4 w-4" />} 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter your password" 
            icon={<Lock className="h-4 w-4" />} 
          />
          
          <Button type="submit" className="w-full h-12 text-base mt-2">
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-semibold hover:underline dark:text-indigo-400"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
