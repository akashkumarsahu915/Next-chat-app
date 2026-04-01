import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleTheme, updateNotificationSettings } from '../store/slices/uiSlice';
import { logout, updateUser } from '../store/slices/authSlice';
import { addToast } from '../store/slices/toastSlice';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Avatar } from '../components/ui/Avatar';
import { User, Bell, Shield, Moon, Sun, Camera, Save, LogOut, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import { cn } from '../lib/utils';
import { notificationService } from '../lib/notificationService';

export function SettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, notificationSettings } = useSelector((state: RootState) => state.ui);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [copied, setCopied] = useState(false);

  const handleToggleNotification = (key: keyof typeof notificationSettings) => {
    dispatch(updateNotificationSettings({ [key]: !notificationSettings[key] }));
  };

  const handleTogglePush = () => {
    const newValue = !notificationSettings.pushEnabled;
    dispatch(updateNotificationSettings({
      pushEnabled: newValue,
      newMessages: newValue,
      friendRequests: newValue,
      systemAlerts: newValue,
    }));
  };

  const handleCopyId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      dispatch(addToast({ message: 'User ID copied to clipboard!', type: 'success' }));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleBrowserNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermission();
      dispatch(updateNotificationSettings({ browserNotifications: granted }));
      if (granted) {
        dispatch(addToast({ message: 'Browser notifications enabled!', type: 'success' }));
        notificationService.notify('Notifications Enabled', 'You will now receive system notifications.', 'system');
      } else {
        dispatch(addToast({ message: 'Notification permission denied', type: 'error' }));
      }
    } else {
      dispatch(updateNotificationSettings({ browserNotifications: false }));
      dispatch(addToast({ message: 'Browser notifications disabled in app (Note: You may need to reset browser settings to fully disable)', type: 'info' }));
    }
  };

  const handleSaveProfile = () => {
    dispatch(updateUser({ username, bio }));
    dispatch(addToast({ message: 'Profile updated successfully!', type: 'success' }));
    
    notificationService.notify(
      'Profile Updated',
      'Your profile information has been saved successfully.',
      'system'
    );
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateUser({ profilePicture: reader.result as string }));
        dispatch(addToast({ message: 'Profile picture updated successfully!', type: 'success' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast({ message: 'Logged out successfully', type: 'info' }));
  };

  const avatarOptions = [
    'Felix', 'Aneka', 'Max', 'Luna', 'Oliver', 'Milo', 'Leo', 'Bella', 'Charlie', 'Lucy'
  ];

  const handleSelectAvatar = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    dispatch(updateUser({ profilePicture: url }));
    dispatch(addToast({ message: `Avatar updated to ${seed}!`, type: 'success' }));
  };

  return (
    <>
      <MobileHeader title="Settings" />
      <div className="flex-1 overflow-y-auto bg-background p-6 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2 hidden sm:block">Settings</h1>
          <p className="text-muted-foreground mb-8 hidden sm:block">Customize your NexChat experience</p>

          <div className="space-y-6">
            {/* Profile Section */}
            <section className="bg-card p-6 rounded-3xl shadow-sm border border-border">
              <h3 className="text-lg font-semibold mb-6 flex items-center text-foreground">
                <User className="h-5 w-5 mr-2 text-primary" />
                Profile Settings
              </h3>
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <Avatar name={user?.username || ''} src={user?.profilePicture} size="xl" />
                  <button 
                    onClick={handleAvatarClick}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Click to upload or choose below</p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">Choose an Avatar</p>
                <div className="grid grid-cols-5 gap-3">
                  {avatarOptions.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => handleSelectAvatar(seed)}
                      className={cn(
                        "relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95",
                        user?.profilePicture?.includes(`seed=${seed}`) 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                        alt={seed}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Unique User ID</p>
                      <p className="text-lg font-mono font-bold text-foreground tracking-widest">#{user?.uid || '000000'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyId}
                      className="h-10 w-10 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">This ID is unique to you and cannot be changed.</p>
                </div>

                <Input 
                  label="Username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
                <Input 
                  label="Bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Tell us about yourself" 
                />
              </div>
            </section>

            {/* Appearance Section */}
            <section className="bg-card p-6 rounded-3xl shadow-sm border border-border">
              <h3 className="text-lg font-semibold mb-6 flex items-center text-foreground">
                {theme === 'dark' ? <Moon className="h-5 w-5 mr-2 text-primary" /> : <Sun className="h-5 w-5 mr-2 text-amber-500" />}
                Appearance
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Toggle checked={theme === 'dark'} onChange={() => dispatch(toggleTheme())} />
              </div>
            </section>

            {/* Privacy Section */}
            <section className="bg-card p-6 rounded-3xl shadow-sm border border-border">
              <h3 className="text-lg font-semibold mb-6 flex items-center text-foreground">
                <Shield className="h-5 w-5 mr-2 text-emerald-500" />
                Privacy & Security
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Private Profile</p>
                    <p className="text-sm text-muted-foreground">Only friends can see your full profile</p>
                  </div>
                  <Toggle checked={isPrivate} onChange={setIsPrivate} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Read Receipts</p>
                    <p className="text-sm text-muted-foreground">Show others when you've read their messages</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="bg-card p-6 rounded-3xl shadow-sm border border-border">
              <h3 className="text-lg font-semibold mb-6 flex items-center text-foreground">
                <Bell className="h-5 w-5 mr-2 text-amber-500" />
                Notifications
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
                  </div>
                  <Toggle checked={notificationSettings.pushEnabled} onChange={handleTogglePush} />
                </div>

                {notificationSettings.pushEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pl-4 border-l-2 border-border space-y-4 mt-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">New Messages</p>
                        <p className="text-xs text-muted-foreground">Get notified when someone sends you a message</p>
                      </div>
                      <Toggle 
                        checked={notificationSettings.newMessages} 
                        onChange={() => handleToggleNotification('newMessages')} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Friend Requests</p>
                        <p className="text-xs text-muted-foreground">Get notified when you receive a friend request</p>
                      </div>
                      <Toggle 
                        checked={notificationSettings.friendRequests} 
                        onChange={() => handleToggleNotification('friendRequests')} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">System Alerts</p>
                        <p className="text-xs text-muted-foreground">Important updates about your account and NexChat</p>
                      </div>
                      <Toggle 
                        checked={notificationSettings.systemAlerts} 
                        onChange={() => handleToggleNotification('systemAlerts')} 
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Browser Notifications</p>
                    <p className="text-sm text-muted-foreground">Show native system notifications</p>
                  </div>
                  <Toggle checked={notificationSettings.browserNotifications} onChange={() => handleToggleNotification('browserNotifications')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Alerts</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Toggle checked={notificationSettings.emailAlerts} onChange={() => handleToggleNotification('emailAlerts')} />
                </div>
              </div>
            </section>

            {/* Account Management */}
            <section className="bg-card p-6 rounded-3xl shadow-sm border border-border">
              <h3 className="text-lg font-semibold mb-6 flex items-center text-foreground">
                <LogOut className="h-5 w-5 mr-2 text-red-500" />
                Account Management
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Logout</p>
                  <p className="text-sm text-muted-foreground">Sign out of your account</p>
                </div>
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <Button 
                className="rounded-2xl px-8 h-12"
                onClick={() => {
                  dispatch(updateUser({ isPrivate }));
                  handleSaveProfile();
                }}
              >
                <Save className="h-5 w-5 mr-2" />
                Save All Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
