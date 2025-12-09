'use client';

import { useEffect, useState } from 'react';

export function NoSSR({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use a timeout to avoid cascading renders
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export default NoSSR;