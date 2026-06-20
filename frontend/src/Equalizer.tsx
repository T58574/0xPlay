import React, { useState, useEffect } from 'react';
import { SetEQEnabled, SetEQBand } from '../wailsjs/go/main/App';

const BANDS = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
const BAND_LABELS = ['60', '170', '310', '600', '1k', '3k', '6k', '12k', '14k', '16k'];

interface EqualizerProps {
    activeSlot: number;
}

export const Equalizer: React.FC<EqualizerProps> = ({ activeSlot }) => {
    // We maintain EQ state per slot
    const [enabled, setEnabled] = useState<{ [slot: number]: boolean }>({ 0: false, 1: false });
    const [gains, setGains] = useState<{ [slot: number]: number[] }>({
        0: new Array(10).fill(0),
        1: new Array(10).fill(0)
    });

    useEffect(() => {
        // When EQ is toggled, send the state to the backend
        SetEQEnabled(activeSlot, enabled[activeSlot] || false);
        // Also apply current gains
        const currentGains = gains[activeSlot] || new Array(10).fill(0);
        currentGains.forEach((gain, index) => {
            SetEQBand(activeSlot, index, gain);
        });
    }, [activeSlot, enabled[activeSlot]]); // Re-run when slot changes or enable toggles

    const handleToggle = () => {
        const newEnabled = !enabled[activeSlot];
        setEnabled(prev => ({ ...prev, [activeSlot]: newEnabled }));
        SetEQEnabled(activeSlot, newEnabled);
    };

    const handleGainChange = (index: number, newGain: number) => {
        const newGainsForSlot = [...(gains[activeSlot] || new Array(10).fill(0))];
        newGainsForSlot[index] = newGain;
        setGains(prev => ({ ...prev, [activeSlot]: newGainsForSlot }));
        SetEQBand(activeSlot, index, newGain);
    };

    const currentGains = gains[activeSlot] || new Array(10).fill(0);
    const isEnabled = enabled[activeSlot] || false;

    return (
        <div className="equalizer-container" style={{
            backgroundColor: '#1c1c1e',
            borderRadius: '12px',
            padding: '24px',
            color: '#fff',
            fontFamily: 'sans-serif',
            width: 'fit-content'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Эквалайзер</h2>
                <div
                    onClick={handleToggle}
                    style={{
                        width: '48px',
                        height: '24px',
                        backgroundColor: isEnabled ? '#ffeb3b' : '#333',
                        borderRadius: '12px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                >
                    <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: isEnabled ? '#000' : '#888',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: isEnabled ? '26px' : '2px',
                        transition: 'left 0.3s, background-color 0.3s'
                    }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '150px', fontSize: '12px', color: '#888', paddingRight: '8px' }}>
                    <span>12dB</span>
                    <span>0dB</span>
                    <span>-12dB</span>
                    <span style={{ visibility: 'hidden' }}>00</span> {/* Spacer for alignment with bottom labels */}
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    {BANDS.map((_, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ position: 'relative', height: '150px', width: '2px', backgroundColor: '#333' }}>
                                <input
                                    type="range"
                                    min="-12"
                                    max="12"
                                    step="0.1"
                                    value={currentGains[index]}
                                    onChange={(e) => handleGainChange(index, parseFloat(e.target.value))}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%) rotate(-90deg)',
                                        width: '150px',
                                        height: '20px',
                                        appearance: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    className="eq-slider"
                                />
                                <style>{`
                                    .eq-slider::-webkit-slider-thumb {
                                        appearance: none;
                                        width: 16px;
                                        height: 16px;
                                        border-radius: 50%;
                                        background: #333;
                                        border: 2px solid ${isEnabled ? '#ffeb3b' : '#888'};
                                        cursor: pointer;
                                    }
                                    .eq-slider::-moz-range-thumb {
                                        width: 16px;
                                        height: 16px;
                                        border-radius: 50%;
                                        background: #333;
                                        border: 2px solid ${isEnabled ? '#ffeb3b' : '#888'};
                                        cursor: pointer;
                                    }
                                `}</style>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
                <div style={{ fontSize: '12px', color: '#888', width: '50px' }}>
                    уровень
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    {BAND_LABELS.map((label, index) => (
                        <div key={index} style={{ width: '16px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
