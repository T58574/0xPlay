import React from 'react';
import { BoltIcon, FolderIcon, LoadIcon, SettingsIcon } from './Icons';

interface AppHeaderProps {
    activeTab: 'library' | 'decks' | 'settings' | 'search';
    setActiveTab: (tab: 'library' | 'decks' | 'settings' | 'search') => void;
    handleSelectDirectory: () => void;
    handleScan: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    activeTab,
    setActiveTab,
    handleSelectDirectory,
    handleScan
}) => {
    return (
        <header className="app-header">
            <div className="header-left">
                <button className="header-btn brand-btn" onClick={() => setActiveTab('library')}>
                    <BoltIcon />
                </button>
                <button className="header-btn" onClick={handleSelectDirectory}>
                    <FolderIcon />
                    <span>Open Folder</span>
                </button>
                <button className="header-btn" onClick={handleScan}>
                    <LoadIcon />
                    <span>Scan Folder</span>
                </button>
            </div>

            <div className="header-center" />

            <div className="header-right">
                <button
                    className={`settings-toggle-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'settings' ? 'library' : 'settings')}
                    title="Settings"
                >
                    <SettingsIcon />
                </button>
            </div>
        </header>
    );
};
