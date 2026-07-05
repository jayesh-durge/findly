import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  Divider, 
  List, 
  ListItem, 
  ListItemAvatar,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Message as MessageIcon, 
  CalendarMonth as DateIcon,
  Person as PersonIcon,
  DeleteSweep as SpamIcon,
  CheckCircle as ValidIcon,
  Lock as LockIcon,
  DeleteOutlined as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getUserMessages, deleteMessageThread, deleteGuestChat } from '../services/api';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getUserMessages(user!.id);
      setMessages(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (msg: any) => {
    if (msg.sender_id) {
      navigate(`/chat/${msg.sender_id}/${msg.item_id}`);
    } else {
      alert("This person is not on the platform. You can only contact them via the email/phone they provided (if any).");
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, msg: any) => {
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this whole chat? This action cannot be undone.")) {
      return;
    }

    try {
      if (msg.sender_id) {
        await deleteMessageThread(user!.id, msg.sender_id, msg.item_id);
      } else {
        await deleteGuestChat(msg.item_id, msg.sender_name);
      }
      fetchMessages();
    } catch (err) {
      console.error(err);
      alert("Failed to delete chat.");
    }
  };

  // Group messages by conversation (sender + item)
  const groupMessages = (msgList: any[]) => {
    const groups: { [key: string]: any } = {};
    
    msgList.forEach(msg => {
      const conversationKey = `${msg.sender_id || msg.sender_email || msg.sender_name}_${msg.item_id}`;
      
      if (!groups[conversationKey] || new Date(msg.created_at) > new Date(groups[conversationKey].created_at)) {
        groups[conversationKey] = msg;
      }
    });

    return Object.values(groups).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const activeMessages = groupMessages(messages.filter(msg => msg.items?.is_lost === true));
  const spamMessages = groupMessages(messages.filter(msg => msg.items?.is_lost !== true));

  const currentMessages = tabValue === 0 ? activeMessages : spamMessages;

  const renderMessageList = (msgList: any[]) => {
    if (msgList.length === 0) {
      return (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.01)', border: '1px dashed', borderColor: 'divider' }}>
          {tabValue === 0 ? <MessageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} /> : <SpamIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />}
          <Typography variant="h6" color="text.secondary">
            {tabValue === 0 ? "No active conversations" : "No conversations in spam"}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {tabValue === 0 ? "When someone finds a lost item, your chats appear here." : "Conversations for items marked as 'Safe' are moved here automatically."}
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <List sx={{ p: 0 }}>
          {msgList.map((msg, index) => (
            <React.Fragment key={msg.id}>
              <ListItem
                alignItems="flex-start"
                onClick={() => handleMessageClick(msg)}
                sx={{
                  p: { xs: 2, sm: 3 },
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' },
                  transition: 'background 0.2s',
                  position: 'relative'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: tabValue === 0 ? 'primary.main' : 'text.disabled', width: 36, height: 36 }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                </ListItemAvatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5, gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }} noWrap>
                        {msg.sender_name}
                      </Typography>
                      {msg.sender_id && (
                        <Chip label="Verified" size="small" color="success" variant="filled" sx={{ height: 18, fontSize: '10px' }} />
                      )}
                      {!msg.sender_id && (
                        <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <Chip
                        label={msg.items?.item_name || 'Item'}
                        size="small"
                        variant="outlined"
                        color={tabValue === 0 ? 'primary' : 'default'}
                        sx={{ maxWidth: { xs: 80, sm: 140 }, fontSize: '0.7rem' }}
                      />
                      <Tooltip title="Delete Chat">
                        <IconButton size="small" color="error" onClick={(e) => handleDeleteChat(e, msg)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    noWrap
                    sx={{ display: 'block', mb: 1, fontWeight: 500 }}
                  >
                    {msg.message_text}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DateIcon sx={{ fontSize: 14 }} /> {new Date(msg.created_at).toLocaleDateString()}
                    </Typography>
                    {msg.sender_id && (
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                        Open Chat
                      </Typography>
                    )}
                  </Box>
                </Box>
              </ListItem>
              {index < msgList.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.5rem' } }} color="primary" gutterBottom>
          Inbox
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your communications with finders.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} aria-label="message tabs" variant="fullWidth">
          <Tab
            icon={<ValidIcon />}
            iconPosition="start"
            label={`Active (${activeMessages.length})`}
            sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, minHeight: 48 }}
          />
          <Tab
            icon={<SpamIcon />}
            iconPosition="start"
            label={`Safe Items (${spamMessages.length})`}
            sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' }, minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : renderMessageList(currentMessages)}
    </Container>
  );
};

export default Messages;
