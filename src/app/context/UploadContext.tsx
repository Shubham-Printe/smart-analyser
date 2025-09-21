'use client';

import { createContext, useContext, useState } from 'react';

const UploadContext = createContext<{
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
  uploadSuccess: boolean;
  setUploadSuccess: (success: boolean) => void;
}>({
  uploading: false,
  setUploading: () => {},
  loadingMessage: '',
  setLoadingMessage: () => {},
  uploadSuccess: false,
  setUploadSuccess: () => {},
});

export const useUpload = () => useContext(UploadContext);

export const UploadProvider = ({ children }: { children: React.ReactNode }) => {
  const [uploading, setUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  return (
    <UploadContext.Provider value={{
      uploading, setUploading,
      loadingMessage, setLoadingMessage,
      uploadSuccess, setUploadSuccess
    }}>
      {children}
    </UploadContext.Provider>
  );
};
