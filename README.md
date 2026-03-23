# NexChat

NexChat is a modern, responsive, and feature-rich real-time messaging application built with React, Redux Toolkit, and Tailwind CSS. It offers a seamless communication experience with a focus on privacy, customization, and user discovery.

## 🚀 Features

- **Real-time Messaging**: Instant chat interface with message status (sent/read), typing indicators, and image support.
- **User Discovery**: Explore page to find new people based on interests and mutual connections.
- **Friend System**: Manage incoming and outgoing friend requests with real-time notifications.
- **Unique User IDs**: Every user is assigned a unique 6-digit ID for easy identification and sharing.
- **Customizable Profiles**: Personalize your profile with avatars (via DiceBear), bios, and privacy settings.
- **Granular Notifications**: Control exactly what you get notified about (New Messages, Friend Requests, System Alerts).
- **Dark Mode**: Full support for light and dark themes with a sleek, modern UI.
- **Responsive Design**: Optimized for both desktop and mobile devices with a dedicated mobile header and navigation.
- **Security & Privacy**: Toggle between public and private profiles to control who can see your information.

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Animations**: Motion (framer-motion)
- **Icons**: Lucide React
- **Avatars**: DiceBear API

## 📂 Project Structure

```text
src/
├── components/        # Reusable UI and feature components
│   ├── chat/          # Chat-specific components (bubbles, input, header)
│   ├── layout/        # App layout, sidebar, and headers
│   └── ui/            # Base UI primitives (Button, Input, Toggle, etc.)
├── lib/               # Utilities and services (Notification service)
├── pages/             # Main application views (Dashboard, Explore, Settings, etc.)
├── store/             # Redux store configuration and slices
│   └── slices/        # Individual state slices (auth, chat, friends, etc.)
├── types/             # TypeScript interfaces and types
└── App.tsx            # Root application component
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nexchat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📱 Mobile Experience

NexChat is designed with a mobile-first approach. On smaller screens, the sidebar collapses into a bottom navigation bar, and headers are optimized for touch interaction, ensuring a native-app feel in the browser.

## 🔒 Privacy

We take privacy seriously. Users can toggle their profile to "Private" in the settings, which restricts their full profile visibility to confirmed friends only.

## 📄 License

This project is licensed under the MIT License.
