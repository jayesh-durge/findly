import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Avatar,
  alpha,
  useTheme
} from '@mui/material';
import { 
  QrCode as QrIcon, 
  Security as SecurityIcon, 
  LocationOn as LocationIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();

  const features = [
    { 
      icon: <QrIcon />, 
      title: "Instant QR Tags", 
      desc: "Generate unique, durable QR tags for everything from your keys to your laptop in seconds.",
      color: theme.palette.primary.main
    },
    { 
      icon: <SecurityIcon />, 
      title: "Privacy First", 
      desc: "Communicate securely. Finders skip your personal cell number and use our encrypted platform.",
      color: "#7c4dff"
    },
    { 
      icon: <LocationIcon />, 
      title: "Smart Pinpoint", 
      desc: "Receive real-time notifications with precise scan locations the moment someone finds your item.",
      color: "#00c853"
    }
  ];

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow */}
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '600px',
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 15 }, pb: 10 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
          <TagChip 
            label="Hackathon MVP Phase 2" 
            icon={<SparkleIcon sx={{ fontSize: '14px !important' }} />}
            sx={{ mb: 3 }}
          />
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4.5rem' }, 
              fontWeight: 900,
              lineHeight: 1.1,
              mb: 3,
              background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Never Lose What Matters <br />
            <Box component="span" sx={{ color: 'primary.main' }}>With Smart QR Tags</Box>
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: '700px', mx: 'auto', mb: 5, lineHeight: 1.6, fontWeight: 400 }}
          >
            Secure your bags, pets, and valuables with privacy-first QR codes. 
            The global community helps you return them safely, zero exposure needed.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              size="large"
              fullWidth={false}
              sx={{ px: { xs: 3, sm: 4 }, py: 1.8, fontSize: { xs: '1rem', sm: '1.1rem' }, width: { xs: '100%', sm: 'auto' } }}
            >
              Get Started Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: { xs: 3, sm: 4 },
                py: 1.8,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'text.primary',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.02)' }
              }}
            >
              How it works
            </Button>
          </Box>
        </Box>

        {/* Feature Grid */}
        <Grid container spacing={3}>
          {features.map((f, i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Paper 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: alpha(f.color, 0.4),
                    boxShadow: `0 12px 30px ${alpha(f.color, 0.15)}`
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(f.color, 0.1), 
                    color: f.color,
                    width: 56,
                    height: 56,
                    mb: 3,
                    borderRadius: 3
                  }}
                >
                  {f.icon}
                </Avatar>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                  {f.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action Bar */}
        <Paper sx={{
          mt: { xs: 6, md: 12 },
          p: { xs: 4, md: 6 },
          borderRadius: 6,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, fontSize: { xs: '1.4rem', sm: '2rem' } }}>Ready to secure your world?</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Join 10,000+ users protecting their valuables today.</Typography>
            <Button component={Link} to="/signup" variant="contained" size="large">Create Free Account</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

// Helper for the Chip
const TagChip = ({ label, icon, sx }: any) => (
  <Box sx={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: 1, 
    px: 2, 
    py: 0.8, 
    borderRadius: 2, 
    bgcolor: alpha('#3f80ff', 0.1), 
    border: '1px solid rgba(63, 128, 255, 0.3)',
    color: '#3f80ff',
    fontWeight: 600,
    fontSize: '0.85rem',
    ...sx 
  }}>
    {icon} {label}
  </Box>
);

export default Home;
