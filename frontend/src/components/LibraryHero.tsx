import React from 'react';
import { TrackInfo } from '../types';

interface LibraryHeroProps {
    selectedPlaylist: string | null;
    currentPlaylistTracks: TrackInfo[];
    totalDurationStr: string;
    musicDir: string;
}

export const LibraryHero: React.FC<LibraryHeroProps> = ({
    selectedPlaylist,
    currentPlaylistTracks,
    totalDurationStr,
    musicDir
}) => {
    return (
        <header className="library-hero">
            <div className="hero-cover">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="hero-cover-svg">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            </div>
            <div className="hero-content">
                <span className="hero-tag">{selectedPlaylist ? 'CUSTOM PLAYLIST' : 'LOCAL PLAYLIST'}</span>
                <h1 className="hero-title">{selectedPlaylist || 'Home Library'}</h1>
                <div className="hero-stats">
                    <span className="hero-author">0xPlayer</span>
                    <span className="hero-dot">•</span>
                    <span>{currentPlaylistTracks.length} tracks</span>
                    <span className="hero-dot">•</span>
                    <span>{totalDurationStr}</span>
                </div>
                <p className="hero-path">{selectedPlaylist ? `Custom Playlist: ${selectedPlaylist}` : musicDir}</p>
            </div>
        </header>
    );
};
