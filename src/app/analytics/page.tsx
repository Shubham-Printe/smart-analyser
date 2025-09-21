'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Skeleton,
  Fade,
  Grow,
  Slide,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useUpload } from '@/app/context/UploadContext';



interface AnalyticsData {
  overview: {
    totalDocuments: number;
    documentsLast30Days: number;
    documentsLast7Days: number;
    documentsToday: number;
    successfulProcessing: number;
    failedProcessing: number;
    successRate: number;
  };
  processingMethods: Array<{
    method: string;
    count: number;
    avgProcessingTime: number;
  }>;
  documentTypes: Array<{
    type: string;
    count: number;
    avgTextLength: number;
    avgFileSize: number;
  }>;
  errorTypes: Array<{
    type: string;
    count: number;
  }>;
  dailyActivity: Array<{
    date: string;
    total: number;
    successful: number;
    failed: number;
  }>;
  performance: {
    avgProcessingTime: number;
    minProcessingTime: number;
    maxProcessingTime: number;
    avgTextLength: number;
    avgFileSize: number;
    totalTextProcessed: number;
    totalFilesProcessed: number;
  } | null;
  recentActivity: Array<{
    _id: string;
    fileName: string;
    documentType: string;
    processingMethod: string;
    success: boolean;
    createdAt: string;
    processingTimeMs: number;
  }>;
}

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, suffix = '' }: { value: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <Typography variant="h3" sx={{ fontWeight: 600 }}>
      {count.toLocaleString()}{suffix}
    </Typography>
  );
};

// Loading Skeleton Component
const AnalyticsSkeleton = () => (
  <Box>
    <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
    <Skeleton variant="text" width={500} height={24} sx={{ mb: 4 }} />
    
    {/* Overview Cards Skeleton */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i} {...({} as any)}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
        </Grid>
      ))}
    </Grid>

    {/* Charts Skeleton */}
    <Grid container spacing={4}>
      <Grid item xs={12} {...({} as any)}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3, mb: 4 }} />
      </Grid>
      <Grid item xs={12} md={6} {...({} as any)}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Grid>
      <Grid item xs={12} md={6} {...({} as any)}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Grid>
    </Grid>
  </Box>
);

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const { setUploading, setLoadingMessage } = useUpload();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoadingMessage('Loading Analytics...');
        setUploading(true);
        setError(null);

        const res = await axios.get('/api/analytics');
        
        if (res.data.analytics) {
          // Handle graceful error response
          setAnalytics(res.data.analytics);
          if (res.data.error) {
            setError(res.data.error);
          }
        } else {
          // Handle direct analytics response
          setAnalytics(res.data);
        }
        
        // Delay content show for smooth animation
        setTimeout(() => setShowContent(true), 300);
      } catch (err) {
        console.error('Fetch analytics error:', err);
        setError('Failed to fetch analytics data');
        toast.error('Failed to load analytics');
      } finally {
        setLoadingMessage('');
        setUploading(false);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [setUploading, setLoadingMessage]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <Box>
        <AnalyticsSkeleton />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Fade in timeout={600}>
        <Box>
          <Typography variant="h3" gutterBottom>
            📊 Analytics Dashboard
          </Typography>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Failed to load analytics data. Please try again later.
          </Alert>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in={showContent} timeout={800}>
      <Box>
        <Slide direction="down" in={showContent} timeout={600}>
          <Typography variant="h3" gutterBottom>
            📊 Analytics Dashboard
          </Typography>
        </Slide>

        <Slide direction="up" in={showContent} timeout={800}>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Comprehensive insights into your document processing activity.
          </Typography>
        </Slide>

        {error && (
          <Grow in timeout={600}>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          </Grow>
        )}

        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              value: analytics.overview.totalDocuments, 
              label: 'Total Documents', 
              color: '#007AFF',
              delay: 0 
            },
            { 
              value: analytics.overview.successRate, 
              label: 'Success Rate', 
              color: analytics.overview.successRate >= 80 ? '#34C759' : '#FF9500',
              suffix: '%',
              delay: 200 
            },
            { 
              value: analytics.overview.documentsLast7Days, 
              label: 'Last 7 Days', 
              color: '#AF52DE',
              delay: 400 
            },
            { 
              value: analytics.overview.documentsToday, 
              label: 'Today', 
              color: '#FF9500',
              delay: 600 
            }
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} {...({} as any)}>
              <Grow in={showContent} timeout={800} style={{ transitionDelay: `${item.delay}ms` }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                      borderColor: item.color,
                    }
                  }}
                >
                  <Box sx={{ color: item.color }}>
                    <AnimatedCounter 
                      value={item.value} 
                      duration={1500 + item.delay} 
                      suffix={item.suffix || ''}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {item.label}
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={4}>
          {/* Top Row - Daily Activity (Full Width) */}
          <Grid item xs={12} {...({} as any)}>
            <Grow in={showContent} timeout={1000} style={{ transitionDelay: '800ms' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  📈 Daily Activity
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Document processing activity over the last 30 days
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: 8, 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="successful" 
                      stroke="#34C759" 
                      strokeWidth={3}
                      name="Successful" 
                      dot={{ fill: '#34C759', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#34C759', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="failed" 
                      stroke="#FF3B30" 
                      strokeWidth={3}
                      name="Failed" 
                      dot={{ fill: '#FF3B30', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#FF3B30', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#007AFF" 
                      strokeWidth={3}
                      name="Total" 
                      dot={{ fill: '#007AFF', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#007AFF', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grow>
          </Grid>

          {/* Second Row - Success Rate and Document Stats */}
          <Grid item xs={12} md={6} {...({} as any)}>
            <Grow in={showContent} timeout={1000} style={{ transitionDelay: '1000ms' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  ✅ Success Rate Overview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Processing success vs failure breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Successful', value: analytics.overview.successfulProcessing, color: '#34C759' },
                        { name: 'Failed', value: analytics.overview.failedProcessing, color: '#FF3B30' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name}: ${props.value} (${((props.value / analytics.overview.totalDocuments) * 100).toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={1200}
                      animationDuration={1000}
                    >
                      <Cell fill="#34C759" />
                      <Cell fill="#FF3B30" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: 8, 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grow>
          </Grid>

          <Grid item xs={12} md={6} {...({} as any)}>
            <Grow in={showContent} timeout={1000} style={{ transitionDelay: '1200ms' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  📊 Document Statistics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Key metrics about your document processing
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {[
                    { value: analytics.overview.totalDocuments, label: 'Total Documents', color: '#007AFF', delay: 0 },
                    { value: analytics.overview.documentsLast30Days, label: 'Last 30 Days', color: '#34C759', delay: 100 },
                    { value: analytics.overview.documentsLast7Days, label: 'Last 7 Days', color: '#AF52DE', delay: 200 },
                    { value: analytics.overview.documentsToday, label: 'Today', color: '#FF9500', delay: 300 }
                  ].map((item, index) => (
                    <Grid item xs={6} key={index} {...({} as any)}>
                      <Box 
                        sx={{ 
                          textAlign: 'center', 
                          p: 2, 
                          backgroundColor: `rgba(${item.color === '#007AFF' ? '0, 122, 255' : item.color === '#34C759' ? '52, 199, 89' : item.color === '#AF52DE' ? '175, 82, 222' : '255, 149, 0'}, 0.1)`, 
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            backgroundColor: `rgba(${item.color === '#007AFF' ? '0, 122, 255' : item.color === '#34C759' ? '52, 199, 89' : item.color === '#AF52DE' ? '175, 82, 222' : '255, 149, 0'}, 0.15)`,
                          }
                        }}
                      >
                        <Box sx={{ color: item.color }}>
                          <AnimatedCounter 
                            value={item.value} 
                            duration={1500 + item.delay + 1200}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grow>
          </Grid>

          {/* Third Row - Performance Metrics and Error Analysis Side by Side */}
          {analytics.performance && (
            <Grid item xs={12} lg={8} {...({} as any)}>
              <Grow in={showContent} timeout={1000} style={{ transitionDelay: '1400ms' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    ⚡ Performance Metrics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Processing performance and efficiency statistics
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      { value: formatDuration(analytics.performance.avgProcessingTime), label: 'Avg Processing Time', color: '#34C759', delay: 0 },
                      { value: analytics.performance.avgTextLength.toLocaleString(), label: 'Avg Text Length (chars)', color: '#007AFF', delay: 100 },
                      { value: formatBytes(analytics.performance.avgFileSize), label: 'Avg File Size', color: '#FF9500', delay: 200 },
                      { value: `${(analytics.performance.totalTextProcessed / 1000000).toFixed(1)}M`, label: 'Total Text Processed', color: '#AF52DE', delay: 300 }
                    ].map((item, index) => (
                      <Grid item xs={6} key={index} {...({} as any)}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          backgroundColor: `rgba(${item.color === '#34C759' ? '52, 199, 89' : item.color === '#007AFF' ? '0, 122, 255' : item.color === '#FF9500' ? '255, 149, 0' : '175, 82, 222'}, 0.1)`, 
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: `rgba(${item.color === '#34C759' ? '52, 199, 89' : item.color === '#007AFF' ? '0, 122, 255' : item.color === '#FF9500' ? '255, 149, 0' : '175, 82, 222'}, 0.2)`,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-4px) scale(1.02)',
                            boxShadow: `0 8px 25px rgba(${item.color === '#34C759' ? '52, 199, 89' : item.color === '#007AFF' ? '0, 122, 255' : item.color === '#FF9500' ? '255, 149, 0' : '175, 82, 222'}, 0.2)`,
                            borderColor: item.color,
                          }
                        }}>
                          <Typography variant="h4" sx={{ fontWeight: 600, color: item.color }}>
                            {item.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grow>
            </Grid>
          )}

          {analytics.errorTypes.length > 0 && (
            <Grid item xs={12} lg={4} {...({} as any)}>
              <Grow in={showContent} timeout={1000} style={{ transitionDelay: '1600ms' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    ⚠️ Error Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Types of processing errors encountered
                  </Typography>
                  <Stack direction="column" spacing={2}>
                    {analytics.errorTypes.map((error, index) => (
                      <Grow 
                        key={error.type} 
                        in={showContent} 
                        timeout={600} 
                        style={{ transitionDelay: `${1800 + (index * 100)}ms` }}
                      >
                        <Chip
                          label={`${error.type}: ${error.count}`}
                          color="error"
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            justifyContent: 'flex-start',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.02)',
                              boxShadow: '0 2px 8px rgba(255, 59, 48, 0.2)',
                            }
                          }}
                        />
                      </Grow>
                    ))}
                  </Stack>
                </Paper>
              </Grow>
            </Grid>
          )}

          {/* Fifth Row - Recent Activity Table (Full Width) */}
          <Grid item xs={12} {...({} as any)}>
            <Grow in={showContent} timeout={1000} style={{ transitionDelay: '1800ms' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  🕒 Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Latest document processing activity
                </Typography>
                <TableContainer 
                  component={Paper} 
                  variant="outlined"
                  sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        borderBottom: '2px solid',
                        borderBottomColor: 'divider'
                      }}>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>File Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Method</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Processing Time</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.recentActivity.map((activity, index) => (
                        <Fade 
                          key={activity._id} 
                          in={showContent} 
                          timeout={400} 
                          style={{ transitionDelay: `${2000 + (index * 100)}ms` }}
                        >
                          <TableRow 
                            hover 
                            sx={{
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.04)',
                                transform: 'scale(1.01)',
                              }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200, fontWeight: 500 }}>
                                {activity.fileName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={activity.documentType} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  borderRadius: 2, 
                                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                  color: 'text.primary',
                                  fontWeight: 500,
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                {activity.processingMethod}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={activity.success ? 'Success' : 'Failed'}
                                color={activity.success ? 'success' : 'error'}
                                size="small"
                                sx={{ 
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatDuration(activity.processingTimeMs)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </Fade>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
} 