import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateItem from './pages/CreateItem';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ScanItem from './pages/ScanItem';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Rewards from './pages/Rewards';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/scan/:qrId" element={<ScanItem />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-item" element={<CreateItem />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/chat/:userId/:itemId" element={<Chat />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/profile" element={
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <h1>Profile Page</h1>
                    <p>Settings and personal info coming soon.</p>
                  </Box>
                } />
              </Route>
  
              {/* Redirects */}
              <Route path="/create" element={<Navigate to="/create-item" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
