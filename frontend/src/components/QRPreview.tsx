import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  QrCode as QrCodeIcon 
} from '@mui/icons-material';

interface QRPreviewProps {
  qrImageBase64: string;
}

const QRPreview: React.FC<QRPreviewProps> = ({ qrImageBase64 }) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrImageBase64;
    a.download = 'findly-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Paper sx={{ p: 4, textAlign: 'center', height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
        Your Smart QR Tag
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Print this out and stick it to your item!
      </Typography>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {qrImageBase64 ? (
          <Box 
            component="div"
            sx={{ 
              mb: 4,
              p: 2,
              bgcolor: 'white',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              maxWidth: '240px'
            }}
          >
            <img 
              src={qrImageBase64} 
              alt="Generated QR" 
              style={{ 
                width: '100%', 
                display: 'block'
              }} 
            />
          </Box>
        ) : (
          <Box sx={{ 
            width: 240, 
            height: 240, 
            mb: 4,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'action.hover',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 3
          }}>
            <QrCodeIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          </Box>
        )}

        <Button 
          fullWidth
          variant="contained"
          disabled={!qrImageBase64}
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
          sx={{ py: 1.5, borderRadius: 2 }}
        >
          Download Tag
        </Button>
      </Box>
    </Paper>
  );
};

export default QRPreview;
