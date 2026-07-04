import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  TextField, 
  Divider, 
  Avatar, 
  Chip,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { 
  Message as MessageIcon, 
  Inventory as InventoryIcon, 
  Person as PersonIcon,
  Info as InfoIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { getItemByQrId, sendMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ScanItem: React.FC = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Message Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setSenderName(user.full_name || user.user_metadata?.full_name || '');
      setSenderEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (qrId) {
      fetchItemDetails();
    }
  }, [qrId]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const data = await getItemByQrId(qrId!);
      setItem(data);
    } catch (err: any) {
      console.error(err);
      setError("Item not found or an error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setSending(true);
    setSuccess(false);
    setError(null);

    try {
      await sendMessage({
        item_id: item.qr_id,
        sender_id: user?.id || null,
        sender_name: senderName,
        sender_email: senderEmail,
        message_text: messageText,
        receiver_id: item.user_id
      });
      setSuccess(true);
      setMessageText('');
    } catch (err: any) {
      const serverError = err.response?.data?.detail || "Failed to send message. Please try again.";
      setError(serverError);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Retrieving item details...</Typography>
      </Box>
    );
  }

  if (error && !item) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        <Button component={Link} to="/" variant="contained">Return Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        {/* Item Info Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}
              >
                <InventoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{item.item_name}</Typography>
                <Chip 
                  label={item.is_lost ? "Reported Lost" : "Smart Tagged"} 
                  color={item.is_lost ? "error" : "success"}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon fontSize="small" color="primary" /> Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {item.description || "No description provided."}
            </Typography>

            {item.image_url && (
              <Box 
                component="img" 
                src={item.image_url} 
                alt={item.item_name}
                sx={{ width: '100%', borderRadius: 2, mt: 2, maxHeight: 200, objectFit: 'cover' }}
              />
            )}
          </Paper>
        </Grid>

        {/* Message Owner Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Found this item?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Send a secure message to the owner to help them recover it.
            </Typography>

            {success ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                Message sent successfully! The owner has been notified.
              </Alert>
            ) : user ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  You are logged in! You can start a direct one-to-one chat with the owner for a faster recovery.
                </Typography>
                <Button 
                  fullWidth
                  variant="contained" 
                  size="large"
                  onClick={() => navigate(`/chat/${item.user_id}/${item.qr_id}`)}
                  startIcon={<MessageIcon />}
                  sx={{ py: 2, borderRadius: 3, fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                  Start Secure Chat
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  A secure thread will be created in your Inbox.
                </Typography>
              </Box>
            ) : (
              <form onSubmit={handleSendMessage}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Your Email / Phone (Optional)"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    required
                    multiline
                    rows={4}
                    placeholder="Where did you find it? How can the owner contact you?"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={sending}
                    startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <MessageIcon />}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </Box>
              </form>
            )}
            
            {error && !success && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ScanItem;
