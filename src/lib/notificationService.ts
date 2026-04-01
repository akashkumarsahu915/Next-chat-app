import { store } from "../store";
import { addNotification } from "../store/slices/notificationSlice";
import { AppNotification } from "../types";

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = "default";

  private constructor() {
    if (typeof window !== "undefined" && "Notification" in window) {
      this.permission = Notification.permission;
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      this.permission = "granted";
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === "granted";
  }

  public async notify(
    title: string,
    body: string,
    type: AppNotification["type"] = "system",
    link?: string,
  ) {
    const notification: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      timestamp: new Date().toISOString(),
      isRead: false,
      type,
      link,
    };

    // Add to Redux store
    store.dispatch(addNotification(notification));

    // Show browser notification if permitted
    if (
      this.permission === "granted" &&
      typeof window !== "undefined" &&
      "Notification" in window
    ) {
      // Try to use Service Worker for background notifications
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration) {
          registration.showNotification(title, {
            body,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            data: { url: link || "/" },
          });
          return;
        }
      }

      // Fallback to standard Notification
      const browserNotification = new Notification(title, {
        body,
        icon: "/favicon.ico",
      });

      browserNotification.onclick = () => {
        window.focus();
        if (link) {
          // Handle navigation if needed
        }
        browserNotification.close();
      };
    }
  }
}

export const notificationService = NotificationService.getInstance();
