'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Paper,
  Fade,
  Grow,
  Slide,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useUpload } from '@/app/context/UploadContext';

// Color palettes
const SENTIMENT_COLORS = {
  Positive: '#34C759',
  Neutral: '#007AFF', 
  Negative: '#FF3B30'
};

const WORD_CLOUD_COLORS = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#00C7BE', '#FFD60A', '#FF3B30'];

interface InsightsData {
  wordCloud: Array<{ text: string; value: number }>;
  sentiment: {
    overall: string;
    distribution: { Positive: number; Neutral: number; Negative: number };
    details: Array<{
      documentId: string;
      fileName: string;
      sentiment: string;
      score: number;
      confidence: number;
    }>;
  };
  insights: {
    entities: {
      people: string[];
      places: string[];
      organizations: string[];
      topics: string[];
    };
    metrics: {
      totalDocuments: number;
      avgTextLength: number;
      documentTypes: Array<{ type: string; count: number }>;
    };
  };
}

// Simple word cloud component using CSS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function WordCloud({ words }: { words: Array<{ text: string; value: number }> }) {
  if (!words || words.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        <Typography variant="body2">No words to display</Typography>
      </Box>
    );
  }

  const maxValue = Math.max(...words.map(w => w.value));
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 1, 
      justifyContent: 'center',
      alignItems: 'center',
      p: 3,
      minHeight: '300px'
    }}>
      {words.slice(0, 30).map((word, index) => {
        const size = Math.max(0.8, (word.value / maxValue) * 2.5);
        const color = WORD_CLOUD_COLORS[index % WORD_CLOUD_COLORS.length];
        
        return (
          <Typography
            key={word.text}
            sx={{
              fontSize: `${size}rem`,
              fontWeight: Math.round(400 + (word.value / maxValue) * 300),
              color: color,
              cursor: 'default',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                opacity: 0.8
              }
            }}
            title={`"${word.text}" appears ${word.value} times`}
          >
            {word.text}
          </Typography>
        );
      })}
    </Box>
  );
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
const InsightsSkeleton = () => (
  <Box>
    <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
    <Skeleton variant="text" width={500} height={24} sx={{ mb: 4 }} />
    
    {/* Metrics Cards Skeleton */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i} {...({} as any)}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>

    {/* Charts Skeleton */}
    <Grid container spacing={4}>
      <Grid item xs={12} md={8} {...({} as any)}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} md={4} {...({} as any)}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Box>
);

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const { setUploading, setLoadingMessage } = useUpload();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoadingMessage('Loading Insights...');
        setUploading(true);
        setError(null);

        const res = await axios.get('/api/insights');
        setInsights(res.data);
        
        // Delay content show for smooth animation
        setTimeout(() => setShowContent(true), 300);
      } catch (err) {
        console.error('Fetch insights error:', err);
        setError('Failed to fetch insights data');
        toast.error('Failed to load insights');
      } finally {
        setLoadingMessage('');
        setUploading(false);
        setLoading(false);
      }
    };

    fetchInsights();
  }, [setUploading, setLoadingMessage]);

  if (loading) {
    return (
      <Box>
        <InsightsSkeleton />
      </Box>
    );
  }

  if (!insights) {
    return (
      <Fade in timeout={600}>
        <Box>
          <Typography variant="h3" gutterBottom>
            💡 Summary Insights
          </Typography>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Failed to load insights data. Please try again later.
          </Alert>
        </Box>
      </Fade>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: insights.sentiment.distribution.Positive, color: SENTIMENT_COLORS.Positive },
    { name: 'Neutral', value: insights.sentiment.distribution.Neutral, color: SENTIMENT_COLORS.Neutral },
    { name: 'Negative', value: insights.sentiment.distribution.Negative, color: SENTIMENT_COLORS.Negative }
  ];

  return (
    <Fade in={showContent} timeout={800}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
        <Slide direction="down" in={showContent} timeout={600}>
          <Typography variant="h3" gutterBottom>
            💡 Summary Insights
          </Typography>
        </Slide>

        <Slide direction="up" in={showContent} timeout={800}>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Comprehensive analysis of your document summaries and content patterns.
          </Typography>
        </Slide>

        {error && (
          <Grow in timeout={600}>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          </Grow>
        )}

        {/* Metrics Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              value: insights.insights.metrics.totalDocuments, 
              label: 'Total Documents', 
              color: '#007AFF',
              delay: 0 
            },
            { 
              value: insights.wordCloud.length, 
              label: 'Unique Words', 
              color: '#34C759',
              delay: 200 
            },
            { 
              value: insights.insights.entities.people.length + insights.insights.entities.places.length + insights.insights.entities.organizations.length, 
              label: 'Total Entities', 
              color: '#AF52DE',
              delay: 400 
            },
            { 
              value: insights.insights.metrics.avgTextLength, 
              label: 'Avg Text Length', 
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
                    borderRadius: 2,
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

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Word Cloud Section */}
          <Grid item xs={12} {...({} as any)}>
            <Grow in={showContent} timeout={1000} style={{ transitionDelay: '800ms' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
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
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  🔤 Most Frequent Words
                </Typography>
                
                {insights.wordCloud.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {insights.wordCloud.slice(0, 30).map((word, index) => (
                      <Grow 
                        key={word.text} 
                        in={showContent} 
                        timeout={400} 
                        style={{ transitionDelay: `${1000 + (index * 50)}ms` }}
                      >
                        <Chip
                          label={`${word.text} (${word.value})`}
                          size="medium"
                          sx={{
                            fontSize: Math.max(0.75, Math.min(1.2, word.value / 10)) + 'rem',
                            backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 90%)`,
                            color: `hsl(${(index * 137.5) % 360}, 70%, 30%)`,
                            fontWeight: 500,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }
                          }}
                        />
                      </Grow>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <Typography variant="body2">No word data available yet</Typography>
                  </Box>
                )}
              </Paper>
            </Grow>
          </Grid>

          {/* Entities and Topics */}
          <Grid item xs={12} md={8} {...({} as any)}>
            <Grow in={showContent} timeout={1000} style={{ transitionDelay: '1000ms' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
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
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  🏷️ Extracted Entities & Topics
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {[
                    { title: '👥 People', items: insights.insights.entities.people, color: '#007AFF' },
                    { title: '📍 Places', items: insights.insights.entities.places, color: '#34C759' },
                    { title: '🏢 Organizations', items: insights.insights.entities.organizations, color: '#FF9500' },
                    { title: '💡 Topics', items: insights.insights.entities.topics, color: '#AF52DE' }
                  ].map((category: any, categoryIndex: number) => (
                    <Grid item xs={12} sm={6} key={category.title} {...({} as any)}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: category.color, mb: 1 }}>
                          {category.title}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                     {category.items.slice(0, 8).map((item: string, index: number) => (
                            <Grow 
                              key={item} 
                              in={showContent} 
                              timeout={400} 
                              style={{ transitionDelay: `${1200 + (categoryIndex * 200) + (index * 100)}ms` }}
                            >
                              <Chip
                                label={item}
                                size="small"
                                sx={{
                                  backgroundColor: `${category.color}15`,
                                  color: category.color,
                                  border: `1px solid ${category.color}30`,
                                  fontWeight: 500,
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    backgroundColor: `${category.color}25`,
                                    transform: 'scale(1.05)',
                                  }
                                }}
                              />
                            </Grow>
                          ))}
                          {category.items.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              None detected
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grow>
          </Grid>

          {/* Sentiment Chart + Recent Sentiment */}
          <Grid item xs={12} md={4} {...({} as any)}>
            <Grow in={showContent} timeout={1000} style={{ transitionDelay: '1200ms' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
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
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  😊 Sentiment Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={1400}
                        animationDuration={1000}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
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
                  
                  {/* Horizontal Legend */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {sentimentData.map((entry, index) => (
                      <Grow 
                        key={entry.name} 
                        in={showContent} 
                        timeout={400} 
                        style={{ transitionDelay: `${1600 + (index * 100)}ms` }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              backgroundColor: entry.color, 
                              borderRadius: 1 
                            }} 
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {entry.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {entry.value}%
                          </Typography>
                        </Box>
                      </Grow>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grow>
          </Grid>

          {/* Recent Sentiment List */}
          <Grid item xs={12} {...({} as any)}>
            <Grow in={showContent} timeout={1000} style={{ transitionDelay: '1400ms' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  📝 Recent Sentiment Analysis
                </Typography>
                
                {insights.sentiment.details.length > 0 ? (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {insights.sentiment.details.slice(0, 12).map((detail, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={detail.documentId} {...({} as any)}>
                        <Grow 
                          in={showContent} 
                          timeout={400} 
                          style={{ transitionDelay: `${1600 + (index * 100)}ms` }}
                        >
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: 'rgba(0,0,0,0.02)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.04)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }} noWrap>
                                {detail.fileName.length > 15 ? detail.fileName.substring(0, 15) + '...' : detail.fileName}
                              </Typography>
                              <Chip
                                label={detail.sentiment}
                                size="small"
                                sx={{
                                  backgroundColor: SENTIMENT_COLORS[detail.sentiment as keyof typeof SENTIMENT_COLORS],
                                  color: 'white',
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                  height: 22,
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Score: {detail.score > 0 ? '+' : ''}{detail.score} • Confidence: {Math.round(detail.confidence * 100)}%
                            </Typography>
                          </Paper>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <Typography variant="body2">No sentiment data yet</Typography>
                  </Box>
                )}
              </Paper>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
} 