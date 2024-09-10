// Tabs.js
import React, { useState } from 'react';
import './Tabs.css';  // Archivo CSS para los estilos de las pestañas

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(Object.keys(tabs)[0]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="tabs-container">
      <div className="tabs">
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs[activeTab]}
      </div>
    </div>
  );
};

export default Tabs;
