import React from 'react';
import { ThemeConfig } from '../types';

interface AudioDevice {
    name: string;
    id: string;
    isDefault: boolean;
}

interface SettingsViewProps {
    themes: Record<string, ThemeConfig>;
    currentTheme: string;
    setCurrentTheme: (theme: string) => void;
    crossfadeDuration: number;
    handleCrossfadeChange: (val: number) => Promise<void>;
    musicDir: string;
    audioDevices: AudioDevice[];
    selectedDevice: string;
    handleDeviceChange: (id: string) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
    themes,
    currentTheme,
    setCurrentTheme,
    crossfadeDuration,
    handleCrossfadeChange,
    musicDir,
    audioDevices,
    selectedDevice,
    handleDeviceChange
}) => {
    return (
        <div className="settings-view">
            <header className="settings-header">
                <h1>App Settings</h1>
                <p>Customize your 0xSoundPlayer experience and theme styles</p>
            </header>

            <section className="settings-section">
                <h3 className="settings-section-title">Color Palette Theme</h3>
                <div className="themes-grid-large">
                    {Object.keys(themes).map((tKey) => {
                        const th = themes[tKey];
                        const isActive = currentTheme === tKey;
                        return (
                            <div 
                                key={tKey} 
                                className={`theme-card ${isActive ? 'active' : ''}`}
                                onClick={() => setCurrentTheme(tKey)}
                            >
                                <div className="theme-card-header">
                                    <span className="theme-card-title">{tKey}</span>
                                    <div className="theme-color-preview">
                                        <span className="color-preview-dot" style={{ backgroundColor: th.accent }}></span>
                                        <span className="color-preview-dot" style={{ backgroundColor: th.bg }}></span>
                                    </div>
                                </div>
                                <span className="theme-card-desc">
                                    {tKey === 'saas' ? 'Modern SaaS & Dark Dashboard' : 
                                     tKey === 'neutrals' ? 'Elevated Neutrals (Light Mode)' : 
                                     tKey === 'fintech' ? 'Fintech & AI Innovation' : 
                                     tKey === 'trust' ? 'Classic Trust (Light Mode)' : 
                                     'Eco-Digital & Wellness'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="settings-section">
                <h3 className="settings-section-title">Audio & Transitions</h3>
                <div className="settings-item">
                    <div className="settings-item-info">
                        <span className="settings-item-label">Auto-Mix Crossfade Duration</span>
                        <span className="settings-item-desc">Adjust the crossfade time between tracks when Auto-Mix is active.</span>
                    </div>
                    <div className="settings-item-control">
                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="1"
                            value={crossfadeDuration}
                            onChange={(e) => handleCrossfadeChange(parseFloat(e.target.value))}
                            className="slider"
                            style={{
                                background: `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${((crossfadeDuration - 1) / 19) * 100}%, var(--border-color) ${((crossfadeDuration - 1) / 19) * 100}%, var(--border-color) 100%)`
                            }}
                        />
                        <span className="settings-item-badge">{crossfadeDuration}s</span>
                    </div>
                </div>

                <div className="settings-item" style={{ marginTop: '24px' }}>
                    <div className="settings-item-info">
                        <span className="settings-item-label">Audio Output Device</span>
                        <span className="settings-item-desc">Route playback audio stream to a custom hardware device.</span>
                    </div>
                    <div className="settings-item-control">
                        <select
                            value={selectedDevice}
                            onChange={(e) => handleDeviceChange(e.target.value)}
                            className="settings-device-select"
                        >
                            {audioDevices.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="settings-section">
                <h3 className="settings-section-title">System & Storage</h3>
                <div className="settings-info-grid">
                    <div className="info-item">
                        <span className="info-label">Audio Sample Rate</span>
                        <span className="info-value">44100 Hz</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Playback Channels</span>
                        <span className="info-value">2 (Stereo)</span>
                    </div>
                    <div className="info-item" style={{ gridColumn: 'span 2' }}>
                        <span className="info-label">Library Directory Path</span>
                        <span className="info-value" style={{ fontSize: '11px', wordBreak: 'break-all' }}>{musicDir}</span>
                    </div>
                </div>
            </section>
        </div>
    );
};
