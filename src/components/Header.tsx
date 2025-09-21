'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  Box,
  Fade,
  Slide,
  Chip,
  Avatar,
  Tooltip,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { 
  Brightness4, 
  Brightness7, 
  Analytics as AnalyticsIcon,
  History as HistoryIcon,
  CloudUpload,
  Insights as InsightsIcon,
  AutoAwesome,
  Circle,
  Brush
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useThemeToggle } from '@/theme/themeProvider';
import { useEffect, useState } from 'react';
import { useUpload } from '@/app/context/UploadContext';
import { useBranding } from '@/app/context/BrandingContext';

// Elevated AppBar Component with Scroll Effect
function ElevationScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const childProps = children.props as any;
  
  return React.cloneElement(children, {
    ...childProps,
    elevation: trigger ? 4 : 0,
    sx: {
      ...childProps.sx,
      backdropFilter: trigger ? 'blur(20px)' : 'none',
      backgroundColor: trigger 
        ? (theme: any) => theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)'
        : 'transparent',
      borderBottom: trigger ? '1px solid' : 'none',
      borderBottomColor: 'divider',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  } as any);
}

// Navigation Item Component
const NavItem = ({ 
  href, 
  label, 
  icon: Icon, 
  isActive, 
  disabled = false,
  branding
}: { 
  href: string; 
  label: string; 
  icon: any; 
  isActive: boolean; 
  disabled?: boolean;
  branding: any;
}) => (
  <Tooltip title={label} arrow placement="bottom">
    <Button
      component={NextLink}
      href={href}
      disabled={disabled}
      startIcon={<Icon sx={{ fontSize: 20 }} />}
      sx={{
        borderRadius: 3,
        px: 3,
        py: 1.5,
        minWidth: 'auto',
        position: 'relative',
        overflow: 'hidden',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.95rem',
        color: isActive ? 'white' : 'text.primary',
        backgroundColor: isActive 
          ? `linear-gradient(45deg, ${branding.colors.gradient.start} 30%, ${branding.colors.gradient.end} 90%)`
          : 'transparent',
        background: isActive 
          ? `linear-gradient(45deg, ${branding.colors.gradient.start} 30%, ${branding.colors.gradient.end} 90%)`
          : 'transparent',
        boxShadow: isActive 
          ? `0 4px 15px ${branding.colors.primary}50`
          : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transition: 'left 0.6s ease-in-out',
        },
        '&:hover': {
          transform: isActive ? 'translateY(-2px)' : 'translateY(-1px)',
          backgroundColor: isActive 
            ? undefined
            : (theme) => theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.08)' 
              : 'rgba(0,0,0,0.04)',
          boxShadow: isActive 
            ? '0 8px 25px rgba(0, 122, 255, 0.4)'
            : '0 4px 12px rgba(0,0,0,0.1)',
          '&::before': {
            left: '100%',
          }
        },
        '&:active': {
          transform: 'translateY(0px)',
        },
        '&:disabled': {
          opacity: 0.5,
          transform: 'none',
          '&:hover': {
            transform: 'none',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }
        }
      }}
    >
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        {label}
      </Box>
    </Button>
  </Tooltip>
);

// Loading Indicator Component
const LoadingIndicator = ({ uploading }: { uploading: boolean }) => (
  <Fade in={uploading} timeout={300}>
    <Chip
      icon={<Circle sx={{ fontSize: 8, animation: 'pulse 1.5s infinite' }} />}
      label="Processing..."
      size="small"
      sx={{
        backgroundColor: '#FF9500',
        color: 'white',
        fontWeight: 500,
        fontSize: '0.75rem',
        '& .MuiChip-icon': {
          color: 'white',
        },
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 },
        }
      }}
    />
  </Fade>
);

const Header = () => {
  const pathname = usePathname();
  const theme = useTheme();
  const { toggleTheme } = useThemeToggle();
  const { uploading } = useUpload();
  const { branding } = useBranding();
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setShowContent(true), 100);
  }, []);

  if (!mounted) return null;

  const showBranding = process.env.NEXT_PUBLIC_SHOW_BRANDING === 'true';
  
  const navItems = [
    { href: '/', label: 'Upload', icon: CloudUpload },
    { href: '/history', label: 'History', icon: HistoryIcon },
    { href: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
    { href: '/insights', label: 'Insights', icon: InsightsIcon },
    ...(showBranding ? [{ href: '/branding', label: 'Branding', icon: Brush }] : []),
  ];

  return (
    <ElevationScroll>
      <AppBar
        position="sticky"
        color="transparent"
        sx={{
          mb: 4,
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 70, sm: 80 },
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
          }}
        >
          {/* Logo Section */}
          <Slide direction="right" in={showContent} timeout={600}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: { xs: 1, sm: 0 } }}>
              <Avatar
                src={branding.logo.url || undefined}
                sx={{
                  width: branding.logo.size || 40,
                  height: branding.logo.size || 40,
                  background: branding.logo.url 
                    ? 'transparent' 
                    : `linear-gradient(45deg, ${branding.colors.gradient.start} 30%, ${branding.colors.gradient.end} 90%)`,
                  mr: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1) rotate(5deg)',
                    boxShadow: `0 8px 25px ${branding.colors.primary}50`,
                  }
                }}
                component={NextLink}
                href="/"
              >
                {!branding.logo.url && <AutoAwesome sx={{ fontSize: 24, color: 'white' }} />}
              </Avatar>
              
              <Box>
                <Typography 
                  variant="h5" 
                  component={NextLink}
                  href="/"
                  sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${branding.colors.gradient.start} 30%, ${branding.colors.gradient.end} 90%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    }
                  }}
                >
                  {branding.appName}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {branding.tagline}
                </Typography>
              </Box>
            </Box>
          </Slide>

          {/* Spacer */}
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />

          {/* Navigation Items */}
          <Fade in={showContent} timeout={800}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                display: { xs: 'none', md: 'flex' }
              }}
            >
              {navItems.map((item, index) => (
                <Slide 
                  key={item.href} 
                  direction="left" 
                  in={showContent} 
                  timeout={600}
                  style={{ transitionDelay: `${200 + (index * 100)}ms` }}
                >
                  <Box>
                    <NavItem
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={pathname === item.href}
                      disabled={uploading}
                      branding={branding}
                    />
                  </Box>
                </Slide>
              ))}
            </Stack>
          </Fade>

          {/* Mobile Navigation */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              display: { xs: 'flex', md: 'none' }
            }}
          >
            {navItems.map((item, index) => (
              <Zoom 
                key={item.href} 
                in={showContent} 
                timeout={400}
                style={{ transitionDelay: `${300 + (index * 100)}ms` }}
              >
                <Box>
                  <Tooltip title={item.label} arrow>
                    <IconButton
                      component={NextLink}
                      href={item.href}
                      disabled={uploading}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        backgroundColor: pathname === item.href 
                          ? branding.colors.primary
                          : 'transparent',
                        color: pathname === item.href 
                          ? 'white'
                          : 'text.primary',
                        transition: 'all 0.3s ease-in-out',
                                                  '&:hover': {
                            backgroundColor: pathname === item.href 
                              ? `${branding.colors.primary}CC`
                              : (theme) => theme.palette.mode === 'dark' 
                                ? 'rgba(255,255,255,0.08)' 
                                : 'rgba(0,0,0,0.04)',
                            transform: 'scale(1.1)',
                          }
                      }}
                    >
                      <item.icon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Zoom>
            ))}
          </Stack>

          {/* Right Section */}
          <Slide direction="left" in={showContent} timeout={800}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 2 }}>
              {/* Loading Indicator */}
              <LoadingIndicator uploading={uploading} />

              {/* Theme Toggle */}
              <Tooltip title={`Switch to ${theme.palette.mode === 'dark' ? 'light' : 'dark'} mode`} arrow>
                <IconButton 
                  onClick={toggleTheme} 
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.12)' 
                        : 'rgba(0,0,0,0.08)',
                      transform: 'scale(1.1) rotate(180deg)',
                    }
                  }}
                >
                  {theme.palette.mode === 'dark' ? (
                    <Brightness7 sx={{ fontSize: 20 }} />
                  ) : (
                    <Brightness4 sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          </Slide>
        </Toolbar>
      </AppBar>
    </ElevationScroll>
  );
};

export default Header;
