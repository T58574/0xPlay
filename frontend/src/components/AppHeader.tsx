import React from 'react';
import { BoltIcon, FolderIcon, LoadIcon, SettingsIcon } from './Icons';
import { ThemeConfig } from '../types';

interface AppHeaderProps {
    activeTab: 'library' | 'decks' | 'settings' | 'search';
    setActiveTab: (tab: 'library' | 'decks' | 'settings' | 'search') => void;
    handleSelectDirectory: () => void;
    handleScan: () => void;
    themes: Record<string, ThemeConfig>;
    currentTheme: string;
    setCurrentTheme: (theme: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    activeTab,
    setActiveTab,
    handleSelectDirectory,
    handleScan,
    themes,
    currentTheme,
    setCurrentTheme
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

            <div className="header-center">
                <div className="header-theme-selector">
                    <span className="header-theme-title">Palette</span>
                    <div className="theme-buttons-grid">
                        {Object.keys(themes).map((tKey) => {
                            const th = themes[tKey];
                            return (
                                <button
                                    key={tKey}
                                    className={`theme-dot-btn ${currentTheme === tKey ? 'active' : ''}`}
                                    style={{ backgroundColor: th.accent }}
                                    onClick={() => setCurrentTheme(tKey)}
                                    title={tKey}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

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
