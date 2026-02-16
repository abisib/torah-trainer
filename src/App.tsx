import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { StatusBar, Style } from '@capacitor/status-bar';
import Home from './pages/Home';
import BookView from './pages/BookView';
import Trainer from './components/Trainer';
import { SettingsProvider } from './contexts/SettingsContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/book/:bookId",
    element: <BookView />,
  },
  {
    path: "/read/:parashaId",
    element: <Trainer />,
  },
]);

function App() {
  useEffect(() => {
    // Initialize Native Features
    if (Capacitor.isNativePlatform()) {
      const initNative = async () => {
        try {
          // 1. Keep Screen On
          await KeepAwake.keepAwake();
          
          // 2. Status Bar Style (Dark text for light background)
          await StatusBar.setStyle({ style: Style.Light });
          
          // Optional: Set specific background color if needed, 
          // or transparent if we want the app bg to show through (requires overlay config)
          if (Capacitor.getPlatform() === 'android') {
             await StatusBar.setBackgroundColor({ color: '#f8fafc' }); // Matches slate-50
          }
        } catch (err) {
          console.error('Native initialization failed:', err);
        }
      };
      
      initNative();
    }
  }, []);

  return (
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  );
}

export default App;
