'use client';

import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Description, 
  Schedule, 
  ContentCopy,
  CheckCircle
} from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  fileName: string;
  summary: string;
  createdAt: string;
  documentType?: string;
  processingMethod?: string;
}

export default function SummaryCard({ 
  fileName, 
  summary, 
  createdAt, 
  documentType, 
  processingMethod 
}: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success('Summary copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy summary');
    }
  };

  const getProcessingMethodColor = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'pdf': return '#007AFF';
      case 'manual': return '#FF9500';
      case 'ocr': return '#AF52DE';
      default: return '#34C759';
    }
  };

  const getDocumentTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      'Invoice': '#FF3B30',
      'Contract': '#007AFF',
      'Report': '#34C759',
      'Letter': '#FF9500',
      'Manual': '#AF52DE',
      'Other': '#8E8E93'
    };
    return colors[type || 'Other'] || '#8E8E93';
  };

  const truncatedSummary = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
  const shouldShowExpand = summary.length > 200;

  return (
    <Fade in timeout={600}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          position: 'relative',
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
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            borderColor: '#007AFF',
            '&::before': {
              left: '100%',
            }
          }
        }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Description sx={{ fontSize: 20, color: '#007AFF', mr: 1 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                >
                  {fileName}
                </Typography>
              </Box>
              
              {/* Tags */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {documentType && (
                  <Zoom in timeout={400}>
                    <Chip
                      label={documentType}
                      size="small"
                      sx={{
                        backgroundColor: `${getDocumentTypeColor(documentType)}15`,
                        color: getDocumentTypeColor(documentType),
                        border: `1px solid ${getDocumentTypeColor(documentType)}30`,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: `${getDocumentTypeColor(documentType)}25`,
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                  </Zoom>
                )}
                
                {processingMethod && (
                  <Zoom in timeout={600}>
                    <Chip
                      label={processingMethod === 'pdf' ? 'PDF Upload' : 'Manual Input'}
                      size="small"
                      variant="filled"
                      sx={{
                        backgroundColor: getProcessingMethodColor(processingMethod),
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                  </Zoom>
                )}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
              <Tooltip title="Copy Summary" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#007AFF15',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  {copied ? (
                    <CheckCircle sx={{ fontSize: 18, color: '#34C759' }} />
                  ) : (
                    <ContentCopy sx={{ fontSize: 18, color: 'text.secondary' }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Summary Content */}
          <Box sx={{ flex: 1, mb: 2 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                lineHeight: 1.6,
                fontSize: '0.9rem',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 'none' : 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              {expanded ? summary : truncatedSummary}
            </Typography>
            
            {shouldShowExpand && (
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#007AFF',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: '#0056CC',
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? 'Show Less' : 'Read More'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pt: 2,
            borderTop: '1px solid',
            borderTopColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {formatDate(createdAt)}
              </Typography>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              {summary.split(' ').length} words • {Math.ceil(summary.length / 5)} chars
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
}
