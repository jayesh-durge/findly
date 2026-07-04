import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  ArrowUpward as SentIcon,
  ArrowDownward as ReceivedIcon,
  Coffee as CoffeeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { getRewardBalance, getTransactions } from '../services/api';

const levelBadge = (coins: number) => {
  if (coins >= 500) return { label: 'Legend', color: '#ffd700', bg: 'rgba(255,215,0,0.12)' };
  if (coins >= 200) return { label: 'Hero', color: '#c084fc', bg: 'rgba(192,132,252,0.12)' };
  if (coins >= 100) return { label: 'Helper', color: '#3f80ff', bg: 'rgba(63,128,255,0.12)' };
  if (coins >= 25) return { label: 'Starter', color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
  return { label: 'Newcomer', color: '#8b949e', bg: 'rgba(139,148,158,0.1)' };
};

const Rewards: React.FC = () => {
  const { user } = useAuth();
  const [coins, setCoins] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [balData, txData] = await Promise.all([
        getRewardBalance(user!.id),
        getTransactions(user!.id),
      ]);
      setCoins(balData.coins ?? 0);
      setTransactions(txData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const badge = levelBadge(coins);
  const totalReceived = transactions.filter(t => t.receiver_id === user?.id).reduce((s, t) => s + t.amount, 0);
  const totalSent = transactions.filter(t => t.sender_id === user?.id).reduce((s, t) => s + t.amount, 0);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: '#3f80ff' }} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" sx={{
          fontWeight: 800, letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #ffd700 0%, #ff9500 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          ☕ Reward Coins
        </Typography>
        <Typography variant="body1" sx={{ color: '#8b949e', mt: 0.5 }}>
          Earn coins when finders return your items. Send gratitude to good samaritans.
        </Typography>
      </Box>

      {/* Balance Card */}
      <Paper sx={{
        p: 4, mb: 4, borderRadius: 4,
        background: 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,149,0,0.05) 100%)',
        border: '1px solid rgba(255,215,0,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative orb */}
        <Box sx={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                p: 1.5, borderRadius: 3,
                background: 'linear-gradient(135deg, #ffd700 0%, #ff9500 100%)',
                boxShadow: '0 4px 16px rgba(255,215,0,0.3)',
              }}>
                <CoffeeIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Balance
                </Typography>
                <Typography sx={{
                  fontSize: '3rem', fontWeight: 900, lineHeight: 1,
                  background: 'linear-gradient(135deg, #ffd700 0%, #ff9500 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {coins}
                  <Typography component="span" sx={{ fontSize: '1.2rem', ml: 1, color: '#8b949e', WebkitTextFillColor: '#8b949e' }}>
                    coins
                  </Typography>
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<StarIcon sx={{ fontSize: '16px !important', color: `${badge.color} !important` }} />}
              label={badge.label}
              sx={{
                bgcolor: badge.bg, color: badge.color,
                border: `1px solid ${badge.color}33`,
                fontWeight: 700, fontSize: '0.85rem',
              }}
            />

          </Box>

          <Box sx={{ flex: '1 1 280px', minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{
                flex: 1, p: 2, borderRadius: 3,
                bgcolor: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
                textAlign: 'center',
              }}>
                <ReceivedIcon sx={{ color: '#34d399', fontSize: 22, mb: 0.5 }} />
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{totalReceived}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#8b949e', fontWeight: 600 }}>RECEIVED</Typography>
              </Box>
              <Box sx={{
                flex: 1, p: 2, borderRadius: 3,
                bgcolor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)',
                textAlign: 'center',
              }}>
                <SentIcon sx={{ color: '#f87171', fontSize: 22, mb: 0.5 }} />
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>{totalSent}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#8b949e', fontWeight: 600 }}>SENT</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* How it works */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid rgba(63,128,255,0.15)', bgcolor: 'rgba(63,128,255,0.04)' }}>
        <Typography sx={{ fontWeight: 700, color: '#3f80ff', mb: 2, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          💡 How Coins Work
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[
            { icon: '🎁', text: 'New users start with 50 coins' },
            { icon: '☕', text: 'Send 5–50 coins from the chat as a thank-you' },
            { icon: '🏆', text: 'Collect coins to level up your badge' },
          ].map((tip, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1.2rem' }}>{tip.icon}</Typography>
              <Typography sx={{ color: '#8b949e', fontSize: '0.85rem' }}>{tip.text}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Transaction History */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#f0f6fc' }}>
        Transaction History
      </Typography>

      {transactions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px dashed rgba(255,255,255,0.08)' }}>
          <TrophyIcon sx={{ fontSize: 48, color: '#8b949e', mb: 1.5 }} />
          <Typography sx={{ color: '#8b949e', fontWeight: 600 }}>No transactions yet</Typography>
          <Typography sx={{ color: '#8b949e', fontSize: '0.85rem' }}>
            Send coins from the chat window to start your history
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          {transactions.map((tx, i) => {
            const isReceived = tx.receiver_id === user?.id;
            const otherUser = isReceived ? tx.sender : tx.receiver;
            return (
              <React.Fragment key={tx.id ?? i}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2.5,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: 'background 0.2s',
                }}>
                  <Avatar
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.email}`}
                    sx={{ width: 42, height: 42, border: `2px solid ${isReceived ? '#34d39944' : '#f8717144'}` }}
                  />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, color: '#f0f6fc', fontSize: '0.9rem' }}>
                      {isReceived ? otherUser?.full_name || 'Someone' : otherUser?.full_name || 'User'}
                    </Typography>
                    <Typography sx={{ color: '#8b949e', fontSize: '0.78rem' }} noWrap>
                      {tx.message || (isReceived ? 'Sent you coins' : 'You sent coins')}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{
                      fontWeight: 800, fontSize: '1.1rem',
                      color: isReceived ? '#34d399' : '#f87171',
                    }}>
                      {isReceived ? '+' : '-'}{tx.amount} ☕
                    </Typography>
                    <Typography sx={{ color: '#8b949e', fontSize: '0.72rem' }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                {i < transactions.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
              </React.Fragment>
            );
          })}
        </Paper>
      )}
    </Container>
  );
};

export default Rewards;
