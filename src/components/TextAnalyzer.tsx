'use client';

import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Paper,
  Fade,
  Grow,
  Zoom,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { Analytics, Send, CheckCircle, Error } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useUpload } from '@/app/context/UploadContext';

interface AnalysisResponse {
  success: boolean;
  summary?: string;
  documentType?: string;
  smartTagging?: boolean;
  error?: string;
}

export default function TextAnalyzer() {
  const [text, setText] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const { setUploading, setLoadingMessage } = useUpload();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    if (text.trim().length < 50) {
      toast.error('Please enter at least 50 characters for meaningful analysis');
      return;
    }

    setUploading(true);
    setAnalysisStatus('analyzing');
    setLoadingMessage('Analyzing text...');

    try {
      const response = await axios.post<AnalysisResponse>('/api/text', {
        text: text.trim()
      });

      if (response.data.success) {
        setAnalysisStatus('success');
        toast.success('✅ Text Analysis Complete!');
        
        if (response.data.smartTagging && response.data.documentType) {
          toast.success(`🏷️ Smart Tag: ${response.data.documentType}`, {
            duration: 4000,
          });
        }

        // Reset after success animation
        setTimeout(() => {
          setText('');
          setAnalysisStatus('idle');
        }, 2000);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new (Error as any)(response.data.error || 'Analysis failed');
      }
    } catch (error: unknown) {
      setAnalysisStatus('error');
      console.error('Analysis error:', error);
      toast.error('❌ Analysis failed. Please try again.');

      // Reset after error
      setTimeout(() => {
        setAnalysisStatus('idle');
      }, 3000);
    } finally {
      setUploading(false);
      setLoadingMessage('');
    }
  };

  const getStatusIcon = () => {
    switch (analysisStatus) {
      case 'analyzing':
        return <CircularProgress size={24} sx={{ color: '#007AFF' }} />;
      case 'success':
        return <CheckCircle sx={{ fontSize: 24, color: '#34C759' }} />;
      case 'error':
        return <Error sx={{ fontSize: 24, color: '#FF3B30' }} />;
      default:
        return <Send sx={{ fontSize: 24 }} />;
    }
  };

  const getButtonText = () => {
    switch (analysisStatus) {
      case 'analyzing':
        return 'Analyzing...';
      case 'success':
        return 'Analysis Complete!';
      case 'error':
        return 'Try Again';
      default:
        return 'Analyze Text';
    }
  };

  const getButtonColor = () => {
    switch (analysisStatus) {
      case 'success':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  return (
    <Fade in timeout={800}>
      <Paper
        id="text-analyzer"
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          height: '100%',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
          }
        }}
      >
        <Grow in timeout={600}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            📝 Analyze Text Content
          </Typography>
        </Grow>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Fade in timeout={1000}>
            <TextField
              multiline
              rows={12}
              fullWidth
              placeholder="Paste your text content here for intelligent NLP analysis..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={analysisStatus === 'analyzing'}
              variant="outlined"
              sx={{
                flex: 1,
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007AFF',
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007AFF',
                      borderWidth: 2,
                    },
                    transform: 'scale(1.01)',
                    boxShadow: '0 4px 20px rgba(0, 122, 255, 0.1)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(0,0,0,0.02)',
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  '&::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.7,
                  }
                }
              }}
            />
          </Fade>

          <Zoom in timeout={800}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={!text.trim() || analysisStatus === 'analyzing'}
                startIcon={getStatusIcon()}
                fullWidth
                size="large"
                sx={{
                  py: 2,
                  borderRadius: 2,
                  fontWeight: 600,
                  backgroundColor: getButtonColor(),
                  boxShadow: `0 4px 15px rgba(${
                    analysisStatus === 'success' ? '52, 199, 89' :
                    analysisStatus === 'error' ? '255, 59, 48' :
                    '0, 122, 255'
                  }, 0.3)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: analysisStatus === 'idle' ? 'translateY(-2px)' : 'none',
                    boxShadow: analysisStatus === 'idle' ? `0 8px 25px rgba(0, 122, 255, 0.4)` : undefined,
                    backgroundColor: analysisStatus === 'idle' ? '#0056CC' : getButtonColor(),
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0,0,0,0.12)',
                    boxShadow: 'none',
                    transform: 'none',
                  }
                }}
              >
                {getButtonText()}
              </Button>
            </Box>
          </Zoom>

          <Fade in={!!text.trim()} timeout={500}>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Analytics sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {text.length} characters • {Math.ceil(text.length / 5)} words
              </Typography>
              {text.length >= 50 && (
                <Typography variant="caption" sx={{ color: '#34C759', fontWeight: 500 }}>
                  ✓ Ready for analysis
                </Typography>
              )}
              {text.length > 0 && text.length < 50 && (
                <Typography variant="caption" sx={{ color: '#FF9500', fontWeight: 500 }}>
                  Need {50 - text.length} more characters
                </Typography>
              )}
            </Box>
          </Fade>
        </Box>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: 'absolute',
            borderRadius: 3,
          }}
          open={analysisStatus === 'analyzing'}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Analyzing your text...
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Extracting insights and generating summary
            </Typography>
          </Box>
        </Backdrop>
      </Paper>
    </Fade>
  );
} 