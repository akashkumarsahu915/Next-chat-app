import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { addToast } from '../store/slices/toastSlice';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MessageSquare, Mail, Lock, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useLoginMutation, useRegisterMutation } from '../store/rtk/apis/login.slice';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      try {
        const payload = await login({ email, password }).unwrap();
        dispatch(setCredentials(payload));
        dispatch(addToast({ 
          message: 'Successfully logged in! Welcome back.', 
          type: 'success' 
        }));
      } catch (err: any) {
        dispatch(addToast({ 
          message: err?.data?.message || 'Login failed. Please check your credentials.', 
          type: 'error' 
        }));
      }
    } else {
      try {
        await register({ username, email, password }).unwrap();
        dispatch(addToast({ 
          message: 'Account created! Please login to continue.', 
          type: 'success' 
        }));
        setIsLogin(true);
        setPassword('');
      } catch (err: any) {
        dispatch(addToast({ 
          message: err?.data?.message || 'Registration failed. Email or username might be taken.', 
          type: 'error' 
        }));
      }
    }
  };

  const isLoading = isLoginLoading || isRegisterLoading;

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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<UserIcon className="h-4 w-4" />} 
            />
          )}
          <Input 
            label="Email" 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />} 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />} 
          />
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
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
