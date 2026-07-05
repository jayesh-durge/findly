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
  Badge,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Apps as AppsIcon,
  Coffee as CoffeeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserMessages, getRewardBalance } from '../services/api';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [coins, setCoins] = React.useState<number>(0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

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
        console.error('Failed to fetch notification data', err);
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = async () => {
    handleCloseUserMenu();
    setDrawerOpen(false);
    await signOut();
    navigate('/login');
  };

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  if (isAuthPage && !user) return null;

  const isActive = (path: string) => location.pathname === path;

  // Mobile drawer content
  const MobileDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            bgcolor: '#0d1117',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            pt: 1,
          }
        }
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ background: 'linear-gradient(135deg, #3f80ff 0%, #7c4dff 100%)', p: 0.6, borderRadius: 1.5, display: 'flex' }}>
            <QrCodeIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem' }}>FINDLY</Typography>
        </Box>
        <IconButton onClick={() => setDrawerOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User info in drawer */}
      {user && (
        <Box sx={{ px: 2, py: 2, mx: 2, mb: 2, borderRadius: 3, bgcolor: 'rgba(63,128,255,0.06)', border: '1px solid rgba(63,128,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              alt={user.full_name || 'User'}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
              sx={{ width: 40, height: 40, border: '2px solid rgba(63,128,255,0.4)' }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }} noWrap>{user.full_name || 'My Account'}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{user.email}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1.5 }}>
            <CoffeeIcon sx={{ color: '#ffd700', fontSize: 16 }} />
            <Typography sx={{ fontWeight: 800, color: '#ffd700', fontSize: '0.85rem' }}>{coins} coins</Typography>
          </Box>
        </Box>
      )}

      <Divider sx={{ mx: 2, mb: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Nav links */}
      <List sx={{ px: 1.5 }}>
        {user ? (
          <>
            <ListItemButton
              component={Link}
              to="/dashboard"
              onClick={() => setDrawerOpen(false)}
              selected={isActive('/dashboard')}
              sx={{ borderRadius: 2, mb: 0.5, '&.Mui-selected': { bgcolor: alpha('#3f80ff', 0.1), color: 'primary.main' } }}
            >
              <ListItemIcon><DashboardIcon sx={{ color: isActive('/dashboard') ? 'primary.main' : 'text.secondary' }} /></ListItemIcon>
              <ListItemText primary="Dashboard" slotProps={{ primary: { style: { fontWeight: 600 } } }} />
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/messages"
              onClick={() => setDrawerOpen(false)}
              selected={isActive('/messages')}
              sx={{ borderRadius: 2, mb: 0.5, '&.Mui-selected': { bgcolor: alpha('#3f80ff', 0.1), color: 'primary.main' } }}
            >
              <ListItemIcon>
                <Badge color="error" variant="dot" invisible={unreadCount === 0}>
                  <AppsIcon sx={{ color: isActive('/messages') ? 'primary.main' : 'text.secondary' }} />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Inbox" slotProps={{ primary: { style: { fontWeight: 600 } } }} />
              {unreadCount > 0 && (
                <Box sx={{ bgcolor: 'error.main', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                  {unreadCount}
                </Box>
              )}
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/rewards"
              onClick={() => setDrawerOpen(false)}
              selected={isActive('/rewards')}
              sx={{ borderRadius: 2, mb: 0.5, '&.Mui-selected': { bgcolor: alpha('#3f80ff', 0.1), color: 'primary.main' } }}
            >
              <ListItemIcon><CoffeeIcon sx={{ color: isActive('/rewards') ? 'primary.main' : 'text.secondary' }} /></ListItemIcon>
              <ListItemText primary="Rewards" slotProps={{ primary: { style: { fontWeight: 600 } } }} />
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/create-item"
              onClick={() => setDrawerOpen(false)}
              selected={isActive('/create-item')}
              sx={{ borderRadius: 2, mb: 0.5, bgcolor: alpha('#3f80ff', 0.08), '&:hover': { bgcolor: alpha('#3f80ff', 0.12) } }}
            >
              <ListItemIcon><AddIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
              <ListItemText primary="Register New Tag" slotProps={{ primary: { style: { fontWeight: 700, color: 'inherit' } } }} />
            </ListItemButton>

            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

            <ListItemButton
              component={Link}
              to="/profile"
              onClick={() => setDrawerOpen(false)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon><PersonIcon sx={{ color: 'text.secondary' }} /></ListItemIcon>
              <ListItemText primary="Profile" slotProps={{ primary: { style: { fontWeight: 600 } } }} />
            </ListItemButton>

            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
              <ListItemIcon><LogoutIcon sx={{ color: 'error.main' }} /></ListItemIcon>
              <ListItemText primary="Logout" slotProps={{ primary: { style: { fontWeight: 600, color: 'inherit' } } }} />
            </ListItemButton>
          </>
        ) : (
          <>
            <ListItemButton component={Link} to="/login" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemText primary="Login" slotProps={{ primary: { style: { fontWeight: 600 } } }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/signup" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, bgcolor: alpha('#3f80ff', 0.1), '&:hover': { bgcolor: alpha('#3f80ff', 0.15) } }}>
              <ListItemText primary="Sign Up" slotProps={{ primary: { style: { fontWeight: 700 } } }} />
            </ListItemButton>
          </>
        )}
      </List>
    </Drawer>
  );

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
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: { xs: 60, md: 72 } }}>
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: 4, flexGrow: 1 }}
            >
              <Box sx={{
                background: 'linear-gradient(135deg, #3f80ff 0%, #7c4dff 100%)',
                p: 0.8, borderRadius: 2, display: 'flex', mr: 1.5,
                boxShadow: '0 4px 12px rgba(63, 128, 255, 0.4)'
              }}>
                <QrCodeIcon sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                  fontSize: { xs: '1.2rem', md: '1.4rem' }
                }}
              >
                FINDLY
              </Typography>
            </Box>

            {/* Desktop Nav */}
            {!isMobile && (
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
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      px: 2, py: 0.8, borderRadius: 3,
                      bgcolor: alpha('#ffd700', 0.1),
                      border: '1px solid',
                      borderColor: alpha('#ffd700', 0.2),
                    }}>
                      <CoffeeIcon sx={{ color: '#ffd700', fontSize: 18 }} />
                      <Typography sx={{ fontWeight: 800, color: '#ffd700', fontSize: '0.9rem' }}>{coins}</Typography>
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
                      slotProps={{ paper: { sx: { borderRadius: 3, width: 220, mt: 1, p: 0.5, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' } } }}
                    >
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>{user.full_name || 'My Account'}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{user.email}</Typography>
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
            )}

            {/* Mobile: coins badge + hamburger */}
            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.4, borderRadius: 2, bgcolor: alpha('#ffd700', 0.1) }}>
                    <CoffeeIcon sx={{ color: '#ffd700', fontSize: 15 }} />
                    <Typography sx={{ fontWeight: 800, color: '#ffd700', fontSize: '0.8rem' }}>{coins}</Typography>
                  </Box>
                )}
                <IconButton
                  onClick={() => setDrawerOpen(true)}
                  sx={{ color: 'text.primary' }}
                  aria-label="Open navigation menu"
                >
                  <Badge color="error" variant="dot" invisible={unreadCount === 0}>
                    <MenuIcon />
                  </Badge>
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <MobileDrawer />
    </>
  );
};

export default Navbar;
