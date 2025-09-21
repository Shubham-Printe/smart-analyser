'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Typography, 
  Box, 
  Button, 
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Paper,
  Fade,
  Grow,
  Slide,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Zoom
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { 
  Search, 
  FilterList, 
  ViewList, 
  ViewModule,
  Add,
  Category,
  Speed,
  TrendingUp,
  Description,
  CloudUpload
} from '@mui/icons-material';
import NextLink from 'next/link';
import { toast } from 'react-hot-toast';

import { useUpload } from '@/app/context/UploadContext';
import SummaryCard from '@/components/summaryCard';

type SummaryType = {
  _id: string;
  fileName: string;
  summary: string;
  createdAt: string;
  documentType?: string;
  processingMethod?: string;
};

type SortOption = 'newest' | 'oldest' | 'name' | 'type';
type ViewMode = 'grid' | 'list';

// Loading Skeleton Component
const HistorySkeleton = ({ viewMode }: { viewMode: ViewMode }) => (
  <Box>
    {/* Header Skeleton */}
    <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
    <Skeleton variant="text" width={500} height={24} sx={{ mb: 4 }} />
    
    {/* Controls Skeleton */}
    <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
      <Skeleton variant="rectangular" width={300} height={56} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" width={150} height={56} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" width={150} height={56} sx={{ borderRadius: 2 }} />
    </Box>

    {/* Cards Skeleton */}
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={i} {...({} as any)}>
          <Skeleton variant="rectangular" height={viewMode === 'grid' ? 200 : 120} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

// Empty State Component
const EmptyState = ({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) => (
  <Fade in timeout={800}>
    <Box sx={{ 
      textAlign: 'center', 
      py: 8,
      background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.02) 0%, rgba(52, 199, 89, 0.02) 100%)',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Zoom in timeout={600}>
        <Box sx={{ mb: 3 }}>
          {hasFilters ? (
            <Search sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
          ) : (
            <Description sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
          )}
        </Box>
      </Zoom>
      
      <Slide direction="up" in timeout={800}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {hasFilters ? 'No matching summaries' : 'No summaries yet'}
        </Typography>
      </Slide>
      
      <Slide direction="up" in timeout={1000}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
          {hasFilters 
            ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
            : 'Upload your first PDF to start building your document library with intelligent summaries.'
          }
        </Typography>
      </Slide>
      
      <Grow in timeout={1200}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {hasFilters ? (
            <Button
              variant="outlined"
              onClick={onClearFilters}
              startIcon={<FilterList />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                }
              }}
            >
              Clear Filters
            </Button>
          ) : null}
          
          <Button
            variant="contained"
            component={NextLink}
            href="/"
            startIcon={<CloudUpload />}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #007AFF 30%, #34C759 90%)',
              boxShadow: '0 4px 15px rgba(0, 122, 255, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0, 122, 255, 0.4)',
              }
            }}
          >
            {hasFilters ? 'Upload New PDF' : 'Upload Your First PDF'}
          </Button>
        </Box>
      </Grow>
    </Box>
  </Fade>
);

// Stats Component
const StatsOverview = ({ summaries, showContent }: { summaries: SummaryType[]; showContent: boolean }) => {
  const stats = useMemo(() => {
    const total = summaries.length;
    const types = [...new Set(summaries.map(s => s.documentType).filter(Boolean))].length;
    const thisMonth = summaries.filter(s => 
      new Date(s.createdAt).getMonth() === new Date().getMonth()
    ).length;
    const avgLength = summaries.length > 0 
      ? Math.round(summaries.reduce((acc, s) => acc + s.summary.length, 0) / summaries.length)
      : 0;

    return [
      { label: 'Total Documents', value: total, icon: Description, color: '#007AFF' },
      { label: 'Document Types', value: types, icon: Category, color: '#34C759' },
      { label: 'This Month', value: thisMonth, icon: TrendingUp, color: '#FF9500' },
      { label: 'Avg Summary Length', value: avgLength, icon: Speed, color: '#AF52DE', suffix: ' chars' }
    ];
  }, [summaries]);

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={6} sm={3} key={stat.label} {...({} as any)}>
          <Grow in={showContent} timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
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
                  borderColor: stat.color,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <stat.icon sx={{ fontSize: 24, color: stat.color, mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: stat.color }}>
                  {stat.value}{stat.suffix || ''}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {stat.label}
              </Typography>
            </Paper>
          </Grow>
        </Grid>
      ))}
    </Grid>
  );
};

export default function HistoryPage() {
  const [summaries, setSummaries] = useState<SummaryType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const { setUploading, setLoadingMessage } = useUpload();

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoadingMessage('Loading Document History...');
        setUploading(true);
        setError(null);
        
        const res = await axios.get('/api/summaries');
        
        // Handle the new response format
        if (res.data.summaries !== undefined) {
          setSummaries(res.data.summaries || []);
          if (res.data.error) {
            setError(res.data.error);
            console.warn('API Warning:', res.data.error);
          }
        } else {
          setSummaries(res.data || []);
        }
        
        // Delay content show for smooth animation
        setTimeout(() => setShowContent(true), 300);
      } catch (err) {
        console.error('Fetch summaries error:', err);
        setError('Failed to fetch summaries. Please try again.');
        toast.error('Failed to fetch summaries. Please try again.');
      } finally {
        setLoadingMessage('');
        setUploading(false);
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [setUploading, setLoadingMessage]);

  // Filter and sort summaries
  const filteredAndSortedSummaries = useMemo(() => {
    let filtered = summaries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(summary =>
        summary.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        summary.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(summary => summary.documentType === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.fileName.localeCompare(b.fileName);
        case 'type':
          return (a.documentType || '').localeCompare(b.documentType || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [summaries, searchTerm, filterType, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSummaries.length / itemsPerPage);
  const paginatedSummaries = filteredAndSortedSummaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique document types for filter
  const documentTypes = useMemo(() => {
    const types = [...new Set(summaries.map(s => s.documentType).filter(Boolean))];
    return types.sort();
  }, [summaries]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchTerm) || filterType !== 'all';

  if (loading) {
    return (
      <Box>
        <HistorySkeleton viewMode={viewMode} />
      </Box>
    );
  }

  return (
    <Fade in={showContent} timeout={800}>
      <Box sx={{ position: 'relative' }}>
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
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
              📚 Document History
            </Typography>
          </Slide>
          
          <Slide direction="up" in={showContent} timeout={800}>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 600,
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              Browse, search, and manage your AI-generated document summaries
            </Typography>
          </Slide>
        </Box>

        {error && (
          <Grow in timeout={600}>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          </Grow>
        )}

        {summaries.length > 0 && (
          <>
            {/* Stats Overview */}
            <StatsOverview summaries={summaries} showContent={showContent} />

            {/* Controls Section */}
            <Fade in={showContent} timeout={1000}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* Search */}
                  <Grid item xs={12} md={4} {...({} as any)}>
                    <TextField
                      fullWidth
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#007AFF',
                            }
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 4px 20px rgba(0, 122, 255, 0.1)',
                          }
                        }
                      }}
                    />
                  </Grid>

                  {/* Filter by Type */}
                  <Grid item xs={12} sm={6} md={2} {...({} as any)}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={filterType}
                        label="Type"
                        onChange={(e) => setFilterType(e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        {documentTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Sort */}
                  <Grid item xs={12} sm={6} md={2} {...({} as any)}>
                    <FormControl fullWidth>
                      <InputLabel>Sort</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sort"
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="newest">Newest First</MenuItem>
                        <MenuItem value="oldest">Oldest First</MenuItem>
                        <MenuItem value="name">Name A-Z</MenuItem>
                        <MenuItem value="type">By Type</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* View Mode Toggle */}
                  <Grid item xs={12} md={2} {...({} as any)}>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(_, newMode) => {
                        if (newMode && (newMode === 'grid' || newMode === 'list')) {
                          setViewMode(newMode);
                        }
                      }}
                      sx={{ width: '100%' }}
                    >
                      <ToggleButton value="grid" sx={{ flex: 1, borderRadius: '8px 0 0 8px' }}>
                        <ViewModule />
                      </ToggleButton>
                      <ToggleButton value="list" sx={{ flex: 1, borderRadius: '0 8px 8px 0' }}>
                        <ViewList />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>

                  {/* Clear Filters */}
                  <Grid item xs={12} md={2} {...({} as any)}>
                    {hasActiveFilters && (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={clearFilters}
                        startIcon={<FilterList />}
                        sx={{
                          borderRadius: 2,
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          }
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </Grid>
                </Grid>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {searchTerm && (
                      <Chip
                        label={`Search: "${searchTerm}"`}
                        onDelete={() => setSearchTerm('')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {filterType !== 'all' && (
                      <Chip
                        label={`Type: ${filterType}`}
                        onDelete={() => setFilterType('all')}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
              </Paper>
            </Fade>

            {/* Results Summary */}
            <Fade in={showContent} timeout={1200}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {paginatedSummaries.length} of {filteredAndSortedSummaries.length} documents
                  {hasActiveFilters && ` (filtered from ${summaries.length} total)`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Page {currentPage} of {totalPages}
                </Typography>
              </Box>
            </Fade>

            {/* Documents Grid/List */}
            {filteredAndSortedSummaries.length > 0 ? (
              <>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {paginatedSummaries.map((summary, index) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={viewMode === 'grid' ? 6 : 12} 
                      md={viewMode === 'grid' ? 4 : 12} 
                      key={summary._id}
                      {...({} as any)}
                    >
                      <Grow 
                        in={showContent} 
                        timeout={600} 
                        style={{ transitionDelay: `${1400 + (index * 100)}ms` }}
                      >
                        <Box>
                          <SummaryCard
                            fileName={summary.fileName}
                            summary={summary.summary}
                            createdAt={summary.createdAt}
                            documentType={summary.documentType}
                            processingMethod={summary.processingMethod}
                          />
                        </Box>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Fade in={showContent} timeout={1600}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }
                          }
                        }}
                      />
                    </Box>
                  </Fade>
                )}
              </>
            ) : (
              <EmptyState hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
            )}
          </>
        )}

        {summaries.length === 0 && (
          <EmptyState hasFilters={false} onClearFilters={clearFilters} />
        )}

        {/* Floating Action Button */}
        <Zoom in={showContent} timeout={1000}>
          <Fab
            color="primary"
            component={NextLink}
            href="/"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(45deg, #007AFF 30%, #34C759 90%)',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 8px 25px rgba(0, 122, 255, 0.4)',
              }
            }}
          >
            <Add />
          </Fab>
        </Zoom>
      </Box>
    </Fade>
  );
}
