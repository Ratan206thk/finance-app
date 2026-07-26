import React, { useState } from 'react';

interface NavigationProps {}

const tabs = [
  { id: 'overview', label: 'Overview', num: '01' },
  { id: 'income', label: 'Income & Tax', num: '02' },
  { id: 'equity', label: 'RSU & ESPP', num: '03' },
  { id: 'cash', label: 'Cash Buckets', num: '04' },
  { id: 'portfolio', label: 'Portfolio (SIP)', num: '05' },
  { id: 'house', label: 'House Goal', num: '06' },
  { id: 'projection', label: 'Projection', num: '07' },
  { id: 'accounts', label: 'Accounts', num: '08' },
  { id: 'ledger', label: 'Monthly Ledger', num: '09' },
  { id: 'lenden', label: 'Lenden', num: '10' },
  { id: 'insurance', label: 'Insurance', num: '11' },
];

export default function Navigation({}: NavigationProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Dispatch custom event to update Layout
    window.dispatchEvent(new CustomEvent('tab-changed', { detail: { tabId } }));
  };

  return (
    <nav>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.id)}
          data-tab={tab.id}
        >
          <span className="num">{tab.num}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
