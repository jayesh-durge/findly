import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Box, 
  Avatar, 
  Paper, 
  IconButton, 
  Chip, 
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  useTheme,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  QrCode as QrCodeIcon, 
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  CheckCircle as SafeIcon,
  Error as LostIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { getUserItems, updateItemStatus, deleteItem, generateQR } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getUserItems(user!.id);
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedItem) return;
    try {
      const newStatus = !selectedItem.is_lost;
      await updateItemStatus(selectedItem.id, newStatus);
      handleMenuClose();
      fetchItems(); 
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    if (window.confirm(`Are you sure you want to delete "${selectedItem.item_name}"?`)) {
      try {
        await deleteItem(selectedItem.id);
        handleMenuClose();
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleDownloadQR = async () => {
    if (!selectedItem) return;
    try {
      const response = await generateQR({
        item_id: selectedItem.id,
        qr_id: selectedItem.qr_id
      });
      const link = document.createElement('a');
      link.href = response.qr_image;
      link.download = `findly-qr-${selectedItem.item_name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleMenuClose();
    } catch (error) {
      console.error('Error generating QR for download:', error);
      alert('Failed to generate QR code for download.');
    }
  };

  const stats = [
    { label: 'Total Items', value: items.length, icon: <QrCodeIcon />, color: theme.palette.primary.main },
    { label: 'Currently Lost', value: items.filter(i => i.is_lost).length, icon: <LostIcon />, color: theme.palette.error.main },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.03em' }}>
            Hello, {user?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'User'}!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Here is a snapshot of your protected items.
          </Typography>
        </Box>
        <Button 
          component={Link} 
          to="/create-item" 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ height: 48, px: 3 }}
        >
          Register New Tag
        </Button>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((s, i) => (
          <Grid key={i} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: alpha(s.color, 0.1), color: s.color, borderRadius: 2 }}>
                {s.icon}
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  {s.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{s.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Main Content: Items List */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>My Protected Items</Typography>
            <Button size="small" onClick={fetchItems} sx={{ color: 'text.secondary' }}>Refresh</Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={32} />
            </Box>
          ) : items.length > 0 ? (
            <Stack spacing={2}>
              {items.map((item) => (
                <Paper 
                  key={item.id}
                  sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    display: 'flex', 
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    border: '1px solid transparent',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.1)',
                      bgcolor: 'rgba(255,255,255,0.02)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: item.is_lost ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                      color: item.is_lost ? 'error.main' : 'success.main',
                      borderRadius: 2,
                      width: 50,
                      height: 50,
                      mr: 2
                    }}
                  >
                    <QrCodeIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.item_name}</Typography>
                    <Typography variant="caption" color="text.secondary">Tag ID: {item.qr_id.toUpperCase()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={item.is_lost ? "LOST" : "SAFE"} 
                      color={item.is_lost ? "error" : "success"}
                      size="small"
                      sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
                    />
                    <IconButton onClick={(e) => handleMenuOpen(e, item)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 6, border: '2px dashed rgba(255,255,255,0.05)', bgcolor: 'transparent' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>No items registered</Typography>
              <Button component={Link} to="/create-item" variant="outlined" size="small">Get your first QR tag</Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Item Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: { borderRadius: 3, width: 220, mt: 1, p: 0.5, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }
          }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleToggleStatus} sx={{ borderRadius: 1.5 }}>
          <ListItemIcon>
            {selectedItem?.is_lost ? <SafeIcon fontSize="small" color="success" /> : <LostIcon fontSize="small" color="error" />}
          </ListItemIcon>
          <ListItemText>
             <Typography sx={{ fontWeight: 600 }}>{selectedItem?.is_lost ? 'Mark as Safe' : 'Mark as Lost'}</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownloadQR} sx={{ borderRadius: 1.5 }}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontWeight: 600 }}>Download QR</Typography>
          </ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleDeleteItem} sx={{ borderRadius: 1.5, color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontWeight: 600 }}>Delete Item</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Dashboard;
