'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const KeyboardShortcuts = () => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + B = Access Branding (when hidden)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'B') {
        event.preventDefault();
        
        if (process.env.NEXT_PUBLIC_SHOW_BRANDING !== 'true') {
          toast.success('🎨 Accessing hidden branding page...', {
            duration: 2000,
            style: {
              background: '#007AFF',
              color: 'white',
            },
          });
        }
        
        router.push('/branding');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts; 