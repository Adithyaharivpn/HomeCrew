import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from './axiosConfig';
import { useAuth } from './useAuth';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/api/notifications/");
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error("Error fetching notifications", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            
            const userId = user._id || user.id;
            const socket = io(import.meta.env.VITE_API_BASE_URL);
            socket.emit("addUser", userId);

            socket.on("receiveNotification", (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            return () => socket.disconnect();
        }
    }, [user]);

    const markAsRead = async (notifId) => {
        try {
            await api.put(`/api/notifications/${notifId}/read`);
            setNotifications(prev => {
                const updated = prev.map(n => n._id === notifId ? { ...n, isRead: true } : n);
                setUnreadCount(updated.filter(n => !n.isRead).length);
                return updated;
            });
        } catch (err) {
            console.error("Error marking notification as read", err);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
        if (unreadIds.length === 0) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        try {
            await api.put('/api/notifications/mark-all-read');
        } catch (err) {
            console.error("Failed to mark all as read", err);
            fetchNotifications(); // Rollback if needed
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
