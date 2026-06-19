import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

vi.mock('../wailsjs/runtime/runtime', () => ({
    EventsOn: vi.fn().mockReturnValue(() => {}),
    EventsOff: vi.fn(),
    EventsEmit: vi.fn(),
}));

vi.mock('../wailsjs/go/main/App', () => ({
    LoadTrack: vi.fn(),
    Play: vi.fn(),
    Pause: vi.fn(),
    Seek: vi.fn(),
    SetVolume: vi.fn(),
    SetTempo: vi.fn(),
    SetPitch: vi.fn(),
    GetPosition: vi.fn(),
    IsPlaying: vi.fn(),
    ToggleAutoMix: vi.fn(),
    SelectAudioFile: vi.fn(),
    GetMusicDir: vi.fn().mockResolvedValue('/mock/music/dir'),
    ScanMusicDir: vi.fn().mockResolvedValue([]),
    OpenMusicDir: vi.fn(),
    SetCrossfadeDuration: vi.fn(),
    LogFromJS: vi.fn().mockResolvedValue(undefined),
    GetPlaylists: vi.fn().mockResolvedValue([]),
    SavePlaylists: vi.fn().mockResolvedValue(undefined),
    CreatePlaylist: vi.fn().mockResolvedValue(undefined),
    DeletePlaylist: vi.fn().mockResolvedValue(undefined),
    AddTrackToPlaylist: vi.fn().mockResolvedValue(undefined),
    RemoveTrackFromPlaylist: vi.fn().mockResolvedValue(undefined),
    SearchSoundCloud: vi.fn().mockResolvedValue([]),
    DownloadFromSoundCloud: vi.fn().mockResolvedValue(undefined),
}));

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the navigation menu buttons', async () => {
        render(<App />);

        expect(screen.getByRole('button', { name: /Library/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /DJ Decks/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
    });

    it('shows the library view by default with empty state message', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Your library is empty')).toBeInTheDocument();
        });

        expect(screen.getByText('Home Library')).toBeInTheDocument();
    });

    it('navigates to DJ Decks view and shows Deck A and Deck B', async () => {
        render(<App />);

        const djDecksButton = screen.getByRole('button', { name: /DJ Decks/i });
        fireEvent.click(djDecksButton);

        await waitFor(() => {
            expect(screen.getByText('DECK A')).toBeInTheDocument();
            expect(screen.getByText('DECK B')).toBeInTheDocument();
        });
    });

    it('navigates to Settings view and shows App Settings', async () => {
        render(<App />);

        const settingsButton = screen.getByRole('button', { name: /Settings/i });
        fireEvent.click(settingsButton);

        await waitFor(() => {
            expect(screen.getByText('App Settings')).toBeInTheDocument();
            expect(screen.getByText('Customize your 0xSoundPlayer experience and theme styles')).toBeInTheDocument();
        });
    });
});
