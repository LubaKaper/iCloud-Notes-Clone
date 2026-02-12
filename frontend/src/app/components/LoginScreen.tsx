import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { googleAuth } from '../../utils/api';

// GIS (Google Identity Services) is loaded via CDN script in index.html
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: { theme: string; size: string; width: number }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function LoginScreen() {
  const { login } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set');
      return;
    }

    // Wait for GIS script to load if not ready yet
    const init = () => {
      if (!window.google?.accounts?.id) {
        setTimeout(init, 100);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            const { token, user } = await googleAuth(response.credential);
            login(token, user);
          } catch (err) {
            console.error('Google sign-in failed:', err);
          }
        },
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 200,
        });
      }
    };

    init();
  }, [login]);

  return (
    <div className="relative min-h-screen bg-[#1c1c1c] flex flex-col items-center justify-center px-6">

      {/* iCloud top-left branding */}
      <div className="absolute top-4 left-6">
        <span className="text-white text-lg font-normal tracking-wide">iCloud</span>
      </div>

      <div className="flex flex-col items-center text-center max-w-sm">

        {/* Apple Notes Icon */}
        <div
          className="w-24 h-24 rounded-[22px] flex flex-col justify-center items-center gap-2 shadow-xl"
          style={{ background: 'linear-gradient(180deg, #ffd60a 0%, #f5a623 100%)' }}
        >
          {/* Top yellow strip (lighter) */}
          <div className="w-16 h-3 bg-[#ffeaa0] rounded-sm opacity-80" />
          {/* Lined paper lines */}
          <div className="flex flex-col gap-1.5 w-14">
            <div className="h-0.5 bg-[#a06a00] rounded-full opacity-60" />
            <div className="h-0.5 bg-[#a06a00] rounded-full opacity-60" />
            <div className="h-0.5 bg-[#a06a00] rounded-full opacity-60" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-7 text-white font-bold tracking-tight" style={{ fontSize: '3.5rem', lineHeight: 1.05 }}>
          Notes
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-white text-base font-semibold leading-relaxed opacity-90">
          Capture thoughts or detailed notes. Your notes are always up to date on any device and on the web.
        </p>

        {/* Sign In — GIS button rendered inside, styled button on top */}
        <div className="relative mt-10 w-[240px] h-[48px]">
          {/* Real GIS button — invisible but clickable, explicit size so iframe renders */}
          <div
            ref={buttonRef}
            className="opacity-0 absolute inset-0 z-10 rounded-full"
          />
          {/* Visible styled button */}
          <div className="absolute inset-0 bg-white text-[#1c1c1c] font-medium text-base rounded-full flex items-center justify-center select-none pointer-events-none">
            Sign In
          </div>
        </div>

      </div>
    </div>
  );
}
