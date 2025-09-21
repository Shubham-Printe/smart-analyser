'use client';

import { CircularProgress, Box, Fade, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useUpload } from '@/app/context/UploadContext';

export default function GlobalLoader() {
  const { uploading, loadingMessage, uploadSuccess } = useUpload();

  return (
    <Fade in={uploading} timeout={{ enter: 300, exit: 300 }} unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255,255,255,0.7)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {uploadSuccess ? (
          <>
            <CheckCircleOutline sx={{ fontSize: 60, color: 'green' }} />
            <Typography variant="h6" mt={2}>Uploaded Successfully!</Typography>
          </>
        ) : (
          <>
            <CircularProgress size={60} />
            <Typography variant="body1" mt={2}>
              {loadingMessage || 'Loading...'}
            </Typography>
          </>
        )}
      </Box>
    </Fade>
  );
}
