import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  alpha,
  Badge
} from '@mui/material';
import { 
  QrCode as QrCodeIcon, 
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Apps as AppsIcon,
  Coffee as CoffeeIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserMessages, getRewardBalance } from '../services/api';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [coins, setCoins] = React.useState<number>(0);

  // Poll for unread messages
  React.useEffect(() => {
    if (!user) return;
    
    const checkUnread = async () => {
      try {
        const messages = await getUserMessages(user.id);
        const count = messages.filter((m: any) => m.receiver_id === user.id && !m.is_read).length;
        setUnreadCount(count);
        
        const bal = await getRewardBalance(user.id);
        setCoins(bal.coins || 0);
      } catch (err) {
        console.error("Failed to fetch notification data", err);
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, [user]);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await signOut();
    navigate('/login');
  };

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  if (isAuthPage && !user) return null;

  const NavButton = ({ to, icon, label, badge }: any) => {
    const active = location.pathname === to;
    return (
      <Button
        component={Link}
        to={to}
        startIcon={badge ? <Badge color="error" variant="dot" overlap="circular">{icon}</Badge> : icon}
        sx={{ 
          color: active ? 'primary.main' : 'text.secondary', 
          textTransform: 'none',
          fontWeight: active ? 700 : 500,
          bgcolor: active ? alpha('#3f80ff', 0.08) : 'transparent',
          '&:hover': { bgcolor: alpha('#3f80ff', 0.05) },
          borderRadius: 2,
          px: 2,
          mr: 1
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 72 }}>
          {/* Logo Section - Now flexible to push items to the right */}
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none', 
              mr: 4,
              flexGrow: 1 // This pushes everything else to the right
            }}
          >
            <Box sx={{ 
              background: 'linear-gradient(135deg, #3f80ff 0%, #7c4dff 100%)', 
              p: 0.8, 
              borderRadius: 2, 
              display: 'flex',
              mr: 1.5,
              boxShadow: '0 4px 12px rgba(63, 128, 255, 0.4)'
            }}>
              <QrCodeIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'text.primary',
                fontSize: '1.4rem'
              }}
            >
              FINDLY
            </Typography>
          </Box>

          {/* User & Navigation Section - Combined on the right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user && (
              <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
                <NavButton to="/dashboard" icon={<DashboardIcon sx={{ fontSize: 20 }} />} label="Dashboard" />
                <NavButton 
                  to="/messages" 
                  icon={<AppsIcon sx={{ fontSize: 20 }} />} 
                  label="Inbox" 
                  badge={unreadCount > 0} 
                />
              </Box>
            )}

            {!user ? (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button component={Link} to="/login" sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}>Login</Button>
                <Button component={Link} to="/signup" variant="contained" sx={{ borderRadius: 2 }}>Sign Up</Button>
              </Box>
            ) : (
              <>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    px: 2, 
                    py: 0.8, 
                    borderRadius: 3, 
                    bgcolor: alpha('#ffd700', 0.1),
                    border: '1px solid',
                    borderColor: alpha('#ffd700', 0.2),
                    transition: 'all 0.2s',
                  }}
                >
                  <CoffeeIcon sx={{ color: '#ffd700', fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 800, color: '#ffd700', fontSize: '0.9rem' }}>
                    {coins}
                  </Typography>
                </Box>
                <Tooltip title="Account">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, border: '2px solid', borderColor: alpha('#3f80ff', 0.5) }}>
                    <Avatar 
                      alt={user.full_name || 'User'} 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                      sx={{ width: 34, height: 34 }} 
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{
                    paper: {
                      sx: { borderRadius: 3, width: 220, mt: 1, p: 0.5, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
                      {user.full_name || 'My Account'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }} sx={{ borderRadius: 1.5 }}>
                    <PersonIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} /> Profile
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/rewards'); }} sx={{ borderRadius: 1.5 }}>
                    <CoffeeIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} /> Rewards
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ borderRadius: 1.5, color: 'error.main' }}>
                    <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
