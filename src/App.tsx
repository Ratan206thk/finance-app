import React, { useEffect, useState } from 'react';
import { AppProvider, useAppState } from './store/Store';
import Navigation from './components/Navigation';
import Layout from './components/Layout';
import {
  initFirebase,
  startRealtimeSync,
} from './services/firebaseService';
import {
  loadStateLocally,
  saveStateLocally,
  markAsSaved,
} from './services/persistenceService';
import './App.css';

function AppContent() {
  const { state, setState } = useAppState();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Initialize app
  useEffect(() => {
    const init = async () => {
      // Initialize Firebase
      initFirebase();

      // Load from localStorage
      const savedState = loadStateLocally();
      if (savedState) {
        setState(savedState);
      }

      // Start real-time sync
      startRealtimeSync(
        (syncedState) => {
          setState(syncedState);
          setSaveStatus('Synced ✓');
          markAsSaved(syncedState);
        },
        (err) => {
          console.error('Sync error:', err);
          setSaveStatus('⚠ Sync error (using local cache)');
        }
      );

      setLoading(false);
    };

    init();
  }, [setState]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-mark">₹</div>
          <div>
            <h1>The Ledger</h1>
            <p>Personal Finance Command Center</p>
          </div>
        </div>
        <div className="seal">
          <div className="label">Total Net Worth</div>
          <div className="value mono" id="headerNetWorth">
            ₹0
          </div>
        </div>
      </header>

      <div className="layout">
        <Navigation />
        <Layout saveStatus={saveStatus} setSaveStatus={setSaveStatus} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
