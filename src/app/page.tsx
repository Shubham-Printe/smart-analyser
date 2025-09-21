'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFUploader from '@/components/PDFUploader';
import TextAnalyzer from '@/components/TextAnalyzer';
import { Box, Typography, Divider, Fade, Slide, Grow } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState, useEffect } from 'react';

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger animations after component mount
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Fade in timeout={800}>
      <Box sx={{ 
        minHeight: '100vh', 
        py: 4,
        background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.02) 0%, rgba(52, 199, 89, 0.02) 100%)',
        transition: 'all 0.3s ease-in-out'
      }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Slide direction="down" in={showContent} timeout={600}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #007AFF 30%, #34C759 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                Smart Document Analyzer
              </Typography>
            </Slide>
            
            <Slide direction="up" in={showContent} timeout={800}>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  maxWidth: 600, 
                  mx: 'auto',
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Extract insights, generate summaries, and analyze documents with intelligent NLP processing
              </Typography>
            </Slide>
          </Box>

          {/* Main Content Grid */}
          <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
            {/* PDF Upload Section */}
            <Grid item xs={12} lg={6} {...({} as any)}>
              <Grow in={showContent} timeout={1000} style={{ transitionDelay: '200ms' }}>
                <Box sx={{ height: '100%' }}>
                  <PDFUploader />
                </Box>
              </Grow>
            </Grid>

            {/* Divider */}
            <Grid item xs={12} lg="auto" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} {...({} as any)}>
              <Fade in={showContent} timeout={1200} style={{ transitionDelay: '400ms' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: { xs: 'auto', lg: '100%' },
                  width: { xs: '100%', lg: 'auto' }
                }}>
                  <Divider 
                    orientation="vertical"
                    flexItem
                    sx={{ 
                      position: 'relative',
                      '&::before': {
                        content: '"OR"',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'background.default',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.secondary',
                        border: '2px solid',
                        borderColor: 'divider',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease-in-out',
                      },
                      '&:hover::before': {
                        borderColor: '#007AFF',
                        color: '#007AFF',
                        transform: 'translate(-50%, -50%) scale(1.05)',
                      }
                    }}
                  />
                </Box>
              </Fade>
            </Grid>

            {/* Text Analysis Section */}
            <Grid item xs={12} lg={6} {...({} as any)}>
              <Grow in={showContent} timeout={1000} style={{ transitionDelay: '600ms' }}>
                <Box sx={{ height: '100%' }}>
                  <TextAnalyzer />
                </Box>
              </Grow>
            </Grid>
          </Grid>

          {/* Footer Section */}
          <Fade in={showContent} timeout={1000} style={{ transitionDelay: '800ms' }}>
            <Box sx={{ 
              textAlign: 'center', 
              mt: 8, 
              py: 4,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Powered by intelligent NLP • Secure & Private • No data stored permanently
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 4,
                flexWrap: 'wrap'
              }}>
                {[
                  '📊 Smart Analytics',
                  '🏷️ Auto Tagging', 
                  '💡 Smart Insights',
                  '⚡ Fast Processing'
                ].map((feature, index) => (
                  <Grow 
                    key={feature} 
                    in={showContent} 
                    timeout={600} 
                    style={{ transitionDelay: `${1000 + (index * 100)}ms` }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(0, 122, 255, 0.05)',
                        border: '1px solid rgba(0, 122, 255, 0.1)',
                        fontWeight: 500,
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'default',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 122, 255, 0.1)',
                          borderColor: 'rgba(0, 122, 255, 0.2)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      {feature}
                    </Typography>
                  </Grow>
                ))}
              </Box>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Fade>
  );
}
