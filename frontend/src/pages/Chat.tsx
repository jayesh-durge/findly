import React, { useEffect, useState, useRef } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Chip,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as BackIcon,
  QrCode as QrCodeIcon,
  Coffee as CoffeeIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  getMessageThread, 
  sendMessage, 
  markMessagesRead, 
  sendCoins, 
  getRewardBalance 
} from '../services/api';

const Chat: React.FC = () => {
  const { userId, itemId } = useParams<{ userId: string; itemId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [rewardSuccess, setRewardSuccess] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (user && userId && itemId) {
      fetchThread();
      fetchBalance();
      const interval = setInterval(() => {
        fetchThread();
        fetchBalance();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user, userId, itemId]);

  const fetchBalance = async () => {
    try {
      const data = await getRewardBalance(user!.id);
      setUserCoins(data.coins || 0);
    } catch (e) {
      console.error("Error fetching balance:", e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchThread = async () => {
    try {
      const data = await getMessageThread(user!.id, userId!, itemId!);
      setMessages(data);

      if (data.length === 0 && !newMessage) {
        setNewMessage(`Hey, I found your item [${itemId}]. Let's coordinate the return!`);
      }

      const hasUnread = data.some((m: any) => m.receiver_id === user!.id && !m.is_read);
      if (hasUnread) {
        await markMessagesRead(user!.id, userId!, itemId!);
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage({
        item_id: itemId!,
        sender_id: user!.id,
        sender_name: user?.full_name || user?.email || 'Me',
        message_text: newMessage,
        receiver_id: userId!,
      });
      setNewMessage('');
      fetchThread();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  const handleSendCoins = async () => {
    if (!rewardAmount || rewardLoading) return;
    
    setRewardLoading(true);
    setRewardError(null);
    setRewardSuccess(false);
    
    try {
      await sendCoins({
        sender_id: user!.id,
        receiver_id: userId!,
        amount: rewardAmount,
        message: `Awarded ${rewardAmount} coins for helping with item ${itemId}! ☕`
      });

      // Also send a formal chat message so it's visible in the thread
      await sendMessage({
        item_id: itemId!,
        sender_id: user!.id,
        sender_name: user?.full_name || user?.email || 'Me',
        message_text: `✨ I just sent you ${rewardAmount} Reward Coins as a thank you! ☕ Check your Rewards page to see your balance.`,
        receiver_id: userId!,
      });
      
      setRewardSuccess(true);
      setRewardAmount(null);
      fetchThread(); // Refresh messages to show the reward notification
      fetchBalance();
      
      // Auto close after 3s
      setTimeout(() => {
        setShowRewards(false);
        setRewardSuccess(false);
      }, 3000);
    } catch (err: any) {
      setRewardError(err.response?.data?.detail || "Failed to send coins.");
    } finally {
      setRewardLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 80px)' }}>
        <CircularProgress sx={{ color: '#3f80ff' }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      height: 'calc(100vh - 72px)',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0a0c10',
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: { xs: 2, sm: 3 },
        py: 1.5,
        bgcolor: 'rgba(22,27,34,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}>
        <IconButton
          onClick={() => navigate('/messages')}
          sx={{ color: '#8b949e', '&:hover': { color: '#f0f6fc', bgcolor: 'rgba(255,255,255,0.06)' }, borderRadius: 2 }}
        >
          <BackIcon />
        </IconButton>

        <Avatar
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`}
          sx={{ width: 40, height: 40, border: '2px solid rgba(63,128,255,0.4)' }}
        />

        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 700, color: '#f0f6fc', fontSize: '0.95rem' }}>
            Chat Thread
          </Typography>
          <Typography sx={{ color: '#8b949e', fontSize: '0.75rem' }}>
            Secure one-to-one channel
          </Typography>
        </Box>

        <Chip
          icon={<QrCodeIcon sx={{ fontSize: '14px !important', color: '#3f80ff !important' }} />}
          label={itemId}
          size="small"
          sx={{
            bgcolor: 'rgba(63,128,255,0.1)',
            color: '#3f80ff',
            border: '1px solid rgba(63,128,255,0.2)',
            fontFamily: 'monospace',
            fontSize: '0.7rem',
          }}
        />

        <Button
          startIcon={<CoffeeIcon />}
          size="small"
          onClick={() => setShowRewards(!showRewards)}
          sx={{
            ml: 1,
            bgcolor: showRewards ? '#ffd700' : 'rgba(255,215,0,0.1)',
            color: showRewards ? '#000' : '#ffd700',
            fontWeight: 700,
            borderRadius: 2,
            fontSize: '0.75rem',
            '&:hover': { bgcolor: showRewards ? '#ffc400' : 'rgba(255,215,0,0.2)' }
          }}
        >
          Reward
        </Button>
      </Box>

      {/* Rewards Panel */}
      <Collapse in={showRewards}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'rgba(255,215,0,0.05)', 
          borderBottom: '1px solid rgba(255,215,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography sx={{ color: '#ffd700', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CoffeeIcon fontSize="small" /> Buy them a coffee
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[5, 10, 25, 50].map(amount => (
              <Button
                key={amount}
                variant="outlined"
                size="small"
                onClick={() => setRewardAmount(amount)}
                disabled={amount > userCoins}
                sx={{
                  borderRadius: 2,
                  borderColor: rewardAmount === amount ? '#ffd700' : 'rgba(255,215,0,0.3)',
                  color: rewardAmount === amount ? '#000' : '#ffd700',
                  bgcolor: rewardAmount === amount ? '#ffd700' : 'transparent',
                  fontWeight: 700,
                  '&:hover': { borderColor: '#ffd700' }
                }}
              >
                {amount} ☕
              </Button>
            ))}
          </Box>

          <Collapse in={!!rewardError}>
            <Alert severity="error" sx={{ bgcolor: 'transparent', color: '#ff6b6b' }}>{rewardError}</Alert>
          </Collapse>

          <Collapse in={rewardSuccess}>
            <Alert severity="success" sx={{ bgcolor: 'transparent', color: '#34d399' }}>Coins sent! Thank you for your generosity! ✨</Alert>
          </Collapse>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ color: '#8b949e' }}>
              Your Balance: <Box component="span" sx={{ color: '#ffd700', fontWeight: 700 }}>{userCoins} coins</Box>
            </Typography>
            <Button
              variant="contained"
              size="small"
              disabled={!rewardAmount || rewardLoading}
              onClick={handleSendCoins}
              sx={{
                bgcolor: '#ffd700',
                color: '#000',
                borderRadius: 2,
                fontWeight: 800,
                '&:hover': { bgcolor: '#ffc400' }
              }}
            >
              {rewardLoading ? <CircularProgress size={16} color="inherit" /> : 'Send Gratitude'}
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* Messages Area */}
      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        px: { xs: 2, sm: 4 },
        py: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        '&::-webkit-scrollbar': { width: 5 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4 },
      }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Box sx={{
              display: 'inline-flex', p: 2.5, borderRadius: '50%',
              background: 'rgba(63,128,255,0.1)', mb: 2,
            }}>
              <SendIcon sx={{ fontSize: 32, color: '#3f80ff' }} />
            </Box>
            <Typography sx={{ color: '#8b949e', fontWeight: 600 }}>No messages yet</Typography>
            <Typography sx={{ color: '#8b949e', fontSize: '0.8rem' }}>Send the first message below</Typography>
          </Box>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <Box
              key={msg.id}
              sx={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: { xs: '85%', sm: '65%' },
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                gap: 1.5,
                alignItems: 'flex-end',
              }}
            >
              <Avatar
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id || msg.sender_name}`}
                sx={{ width: 28, height: 28, flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}
              />
              <Box>
                {!isMe && (
                  <Typography sx={{ color: '#8b949e', fontSize: '0.72rem', mb: 0.5, px: 0.5, fontWeight: 600 }}>
                    {msg.sender_name}
                  </Typography>
                )}
                <Box sx={{
                  p: '10px 16px',
                  background: isMe
                    ? 'linear-gradient(135deg, #3f80ff 0%, #7c4dff 100%)'
                    : 'rgba(30,37,47,0.95)',
                  color: isMe ? '#fff' : '#e6edf3',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: isMe
                    ? '0 4px 16px rgba(63,128,255,0.25)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                  <Typography sx={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {msg.message_text}
                  </Typography>
                </Box>
                <Typography sx={{
                  color: '#8b949e', fontSize: '0.68rem', mt: 0.5,
                  textAlign: isMe ? 'right' : 'left', px: 0.5,
                }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Bar */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          display: 'flex',
          gap: 1.5,
          px: { xs: 2, sm: 4 },
          py: 2,
          bgcolor: 'rgba(22,27,34,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          alignItems: 'flex-end',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message... (Enter to send)"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: 3,
              color: '#f0f6fc',
              fontSize: '0.9rem',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(63,128,255,0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#3f80ff', borderWidth: 1.5 },
            },
            '& .MuiInputBase-input::placeholder': { color: '#8b949e', opacity: 1 },
          }}
        />
        <IconButton
          type="submit"
          disabled={!newMessage.trim() || sending}
          sx={{
            width: 44, height: 44, flexShrink: 0,
            background: newMessage.trim() ? 'linear-gradient(135deg, #3f80ff 0%, #7c4dff 100%)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            borderRadius: 3,
            transition: 'all 0.2s',
            '&:hover': { transform: 'scale(1.05)', boxShadow: '0 4px 16px rgba(63,128,255,0.4)' },
            '&:disabled': { opacity: 0.4, background: 'rgba(255,255,255,0.05)' },
          }}
        >
          {sending ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon sx={{ fontSize: 20 }} />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
