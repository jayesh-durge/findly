import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://findly-bhws.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Items API
export const createItem = async (itemData: any) => {
  const response = await api.post('/items/create', itemData);
  return response.data;
};

export const getItemByQrId = async (qrId: string) => {
  const response = await api.get(`/items/${qrId}`);
  return response.data;
};

export const getUserItems = async (userId: string) => {
  const response = await api.get(`/items/user/${userId}`);
  return response.data;
};

export const updateItemStatus = async (itemId: string, isLost: boolean) => {
  const response = await api.patch(`/items/${itemId}/status`, null, {
    params: { is_lost: isLost }
  });
  return response.data;
};

export const deleteItem = async (itemId: string) => {
  const response = await api.delete(`/items/${itemId}`);
  return response.data;
};

// QR API
export const generateQR = async (qrData: any) => {
  const response = await api.post('/qr/generate', qrData);
  return response.data;
};

// Messages API
export const sendMessage = async (messageData: any) => {
  const response = await api.post('/messages/send', messageData);
  return response.data;
};

export const getUserMessages = async (userId: string) => {
  const response = await api.get(`/messages/user/${userId}`);
  return response.data;
};

export const getMessageThread = async (user1: string, user2: string, itemId: string) => {
  const response = await api.get(`/messages/thread/${user1}/${user2}/${itemId}`);
  return response.data;
};

export const deleteMessageThread = async (user1: string, user2: string, itemId: string) => {
  const response = await api.delete(`/messages/thread/${user1}/${user2}/${itemId}`);
  return response.data;
};

export const deleteGuestChat = async (itemId: string, senderName: string) => {
  const response = await api.delete(`/messages/guest/${itemId}/${senderName}`);
  return response.data;
};

export const markMessagesRead = async (user1: string, user2: string, itemId: string) => {
  const response = await api.put(`/messages/read/${user1}/${user2}/${itemId}`);
  return response.data;
};

// Rewards / Coins API
export const sendCoins = async (data: { sender_id: string; receiver_id: string; amount: number; message?: string }) => {
  const response = await api.post('/rewards/send', data);
  return response.data;
};

export const getRewardBalance = async (userId: string) => {
  const response = await api.get(`/rewards/balance/${userId}`);
  return response.data;
};

export const getTransactions = async (userId: string) => {
  const response = await api.get(`/rewards/transactions/${userId}`);
  return response.data;
};

export default api;
