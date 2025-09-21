'use client';

import { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  LinearProgress,
  Fade,
  Grow,
  Zoom,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { CloudUpload, Description, CheckCircle, Error } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useUpload } from '@/app/context/UploadContext';

interface UploadResponse {
  success: boolean;
  summary?: string;
  fileName?: string;
  documentType?: string;
  smartTagging?: boolean;
  error?: string;
  errorType?: string;
}

export default function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const { setUploading, setLoadingMessage } = useUpload();

  const scrollToTextInput = () => {
    const textAnalyzer = document.getElementById('text-analyzer');
    if (textAnalyzer) {
      textAnalyzer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadStatus('idle');
      setUploadProgress(0);
    } else {
      toast.error('Please select a valid PDF file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setLoadingMessage('Uploading and analyzing PDF...');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await axios.post<UploadResponse>('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        setUploadStatus('success');
        toast.success(`✅ Analysis Complete: ${response.data.fileName}`);
        
        if (response.data.smartTagging && response.data.documentType) {
          toast.success(`🏷️ Smart Tag: ${response.data.documentType}`, {
            duration: 4000,
          });
        }

        // Reset after success animation
        setTimeout(() => {
          setFile(null);
          setUploadStatus('idle');
          setUploadProgress(0);
        }, 2000);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new (Error as any)(response.data.error || 'Upload failed');
      }
    } catch (error: unknown) {
      setUploadStatus('error');
      setUploadProgress(0);
      
      console.error('Upload error:', error);
      const axiosError = error as { response?: { data?: { errorType?: string } } };
      
      if (axiosError.response?.data?.errorType === 'PDF_EXTRACTION_FAILED') {
        toast.error('📄 PDF extraction failed. Please try the text input below.', {
          duration: 6000,
        });
        setTimeout(() => scrollToTextInput(), 1000);
      } else if (axiosError.response?.data?.errorType === 'INVALID_PDF') {
        toast.error('❌ Invalid PDF file. Please select a valid PDF.');
      } else {
        toast.error('❌ Upload failed. Please try again or use text input.');
      }

      // Reset after error
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
    } finally {
      setUploading(false);
      setLoadingMessage('');
    }
  };

  const getDropzoneStyles = () => {
    const baseStyles = {
      border: '2px dashed',
      borderRadius: 3,
      padding: 4,
      textAlign: 'center' as const,
      cursor: 'pointer',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        transition: 'left 0.6s ease-in-out',
      },
      '&:hover::before': {
        left: '100%',
      },
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
      }
    };

    if (isDragReject) {
      return {
        ...baseStyles,
        borderColor: '#FF3B30',
        backgroundColor: 'rgba(255, 59, 48, 0.05)',
        transform: 'scale(0.98)',
      };
    }

    if (isDragActive) {
      return {
        ...baseStyles,
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
        transform: 'scale(1.02)',
        boxShadow: '0 8px 25px rgba(0, 122, 255, 0.2)',
      };
    }

    if (file) {
      return {
        ...baseStyles,
        borderColor: '#34C759',
        backgroundColor: 'rgba(52, 199, 89, 0.05)',
      };
    }

    return {
      ...baseStyles,
      borderColor: 'divider',
      backgroundColor: 'background.paper',
    };
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <CircularProgress size={48} sx={{ color: '#007AFF' }} />;
      case 'success':
        return <CheckCircle sx={{ fontSize: 48, color: '#34C759' }} />;
      case 'error':
        return <Error sx={{ fontSize: 48, color: '#FF3B30' }} />;
      default:
        return file ? (
          <Description sx={{ fontSize: 48, color: '#34C759' }} />
        ) : (
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
        );
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Analyzing PDF...';
      case 'success':
        return 'Analysis Complete!';
      case 'error':
        return 'Upload Failed';
      default:
        return file ? file.name : 'Drop PDF here or click to browse';
    }
  };

  return (
    <Fade in timeout={600}>
      <Paper
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
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          📄 Upload PDF Document
        </Typography>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box
            {...getRootProps()}
            sx={getDropzoneStyles()}
          >
            <input {...getInputProps()} />
            
            <Zoom in timeout={400}>
              <Box sx={{ mb: 2 }}>
                {getStatusIcon()}
              </Box>
            </Zoom>

            <Grow in timeout={600}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 500,
                  color: uploadStatus === 'error' ? '#FF3B30' : 
                         uploadStatus === 'success' ? '#34C759' :
                         file ? '#34C759' : 'text.secondary',
                  transition: 'color 0.3s ease-in-out'
                }}
              >
                {getStatusText()}
              </Typography>
            </Grow>

            {!file && uploadStatus === 'idle' && (
              <Fade in timeout={800}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Supports PDF files up to 10MB
                </Typography>
              </Fade>
            )}

            {uploadStatus === 'uploading' && (
              <Fade in timeout={300}>
                <Box sx={{ width: '100%', mt: 2, px: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0, 122, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(45deg, #007AFF 30%, #34C759 90%)',
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    {Math.round(uploadProgress)}% Complete
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>

          <Grow in={!!file && uploadStatus === 'idle'} timeout={500}>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!file || uploadStatus !== 'idle'}
                fullWidth
                size="large"
                sx={{
                  py: 2,
                  borderRadius: 2,
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #007AFF 30%, #34C759 90%)',
                  boxShadow: '0 4px 15px rgba(0, 122, 255, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 122, 255, 0.4)',
                    background: 'linear-gradient(45deg, #0056CC 30%, #2BA946 90%)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.12)',
                    boxShadow: 'none',
                    transform: 'none',
                  }
                }}
              >
                {uploadStatus === 'uploading' ? 'Analyzing...' : 'Analyze PDF'}
              </Button>
            </Box>
          </Grow>
        </Box>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: 'absolute',
            borderRadius: 3,
          }}
          open={uploadStatus === 'uploading'}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Processing your PDF...
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              This may take a few moments
            </Typography>
          </Box>
        </Backdrop>
      </Paper>
    </Fade>
  );
}
