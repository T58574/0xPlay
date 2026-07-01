import React from 'react';
import { PlayIcon, PauseIcon, RowPlayIcon, RowPauseIcon, PlusIcon, MusicIcon, FolderIcon, LoadIcon } from './Icons';
import { TrackInfo, PlaylistInfo } from '../types';

interface LibraryTableProps {
    playing: [boolean, boolean];
    activeSlot: 0 | 1;
    tracks: [TrackInfo | null, TrackInfo | null];
    handleHeroPlayClick: () => void;
    filteredTracks: TrackInfo[];
    libraryTracks: TrackInfo[];
    currentTrackIndex: number;
    handlePlayLibraryTrack: (idx: number) => void;
    activePlaylistMenuTrack: string | null;
    setActivePlaylistMenuTrack: (trackPath: string | null) => void;
    playlists: PlaylistInfo[];
    selectedPlaylist: string | null;
    handleRemoveTrackFromPlaylist: (plName: string, trackPath: string) => void;
    handleAddTrackToPlaylist: (plName: string, trackPath: string) => void;
    getFilename: (path: string) => string;
    formatTime: (sec: number) => string;
    OpenMusicDir: () => void;
    handleSelectAndLoad: (slot: 0 | 1) => void;
}

export const LibraryTable: React.FC<LibraryTableProps> = ({
    playing,
    activeSlot,
    tracks,
    handleHeroPlayClick,
    filteredTracks,
    libraryTracks,
    currentTrackIndex,
    handlePlayLibraryTrack,
    activePlaylistMenuTrack,
    setActivePlaylistMenuTrack,
    playlists,
    selectedPlaylist,
    handleRemoveTrackFromPlaylist,
    handleAddTrackToPlaylist,
    getFilename,
    formatTime,
    OpenMusicDir,
    handleSelectAndLoad
}) => {
    return (
        <div className="library-main-content">
            <div className="library-controls-bar">
                <button className="hero-play-button" onClick={handleHeroPlayClick}>
                    {playing[activeSlot] && tracks[activeSlot] ? <PauseIcon /> : <PlayIcon />}
                </button>
            </div>

            {filteredTracks.length > 0 ? (
                <div className="tracks-list-container">
                    <table className="tracks-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                <th>TITLE</th>
                                <th style={{ width: '120px' }}>BPM</th>
                                <th style={{ width: '120px' }}>KEY</th>
                                <th style={{ width: '100px' }}>DURATION</th>
                                <th style={{ width: '80px', textAlign: 'center' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTracks.map((track) => {
                                const filename = getFilename(track.filePath);
                                const originalIndex = libraryTracks.findIndex(t => t.filePath === track.filePath);
                                const isCurrent = currentTrackIndex === originalIndex;
                                return (
                                    <tr 
                                        key={track.filePath} 
                                        className={`track-row ${isCurrent ? 'current' : ''}`}
                                        onClick={() => handlePlayLibraryTrack(originalIndex)}
                                    >
                                        <td>
                                            {isCurrent && playing[activeSlot] ? (
                                                <span className="row-play-btn glowing-green"><RowPauseIcon /></span>
                                            ) : (
                                                <span className="row-play-btn"><RowPlayIcon /></span>
                                            )}
                                        </td>
                                        <td className="track-title-cell">
                                            <div className="track-title-main">{filename}</div>
                                            {(track.artist || track.genre) && (
                                                <div className="track-artist-sub">
                                                    {track.artist || 'Unknown Artist'} • {track.genre || 'Unknown Genre'}
                                                </div>
                                            )}
                                        </td>
                                        <td>{track.bpm.toFixed(1)}</td>
                                        <td className="glowing-key">{track.keySignature}</td>
                                        <td>{formatTime(track.durationSec)}</td>
                                        <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                            <div className="action-buttons-group">
                                                <button 
                                                    className="track-action-btn add-btn"
                                                    onClick={() => setActivePlaylistMenuTrack(activePlaylistMenuTrack === track.filePath ? null : track.filePath)}
                                                    title="Add to Playlist"
                                                >
                                                    <PlusIcon />
                                                </button>
                                                {selectedPlaylist && (
                                                    <button 
                                                        className="track-action-btn remove-btn"
                                                        onClick={() => handleRemoveTrackFromPlaylist(selectedPlaylist, track.filePath)}
                                                        title="Remove from Playlist"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                                {activePlaylistMenuTrack === track.filePath && (
                                                    <>
                                                        <div className="playlist-dropdown-backdrop" onClick={() => setActivePlaylistMenuTrack(null)} />
                                                        <div className="playlist-dropdown-menu">
                                                            <span className="dropdown-menu-title">Add to Playlist</span>
                                                            {playlists.length === 0 ? (
                                                                <span className="dropdown-no-playlists">No playlists created</span>
                                                            ) : (
                                                                playlists.map((pl) => {
                                                                    const alreadyHas = pl.trackPaths?.includes(track.filePath);
                                                                    return (
                                                                        <button 
                                                                            key={pl.name}
                                                                            className={`dropdown-menu-item ${alreadyHas ? 'disabled' : ''}`}
                                                                            onClick={() => {
                                                                                if (!alreadyHas) {
                                                                                    handleAddTrackToPlaylist(pl.name, track.filePath);
                                                                                }
                                                                            }}
                                                                            disabled={alreadyHas}
                                                                        >
                                                                            <span>{pl.name}</span>
                                                                            {alreadyHas && <span className="already-has-check">✓</span>}
                                                                        </button>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-library">
                    <div className="empty-card">
                        <MusicIcon />
                        <h3>Your library is empty</h3>
                        <p>Drop audio files into `.0xplayer` directory under your home folder.</p>
                        <div className="empty-actions">
                            <button className="btn-primary" onClick={OpenMusicDir}>
                                <FolderIcon />
                                <span>Open Directory</span>
                            </button>
                            <button className="btn-secondary" onClick={() => handleSelectAndLoad(activeSlot)}>
                                <LoadIcon />
                                <span>Select File Directly</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
