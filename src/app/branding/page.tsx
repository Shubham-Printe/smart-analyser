'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
  Fade,
  Grow,
  Slide,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  CloudUpload,
  Palette,
  RestartAlt,
  Save,
  PhotoCamera,
  Delete,
  AutoAwesome,
  Settings,
} from '@mui/icons-material';
import { useBranding } from '@/app/context/BrandingContext';

// Color Picker Component
const ColorPicker = ({ 
  label, 
  value, 
  onChange, 
  disabled = false 
}: { 
  label: string; 
  value: string; 
  onChange: (color: string) => void; 
  disabled?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body2" sx={{ minWidth: 100, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{
          width: 50,
          height: 50,
          borderRadius: 2,
          backgroundColor: value,
          border: '3px solid',
          borderColor: 'divider',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': disabled ? {} : {
            transform: 'scale(1.1)',
            borderColor: 'primary.main',
            boxShadow: `0 4px 15px ${value}40`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.6s ease-in-out',
          },
          '&:hover::after': disabled ? {} : {
            left: '100%',
          }
        }}
      >
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </Box>
      <TextField
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        sx={{ width: 100 }}
        inputProps={{
          style: { fontSize: '0.875rem', fontFamily: 'monospace' }
        }}
      />
    </Box>
  );
};

// Logo Upload Component
const LogoUpload = () => {
  const { branding, updateLogo, isLoading } = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await updateLogo(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await updateLogo(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: '2px dashed',
        borderColor: 'divider',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'rgba(0, 122, 255, 0.02)',
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {branding.logo.url ? (
        <Stack spacing={2} alignItems="center">
          <Avatar
            src={branding.logo.url}
            sx={{
              width: 80,
              height: 80,
              border: '3px solid',
              borderColor: 'primary.main',
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {branding.logo.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<PhotoCamera />}
              variant="outlined"
              size="small"
              disabled={isLoading}
            >
              Change Logo
            </Button>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement remove logo
              }}
            >
              <Delete />
            </IconButton>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={2} alignItems="center">
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography variant="h6" fontWeight={600}>
            Upload Your Logo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag & drop an image or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supports PNG, JPG, SVG • Max 5MB
          </Typography>
        </Stack>
      )}
    </Paper>
  );
};

// Preview Component
const BrandingPreview = () => {
  const { branding } = useBranding();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: `linear-gradient(135deg, ${branding.colors.gradient.start}15, ${branding.colors.gradient.end}15)`,
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight={600}>
        🎨 Live Preview
      </Typography>
      
      {/* Header Preview */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          src={branding.logo.url || undefined}
          sx={{
            width: branding.logo.size,
            height: branding.logo.size,
            background: branding.logo.url 
              ? 'transparent' 
              : `linear-gradient(45deg, ${branding.colors.gradient.start}, ${branding.colors.gradient.end})`,
          }}
        >
          {!branding.logo.url && <AutoAwesome />}
        </Avatar>
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${branding.colors.gradient.start}, ${branding.colors.gradient.end})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {branding.appName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {branding.tagline}
          </Typography>
        </Box>
      </Paper>

      {/* Color Swatches */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {Object.entries(branding.colors).map(([key, value]) => {
          if (key === 'gradient') return null;
          return (
            <Chip
              key={key}
              label={key}
              size="small"
              sx={{
                backgroundColor: value,
                color: 'white',
                fontWeight: 500,
                '& .MuiChip-label': {
                  textTransform: 'capitalize',
                }
              }}
            />
          );
        })}
      </Stack>
    </Paper>
  );
};

export default function BrandingPage() {
  const { branding, updateColors, updateAppInfo, resetToDefault, saveBranding, isLoading } = useBranding();
  const [showContent, setShowContent] = useState(false);
  const [localAppName, setLocalAppName] = useState(branding.appName);
  const [localTagline, setLocalTagline] = useState(branding.tagline);

  React.useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  React.useEffect(() => {
    setLocalAppName(branding.appName);
    setLocalTagline(branding.tagline);
  }, [branding.appName, branding.tagline]);

  const handleSaveAppInfo = () => {
    updateAppInfo({
      appName: localAppName,
      tagline: localTagline,
    });
  };

  const presetColors = [
    { name: 'Ocean Blue', primary: '#007AFF', secondary: '#34C759', accent: '#FF9500' },
    { name: 'Purple Haze', primary: '#AF52DE', secondary: '#FF2D92', accent: '#FF9500' },
    { name: 'Sunset', primary: '#FF6B35', secondary: '#F7931E', accent: '#FFD23F' },
    { name: 'Forest', primary: '#28A745', secondary: '#20C997', accent: '#FFC107' },
    { name: 'Midnight', primary: '#6C757D', secondary: '#495057', accent: '#FD7E14' },
    { name: 'Cherry', primary: '#DC3545', secondary: '#E83E8C', accent: '#FD7E14' },
  ];

  return (
    <Fade in={showContent} timeout={800}>
      <Box>
        <Slide direction="down" in={showContent} timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              🎨 Custom Branding
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customize your app&apos;s appearance with your own logo, colors, and branding
            </Typography>
            {process.env.NEXT_PUBLIC_SHOW_BRANDING !== 'true' && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={500}>
                  🔧 Developer Mode
                </Typography>
                <Typography variant="body2">
                  This branding page is hidden from regular users. Access methods:
                  <br />• Direct URL: <code>/branding</code>
                  <br />• Keyboard shortcut: <code>Ctrl/Cmd + Shift + B</code>
                </Typography>
              </Alert>
            )}
          </Box>
        </Slide>

        <Grid container spacing={4}>
          {/* Left Column - Configuration */}
          <Grid item xs={12} lg={8} {...({} as any)}>
            <Stack spacing={4}>
              {/* Logo Section */}
              <Grow in={showContent} timeout={800} style={{ transitionDelay: '200ms' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CloudUpload sx={{ color: 'primary.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        Logo Upload
                      </Typography>
                    </Box>
                    <LogoUpload />
                  </Stack>
                </Paper>
              </Grow>

              {/* App Information */}
              <Grow in={showContent} timeout={800} style={{ transitionDelay: '400ms' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Settings sx={{ color: 'primary.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        App Information
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} {...({} as any)}>
                        <TextField
                          fullWidth
                          label="App Name"
                          value={localAppName}
                          onChange={(e) => setLocalAppName(e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} {...({} as any)}>
                        <TextField
                          fullWidth
                          label="Tagline"
                          value={localTagline}
                          onChange={(e) => setLocalTagline(e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                    <Button
                      variant="contained"
                      onClick={handleSaveAppInfo}
                      disabled={isLoading}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Update App Info
                    </Button>
                  </Stack>
                </Paper>
              </Grow>

              {/* Color Customization */}
              <Grow in={showContent} timeout={800} style={{ transitionDelay: '600ms' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Palette sx={{ color: 'primary.main' }} />
                      <Typography variant="h5" fontWeight={600}>
                        Color Scheme
                      </Typography>
                    </Box>

                    {/* Color Presets */}
                    <Box>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        Quick Presets
                      </Typography>
                      <Grid container spacing={2}>
                        {presetColors.map((preset) => (
                          <Grid item xs={6} sm={4} md={3} key={preset.name} {...({} as any)}>
                            <Card
                              sx={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: 4,
                                }
                              }}
                              onClick={() => updateColors({
                                primary: preset.primary,
                                secondary: preset.secondary,
                                accent: preset.accent,
                                gradient: {
                                  start: preset.primary,
                                  end: preset.secondary,
                                }
                              })}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack spacing={1}>
                                  <Typography variant="body2" fontWeight={600} textAlign="center">
                                    {preset.name}
                                  </Typography>
                                  <Stack direction="row" spacing={0.5} justifyContent="center">
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 1,
                                        backgroundColor: preset.primary,
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 1,
                                        backgroundColor: preset.secondary,
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 1,
                                        backgroundColor: preset.accent,
                                      }}
                                    />
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Custom Colors */}
                    <Box>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        Custom Colors
                      </Typography>
                      <Stack spacing={3}>
                        <ColorPicker
                          label="Primary"
                          value={branding.colors.primary}
                          onChange={(color) => updateColors({ 
                            primary: color,
                            gradient: { ...branding.colors.gradient, start: color }
                          })}
                          disabled={isLoading}
                        />
                        <ColorPicker
                          label="Secondary"
                          value={branding.colors.secondary}
                          onChange={(color) => updateColors({ 
                            secondary: color,
                            gradient: { ...branding.colors.gradient, end: color }
                          })}
                          disabled={isLoading}
                        />
                        <ColorPicker
                          label="Accent"
                          value={branding.colors.accent}
                          onChange={(color) => updateColors({ accent: color })}
                          disabled={isLoading}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Grow>
            </Stack>
          </Grid>

          {/* Right Column - Preview & Actions */}
          <Grid item xs={12} lg={4} {...({} as any)}>
            <Stack spacing={4}>
              {/* Live Preview */}
              <Grow in={showContent} timeout={800} style={{ transitionDelay: '800ms' }}>
                <Box>
                  <BrandingPreview />
                </Box>
              </Grow>

              {/* Action Buttons */}
              <Grow in={showContent} timeout={800} style={{ transitionDelay: '1000ms' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={600}>
                      Actions
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={saveBranding}
                      disabled={isLoading}
                      fullWidth
                      sx={{
                        background: `linear-gradient(45deg, ${branding.colors.gradient.start}, ${branding.colors.gradient.end})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${branding.colors.gradient.start}CC, ${branding.colors.gradient.end}CC)`,
                        }
                      }}
                    >
                      Save Branding
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RestartAlt />}
                      onClick={resetToDefault}
                      disabled={isLoading}
                      fullWidth
                      color="warning"
                    >
                      Reset to Default
                    </Button>
                  </Stack>
                </Paper>
              </Grow>

              {/* Tips */}
              <Grow in={showContent} timeout={800} style={{ transitionDelay: '1200ms' }}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 3,
                    '& .MuiAlert-icon': {
                      fontSize: 20,
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    💡 Pro Tips
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    • Use high-resolution logos (PNG/SVG recommended)
                    • Ensure good contrast between colors
                    • Test your branding in both light and dark modes
                  </Typography>
                </Alert>
              </Grow>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
} 