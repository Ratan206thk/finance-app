import React, { useState, useEffect } from 'react';
import { useAppState } from '../store/Store';
import { saveStateLocally, markAsSaved, exportData, importData } from '../services/persistenceService';
import { writeToFirestore } from '../services/firebaseService';
import Overview from './tabs/Overview';
import Income from './tabs/Income';
import Equity from './tabs/Equity';
import Cash from './tabs/Cash';
import Portfolio from './tabs/Portfolio';
import House from './tabs/House';
import Projection from './tabs/Projection';
import Accounts from './tabs/Accounts';
import Ledger from './tabs/Ledger';
import Lenden from './tabs/Lenden';
import Insurance from './tabs/Insurance';

interface LayoutProps {
  saveStatus: string;
  setSaveStatus: (status: string) => void;
}

const tabs = ['overview', 'income', 'equity', 'cash', 'portfolio', 'house', 'projection', 'accounts', 'ledger', 'lenden', 'insurance'];

export default function Layout({ saveStatus, setSaveStatus }: LayoutProps) {
  const { state, isDirty } = useAppState();
  const [activeTab, setActiveTab] = useState('overview');

  // Listen for tab change events
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const event = e as CustomEvent<{ tabId: string }>;
      setActiveTab(event.detail.tabId);
    };

    window.addEventListener('tab-changed', handleTabChange);
    return () => window.removeEventListener('tab-changed', handleTabChange);
  }, []);

  const handleSave = async () => {
    try {
      setSaveStatus('Saving...');
      saveStateLocally(state);
      markAsSaved(state);

      // Try to sync with Firebase
      try {
        await writeToFirestore(state);
        setSaveStatus('Saved ✓ ' + new Date().toLocaleTimeString());
      } catch (e) {
        setSaveStatus('Saved locally ✓ (cloud sync failed)');
      }
    } catch (error) {
      console.error('Save failed', error);
      setSaveStatus('⚠ Save error');
    }
  };

  const handleExport = () => {
    exportData(state);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedState = await importData(file);
      // This would need to dispatch to update the app state
      alert('Backup imported! Please refresh the page.');
      e.target.value = '';
    } catch (error) {
      alert('Failed to import backup.');
    }
  };

  return (
    <main>
      {/* Overview */}
      <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
        <Overview />
      </div>

      {/* Income & Tax */}
      <div style={{ display: activeTab === 'income' ? 'block' : 'none' }}>
        <Income />
      </div>

      {/* RSU & ESPP */}
      <div style={{ display: activeTab === 'equity' ? 'block' : 'none' }}>
        <Equity />
      </div>

      {/* Cash Buckets */}
      <div style={{ display: activeTab === 'cash' ? 'block' : 'none' }}>
        <Cash />
      </div>

      {/* Portfolio */}
      <div style={{ display: activeTab === 'portfolio' ? 'block' : 'none' }}>
        <Portfolio />
      </div>

      {/* House Goal */}
      <div style={{ display: activeTab === 'house' ? 'block' : 'none' }}>
        <House />
      </div>

      {/* Projection */}
      <div style={{ display: activeTab === 'projection' ? 'block' : 'none' }}>
        <Projection />
      </div>

      {/* Accounts */}
      <div style={{ display: activeTab === 'accounts' ? 'block' : 'none' }}>
        <Accounts />
      </div>

      {/* Ledger */}
      <div style={{ display: activeTab === 'ledger' ? 'block' : 'none' }}>
        <Ledger />
      </div>

      {/* Lenden */}
      <div style={{ display: activeTab === 'lenden' ? 'block' : 'none' }}>
        <Lenden />
      </div>

      {/* Insurance */}
      <div style={{ display: activeTab === 'insurance' ? 'block' : 'none' }}>
        <Insurance />
      </div>

      {/* Test Debug */}
      <div style={{ padding: '20px', color: 'red', fontWeight: 'bold' }}>
        Active Tab: {activeTab}
      </div>

      {/* Footer */}
      <div className="footer-note">
        All figures are planning estimates based on inputs you control. Not financial, legal, or tax advice — verify with a licensed advisor.
        <br />
        <button
          className="btn"
          id="saveBtn"
          onClick={handleSave}
          disabled={!isDirty()}
          style={{ marginTop: '12px' }}
        >
          Save
        </button>
        <span id="saveStatus" style={{ color: 'var(--teal)', marginLeft: '8px' }}>
          {saveStatus}
        </span>
        &nbsp;·&nbsp;
        <button className="btn ghost small" onClick={handleExport} style={{ marginLeft: '8px' }}>
          Export Backup (.json)
        </button>
        &nbsp;
        <button
          className="btn ghost small"
          onClick={() => document.getElementById('importFile')?.click()}
          style={{ marginLeft: '8px' }}
        >
          Import Backup
        </button>
        <input
          type="file"
          id="importFile"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>
    </main>
  );
}
