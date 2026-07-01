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
