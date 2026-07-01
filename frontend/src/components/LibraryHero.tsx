import React from 'react';
import { TrackInfo } from '../types';
import { ArtistShape } from './ArtistShape';

interface LibraryHeroProps {
    selectedPlaylist: string | null;
    selectedArtist: string | null;
    currentPlaylistTracks: TrackInfo[];
    totalDurationStr: string;
    musicDir: string;
}

export const LibraryHero: React.FC<LibraryHeroProps> = ({
    selectedPlaylist,
    selectedArtist,
    currentPlaylistTracks,
    totalDurationStr,
    musicDir
}) => {
    const isArtist = !!selectedArtist;
    const tagText = isArtist ? 'ARTIST' : (selectedPlaylist ? 'CUSTOM PLAYLIST' : 'LOCAL PLAYLIST');
    const titleText = selectedArtist || selectedPlaylist || 'Home Library';
    const pathText = selectedArtist ? `Artist Library: ${selectedArtist}` : (selectedPlaylist ? `Custom Playlist: ${selectedPlaylist}` : musicDir);

    return (
        <header className="library-hero">
            {isArtist && (
                <div style={{ width: '130px', height: '130px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                    <ArtistShape name={selectedArtist} />
                </div>
            )}
            <div className="hero-content">
                <span className="hero-tag">{tagText}</span>
                <h1 className="hero-title">{titleText}</h1>
                <div className="hero-stats">
                    <span className="hero-author">0xPlayer</span>
                    <span className="hero-dot">•</span>
                    <span>{currentPlaylistTracks.length} tracks</span>
                    <span className="hero-dot">•</span>
                    <span>{totalDurationStr}</span>
                </div>
                <p className="hero-path">{pathText}</p>
            </div>
        </header>
    );
};
