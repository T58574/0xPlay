import { useState, useEffect, useRef } from 'react';
import './App.css';
import { EventsOn } from "../wailsjs/runtime/runtime";
import {
    LoadTrack,
    Play,
    Pause,
    Seek,
    SetVolume,
    SetTempo,
    SetPitch,
    GetPosition,
    IsPlaying,
    ToggleAutoMix,
    SelectAudioFile,
    GetMusicDir,
    ScanMusicDir,
    OpenMusicDir,
    SetCrossfadeDuration,
    LogFromJS,
    GetSpectrum,
    GetPlaylists,
    CreatePlaylist,
    DeletePlaylist,
    AddTrackToPlaylist,
    RemoveTrackFromPlaylist,
    SearchSoundCloud,
    DownloadFromSoundCloud
} from "../wailsjs/go/main/App";

interface TrackInfo {
    filePath: string;
    durationSec: number;
    bpm: number;
    keySignature: string;
    waveform: number[];
    artist?: string;
    genre?: string;
}

interface SoundCloudResult {
    title: string;
    uploader: string;
    url: string;
    duration: number;
}

interface PlaylistInfo {
    name: string;
    trackPaths: string[];
}

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const RowPlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" className="row-svg-icon">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const RowPauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" className="row-svg-icon">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const MusicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const LoadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const LightningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <polyline points="3 3 3 8 8 8" />
    </svg>
);

const NextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
);

const PrevIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M11.5 12L20 18V6l-8.5 6zM6 6h2v12H6V6z" />
    </svg>
);

const LibraryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M12 20h9M3 20h4M3 10h18M3 5h18" />
    </svg>
);

const DecksIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="12" r="3" />
        <line x1="6" y1="9" x2="6" y2="3" />
        <line x1="18" y1="9" x2="18" y2="3" />
        <path d="M6 3h12" />
    </svg>
);

const VolumeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const ShuffleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <polyline points="16 3 21 3 21 8"></polyline>
        <line x1="4" y1="20" x2="21" y2="3"></line>
        <polyline points="21 16 21 21 16 21"></polyline>
        <line x1="15" y1="15" x2="21" y2="21"></line>
        <line x1="4" y1="4" x2="9" y2="9"></line>
    </svg>
);

const RepeatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <polyline points="17 1 21 5 17 9"></polyline>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
        <polyline points="7 23 3 19 7 15"></polyline>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const MusicIconSmall = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

function App() {
    const [activeTab, setActiveTab] = useState<'library' | 'decks' | 'settings' | 'search'>('library');
    const [crossfadeDuration, setCrossfadeDurationState] = useState<number>(8.0);
    const [musicDir, setMusicDir] = useState<string>('');
    const [libraryTracks, setLibraryTracks] = useState<TrackInfo[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
    const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [dragPosition, setDragPosition] = useState<number | null>(null);
    const [playlists, setPlaylists] = useState<PlaylistInfo[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState<boolean>(false);
    const [newPlaylistName, setNewPlaylistName] = useState<string>('');
    const [activePlaylistMenuTrack, setActivePlaylistMenuTrack] = useState<string | null>(null);
    const [currentTheme, setCurrentTheme] = useState<string>('emerald');
    const [soundcloudQuery, setSoundcloudQuery] = useState<string>('');
    const [soundcloudResults, setSoundcloudResults] = useState<SoundCloudResult[]>([]);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

    const themes = {
        emerald: { accent: '#22C55E', dark: '#15803d', hover: '#2cd46e', bgStart: '#1E1B4B', bgEnd: '#080811' },
        purple: { accent: '#A855F7', dark: '#7E22CE', hover: '#b86bff', bgStart: '#2E1065', bgEnd: '#090514' },
        amber: { accent: '#F59E0B', dark: '#B45309', hover: '#fbbf24', bgStart: '#451A03', bgEnd: '#0C0401' },
        blue: { accent: '#3B82F6', dark: '#1D4ED8', hover: '#60a5fa', bgStart: '#1E3A8A', bgEnd: '#030712' },
        rose: { accent: '#F43F5E', dark: '#BE123C', hover: '#fb7185', bgStart: '#4C0519', bgEnd: '#0A0002' }
    };

    useEffect(() => {
        const theme = themes[currentTheme as keyof typeof themes] || themes.emerald;
        const root = document.documentElement;
        root.style.setProperty('--accent-color', theme.accent);
        root.style.setProperty('--accent-color-dark', theme.dark);
        root.style.setProperty('--accent-color-hover', theme.hover);
        root.style.setProperty('--bg-start', theme.bgStart);
        root.style.setProperty('--bg-end', theme.bgEnd);
        root.style.setProperty('--accent-bg-glow', theme.accent + '10');
        root.style.setProperty('--accent-row-active', theme.accent + '0b');
    }, [currentTheme]);

    const [tracks, setTracks] = useState<[TrackInfo | null, TrackInfo | null]>([null, null]);
    const [playing, setPlaying] = useState<[boolean, boolean]>([false, false]);
    const [positions, setPositions] = useState<[number, number]>([0, 0]);
    const [volumes, setVolumes] = useState<[number, number]>([1.0, 1.0]);
    const [tempos, setTempos] = useState<[number, number]>([1.0, 1.0]);
    const [pitches, setPitches] = useState<[number, number]>([0.0, 0.0]);
    const [autoMix, setAutoMix] = useState<boolean>(false);
    const [shuffle, setShuffle] = useState<boolean>(false);
    const [repeat, setRepeat] = useState<boolean>(false);

    const canvasRef0 = useRef<HTMLCanvasElement | null>(null);
    const canvasRef1 = useRef<HTMLCanvasElement | null>(null);
    const spectrumRef0 = useRef<HTMLCanvasElement | null>(null);
    const spectrumRef1 = useRef<HTMLCanvasElement | null>(null);

    const smoothedSpectrum0 = useRef<number[]>(new Array(64).fill(0));
    const smoothedSpectrum1 = useRef<number[]>(new Array(64).fill(0));
    const peakSpectrum0 = useRef<number[]>(new Array(64).fill(0));
    const peakSpectrum1 = useRef<number[]>(new Array(64).fill(0));
    const currentThemeRef = useRef<string>(currentTheme);

    useEffect(() => {
        currentThemeRef.current = currentTheme;
    }, [currentTheme]);

    // Фронтенд-логгер. Пишет в консоль devtools с префиксом [ui] и временной
    // меткой, чтобы было проще сопоставлять с backend-логами (~/.0xplayer/).
    const uiLog = (level: 'INFO' | 'WARN' | 'ERROR', msg: string) => {
        const t = new Date().toISOString().split('T')[1]?.replace('Z', '') ?? '';
        const prefix = `%c[${t}] [${level}] [ui]`;
        const color = level === 'ERROR' ? 'color:#ef4444' : level === 'WARN' ? 'color:#f59e0b' : 'color:#22c55e';
        // eslint-disable-next-line no-console
        console.log(prefix, color, msg);
        LogFromJS(level, msg).catch(() => {});
    };

    // Guard: предотвращает параллельный запуск нескольких переключений трека.
    // Раньше handleNext() мог вызываться из 100мс-интервала несколько раз
    // подряд, пока асинхронная LoadTrack ещё не завершилась — это приводило к
    // гонкам: ползунок прогресса/микшера «залипал», а дорожка могла не
    // загрузиться. Теперь только одна операция смены трека активна за раз.
    const switchingRef = useRef(false);
    // Какой трек (по filePath) сейчас загружается на каждый слот — чтобы
    // подавлять дублирующие переключения на ту же самую дорожку.
    const loadingPathRef = useRef<[string | null, string | null]>([null, null]);
    // Стабильная ссылка на handleNext, обновляемая каждый рендер. Интервал
    // создаётся один раз при монтировании и замыкает первую версию handleNext,
    // поэтому без этого ref он видел бы устаревший currentTrackIndex=-1.
    const handleNextRef = useRef<() => void>(() => {});
    const handleLoadDeckRef = useRef<(slot: number, path: string) => Promise<void>>(async () => {});
    const handleSeekRef = useRef<(slot: number, pct: number) => Promise<void>>(async () => {});

    const stateRef = useRef({
        tracks: [null, null] as [TrackInfo | null, TrackInfo | null],
        playing: [false, false] as [boolean, boolean],
        positions: [0, 0] as [number, number],
        activeSlot: 0 as 0 | 1,
        currentTrackIndex: -1,
        autoMix: false,
        libraryTracks: [] as TrackInfo[],
        shuffle: false,
        repeat: false,
        currentPlaylistTracks: [] as TrackInfo[]
    });

    const getFilename = (path: string) => {
        if (!path) return '';
        const parts = path.split(/[/\\]/);
        return parts[parts.length - 1];
    };

    const currentPlaylistTracks = selectedPlaylist
        ? libraryTracks.filter(t => playlists.find(p => p.name === selectedPlaylist)?.trackPaths?.includes(t.filePath))
        : libraryTracks;

    const availableArtists = Array.from(new Set(libraryTracks.map(t => t.artist || 'Unknown Artist'))).filter(Boolean).sort();
    const availableGenres = Array.from(new Set(libraryTracks.map(t => t.genre || 'Unknown Genre'))).filter(Boolean).sort();

    const filteredTracks = currentPlaylistTracks.filter(track => {
        const filename = getFilename(track.filePath).toLowerCase();
        const artist = (track.artist || 'Unknown Artist').toLowerCase();
        const genre = (track.genre || 'Unknown Genre').toLowerCase();
        const query = searchQuery.toLowerCase();
        
        const matchesQuery = filename.includes(query) || artist.includes(query) || genre.includes(query);
        const matchesArtist = !selectedArtist || (track.artist || 'Unknown Artist') === selectedArtist;
        const matchesGenre = !selectedGenre || (track.genre || 'Unknown Genre') === selectedGenre;
        
        return matchesQuery && matchesArtist && matchesGenre;
    });

    const totalDuration = currentPlaylistTracks.reduce((acc, t) => acc + t.durationSec, 0);
    const totalDurationStr = (() => {
        const h = Math.floor(totalDuration / 3600);
        const m = Math.floor((totalDuration % 3600) / 60);
        const s = Math.floor(totalDuration % 60);
        if (h > 0) {
            return `${h} hr ${m} min`;
        }
        return `${m} min ${s} sec`;
    })();

    const loadLibrary = async () => {
        try {
            uiLog('INFO', 'loadLibrary: старт сканирования');
            const dir = await GetMusicDir();
            setMusicDir(dir);
            const list = await ScanMusicDir();
            setLibraryTracks(list || []);
            uiLog('INFO', `loadLibrary: найдено ${list?.length ?? 0} треков`);
        } catch (err) {
            uiLog('ERROR', `loadLibrary: ошибка: ${String(err)}`);
        }
    };

    const loadPlaylists = async () => {
        try {
            const list = await GetPlaylists();
            setPlaylists(list || []);
        } catch (err) {
            uiLog('ERROR', `loadPlaylists error: ${String(err)}`);
        }
    };

    const handleCreatePlaylistSubmit = async () => {
        if (!newPlaylistName.trim()) {
            setIsCreatingPlaylist(false);
            return;
        }
        try {
            await CreatePlaylist(newPlaylistName.trim());
            uiLog('INFO', `Created playlist: ${newPlaylistName}`);
            setNewPlaylistName('');
            setIsCreatingPlaylist(false);
            await loadPlaylists();
        } catch (err) {
            uiLog('ERROR', `CreatePlaylist error: ${String(err)}`);
        }
    };

    const handleDeletePlaylist = async (name: string) => {
        try {
            await DeletePlaylist(name);
            uiLog('INFO', `Deleted playlist: ${name}`);
            if (selectedPlaylist === name) {
                setSelectedPlaylist(null);
            }
            await loadPlaylists();
        } catch (err) {
            uiLog('ERROR', `DeletePlaylist error: ${String(err)}`);
        }
    };

    const handleAddTrackToPlaylist = async (playlistName: string, trackPath: string) => {
        try {
            await AddTrackToPlaylist(playlistName, trackPath);
            uiLog('INFO', `Added track ${trackPath} to playlist ${playlistName}`);
            await loadPlaylists();
            setActivePlaylistMenuTrack(null);
        } catch (err) {
            uiLog('ERROR', `AddTrackToPlaylist error: ${String(err)}`);
        }
    };

    const handleRemoveTrackFromPlaylist = async (playlistName: string, trackPath: string) => {
        try {
            await RemoveTrackFromPlaylist(playlistName, trackPath);
            uiLog('INFO', `Removed track ${trackPath} from playlist ${playlistName}`);
            await loadPlaylists();
        } catch (err) {
            uiLog('ERROR', `RemoveTrackFromPlaylist error: ${String(err)}`);
        }
    };

    const handleSoundCloudSearch = async () => {
        if (!soundcloudQuery.trim()) return;
        setSearchLoading(true);
        try {
            uiLog('INFO', `Searching SoundCloud for: ${soundcloudQuery}`);
            const results = await SearchSoundCloud(soundcloudQuery);
            setSoundcloudResults(results || []);
            uiLog('INFO', `SoundCloud search returned ${results?.length ?? 0} results`);
        } catch (err) {
            uiLog('ERROR', `SoundCloud search error: ${String(err)}`);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSoundCloudDownload = async (url: string) => {
        setDownloadingUrl(url);
        setIsDownloading(true);
        try {
            uiLog('INFO', `Downloading from SoundCloud: ${url}`);
            await DownloadFromSoundCloud(url);
            uiLog('INFO', `Successfully downloaded from SoundCloud: ${url}`);
            await loadLibrary();
        } catch (err) {
            uiLog('ERROR', `SoundCloud download error: ${String(err)}`);
        } finally {
            setDownloadingUrl(null);
            setIsDownloading(false);
        }
    };

    const handleLoadDeck = async (slot: number, path: string) => {
        // Подавляем параллельную повторную загрузку того же файла на тот же
        // слот: пока LoadTrack (с анализом) выполняется несколько секунд,
        // интервальный обработчик мог вызвать это повторно.
        if (loadingPathRef.current[slot as 0 | 1] === path) {
            uiLog('WARN', `handleLoadDeck: уже грузится slot=${slot} path=${path} — пропуск`);
            return;
        }
        loadingPathRef.current[slot as 0 | 1] = path;
        uiLog('INFO', `handleLoadDeck: начало slot=${slot} path=${path}`);
        try {
            // Останавливаем старую дорожку перед загрузкой новой, иначе в
            // интервальном опросе можно прочитать устаревшую позицию.
            try { await Pause(slot); } catch { /* ok */ }

            const meta = await LoadTrack(slot, path);
            const updated = [...tracks] as [TrackInfo | null, TrackInfo | null];
            updated[slot] = {
                filePath: path,
                durationSec: meta.durationSec,
                bpm: meta.bpm,
                keySignature: meta.keySignature,
                waveform: meta.waveform || []
            };
            setTracks(updated);

            const updatedPlaying = [...playing] as [boolean, boolean];
            updatedPlaying[slot] = false;
            setPlaying(updatedPlaying);

            const updatedPos = [...positions] as [number, number];
            updatedPos[slot] = 0;
            setPositions(updatedPos);

            const updatedTempos = [...tempos] as [number, number];
            updatedTempos[slot] = 1.0;
            setTempos(updatedTempos);

            const updatedPitches = [...pitches] as [number, number];
            updatedPitches[slot] = 0.0;
            setPitches(updatedPitches);

            uiLog('INFO', `handleLoadDeck: OK slot=${slot} dur=${meta.durationSec.toFixed(2)}s bpm=${meta.bpm.toFixed(1)} key=${meta.keySignature}`);
        } catch (err) {
            uiLog('ERROR', `handleLoadDeck: ошибка slot=${slot} path=${path}: ${String(err)}`);
        } finally {
            loadingPathRef.current[slot as 0 | 1] = null;
        }
    };

    const handleSelectAndLoad = async (slot: number) => {
        const path = await SelectAudioFile();
        if (path) {
            await handleLoadDeck(slot, path);
        }
    };

    const handlePlayLibraryTrack = async (index: number) => {
        if (libraryTracks.length === 0) {
            uiLog('WARN', 'handlePlayLibraryTrack: библиотека пуста');
            return;
        }
        if (currentTrackIndex === index) {
            uiLog('INFO', `handlePlayLibraryTrack: тот же индекс ${index} — play/pause`);
            await handleGlobalPlayPause();
            return;
        }
        // Guard: только одна операция смены трека одновременно. Это убирает
        // каскадные переключения из 100мс-интервала и «залипание» ползунка.
        if (switchingRef.current) {
            uiLog('WARN', `handlePlayLibraryTrack: уже идёт переключение — пропуск index=${index}`);
            return;
        }
        switchingRef.current = true;
        uiLog('INFO', `handlePlayLibraryTrack: переключение на index=${index} slot=${activeSlot}`);
        try {
            setCurrentTrackIndex(index);
            const track = libraryTracks[index];
            await handleLoadDeck(activeSlot, track.filePath);
            await Play(activeSlot);
            const updated = [...playing] as [boolean, boolean];
            updated[activeSlot] = true;
            setPlaying(updated);
            uiLog('INFO', `handlePlayLibraryTrack: запущен index=${index}`);
        } finally {
            switchingRef.current = false;
        }
    };

    const handlePlayPause = async (slot: number) => {
        if (!tracks[slot]) return;
        setActiveSlot(slot as 0 | 1);
        if (playing[slot]) {
            uiLog('INFO', `handlePlayPause: pause slot=${slot}`);
            await Pause(slot);
            const updated = [...playing] as [boolean, boolean];
            updated[slot] = false;
            setPlaying(updated);
        } else {
            uiLog('INFO', `handlePlayPause: play slot=${slot}`);
            await Play(slot);
            const updated = [...playing] as [boolean, boolean];
            updated[slot] = true;
            setPlaying(updated);
        }
    };

    const handleGlobalPlayPause = async () => {
        const slot = activeSlot;
        if (!tracks[slot]) {
            if (libraryTracks.length > 0) {
                await handlePlayLibraryTrack(0);
            }
            return;
        }
        if (playing[slot]) {
            uiLog('INFO', `handleGlobalPlayPause: pause slot=${slot}`);
            await Pause(slot);
            const updated = [...playing] as [boolean, boolean];
            updated[slot] = false;
            setPlaying(updated);
        } else {
            uiLog('INFO', `handleGlobalPlayPause: play slot=${slot}`);
            await Play(slot);
            const updated = [...playing] as [boolean, boolean];
            updated[slot] = true;
            setPlaying(updated);
        }
    };

    const handleHeroPlayClick = async () => {
        const activeTrack = tracks[activeSlot];
        if (!activeTrack) {
            const playlist = searchQuery ? filteredTracks : libraryTracks;
            if (playlist.length > 0) {
                await handlePlayLibraryTrack(0);
            }
        } else {
            await handleGlobalPlayPause();
        }
    };

    const handleNext = async () => {
        if (currentPlaylistTracks.length === 0) return;
        if (switchingRef.current) {
            uiLog('WARN', 'handleNext: уже идёт переключение — пропуск');
            return;
        }
        const currentTrack = libraryTracks[currentTrackIndex];
        let playlistIndex = currentPlaylistTracks.findIndex(t => t.filePath === currentTrack?.filePath);
        let nextPlaylistIndex = (playlistIndex + 1) % currentPlaylistTracks.length;
        if (shuffle) {
            nextPlaylistIndex = Math.floor(Math.random() * currentPlaylistTracks.length);
        }
        const nextTrack = currentPlaylistTracks[nextPlaylistIndex];
        const nextOriginalIndex = libraryTracks.findIndex(t => t.filePath === nextTrack.filePath);
        uiLog('INFO', `handleNext: ${currentTrackIndex} -> ${nextOriginalIndex}`);
        await handlePlayLibraryTrack(nextOriginalIndex);
    };

    const handlePrev = async () => {
        if (currentPlaylistTracks.length === 0) return;
        if (switchingRef.current) {
            uiLog('WARN', 'handlePrev: уже идёт переключение — пропуск');
            return;
        }
        const currentTrack = libraryTracks[currentTrackIndex];
        let playlistIndex = currentPlaylistTracks.findIndex(t => t.filePath === currentTrack?.filePath);
        let prevPlaylistIndex = (playlistIndex - 1 + currentPlaylistTracks.length) % currentPlaylistTracks.length;
        if (shuffle) {
            prevPlaylistIndex = Math.floor(Math.random() * currentPlaylistTracks.length);
        }
        const prevTrack = currentPlaylistTracks[prevPlaylistIndex];
        const prevOriginalIndex = libraryTracks.findIndex(t => t.filePath === prevTrack.filePath);
        uiLog('INFO', `handlePrev: ${currentTrackIndex} -> ${prevOriginalIndex}`);
        await handlePlayLibraryTrack(prevOriginalIndex);
    };

    // Держим актуальную ссылку, чтобы смонтированный один раз интервал
    // вызывал свежую версию handleNext (с актуальным currentTrackIndex).
    handleNextRef.current = handleNext;
    handleLoadDeckRef.current = handleLoadDeck;

    const handleVolume = async (slot: number, val: number) => {
        const updated = [...volumes] as [number, number];
        updated[slot] = val;
        setVolumes(updated);
        uiLog('INFO', `handleVolume slot=${slot} vol=${val.toFixed(2)}`);
        await SetVolume(slot, val);
    };

    const handleTempo = async (slot: number, val: number) => {
        const updated = [...tempos] as [number, number];
        updated[slot] = val;
        setTempos(updated);
        uiLog('INFO', `handleTempo slot=${slot} tempo=${val.toFixed(2)}`);
        await SetTempo(slot, val);
    };

    const handlePitch = async (slot: number, val: number) => {
        const updated = [...pitches] as [number, number];
        updated[slot] = val;
        setPitches(updated);
        uiLog('INFO', `handlePitch slot=${slot} pitch=${val}`);
        await SetPitch(slot, val);
    };

    const handleSeek = async (slot: number, pct: number) => {
        const track = tracks[slot];
        if (!track) return;
        const newPos = pct * track.durationSec;
        uiLog('INFO', `handleSeek slot=${slot} pct=${pct.toFixed(3)} -> ${newPos.toFixed(2)}s`);
        await Seek(slot, newPos);
        const updated = [...positions] as [number, number];
        updated[slot] = newPos;
        setPositions(updated);
    };

    handleSeekRef.current = handleSeek;

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>, slot: number) => {
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = clickX / rect.width;
        handleSeek(slot, pct);
    };

    const handleToggleAutoMix = async () => {
        const val = !autoMix;
        setAutoMix(val);
        uiLog('INFO', `handleToggleAutoMix -> ${val ? 'ON' : 'OFF'}`);
        await ToggleAutoMix(val);
    };

    useEffect(() => {
        loadLibrary();
        loadPlaylists();
    }, []);

    useEffect(() => {
        stateRef.current = { tracks, playing, positions, activeSlot, currentTrackIndex, autoMix, libraryTracks, shuffle, repeat, currentPlaylistTracks };
    });

    useEffect(() => {
        const interval = setInterval(async () => {
            const st = stateRef.current;
            const updatedPlaying = [...st.playing] as [boolean, boolean];
            const updatedPos = [...st.positions] as [number, number];
            
            await Promise.all([
                (async () => {
                    if (st.tracks[0]) {
                        const isPlay = await IsPlaying(0);
                        updatedPlaying[0] = isPlay;
                        if (isPlay) {
                            const pos = await GetPosition(0);
                            updatedPos[0] = pos;
                        }
                    }
                })(),
                (async () => {
                    if (st.tracks[1]) {
                        const isPlay = await IsPlaying(1);
                        updatedPlaying[1] = isPlay;
                        if (isPlay) {
                            const pos = await GetPosition(1);
                            updatedPos[1] = pos;
                        }
                    }
                })()
            ]);
            
            setPlaying(updatedPlaying);
            setPositions(updatedPos);

            const activeIsPlaying = updatedPlaying[st.activeSlot];
            const activePos = updatedPos[st.activeSlot];
            const activeTrack = st.tracks[st.activeSlot];
            if (activeTrack && activeIsPlaying && activeTrack.durationSec > 0 && activePos >= activeTrack.durationSec - 0.5) {
                if (!st.autoMix) {
                    uiLog('INFO', `interval: трек закончен pos=${activePos.toFixed(2)} dur=${activeTrack.durationSec.toFixed(2)} -> next`);
                    if (st.repeat) {
                        handleSeekRef.current(st.activeSlot, 0);
                    } else {
                        handleNextRef.current();
                    }
                }
            }

            if (st.autoMix && st.currentPlaylistTracks.length > 0) {
                const otherSlot = st.activeSlot === 0 ? 1 : 0;
                const currentTrack = st.tracks[st.activeSlot];
                let playlistIndex = st.currentPlaylistTracks.findIndex(t => t.filePath === currentTrack?.filePath);
                let nextPlaylistIndex = (playlistIndex + 1) % st.currentPlaylistTracks.length;
                if (st.repeat) {
                    nextPlaylistIndex = playlistIndex >= 0 ? playlistIndex : 0;
                } else if (st.shuffle) {
                    nextPlaylistIndex = Math.floor(Math.random() * st.currentPlaylistTracks.length);
                }
                const nextTrack = st.currentPlaylistTracks[nextPlaylistIndex];
                const nextOriginalIndex = st.libraryTracks.findIndex(t => t.filePath === nextTrack.filePath);
                
                if (updatedPlaying[st.activeSlot] && activeTrack && !updatedPlaying[otherSlot]) {
                    const otherTrack = st.tracks[otherSlot];
                    if (!otherTrack || otherTrack.filePath !== nextTrack.filePath) {
                        await handleLoadDeckRef.current(otherSlot, nextTrack.filePath);
                    }
                }

                if (updatedPlaying[otherSlot] && !st.playing[otherSlot]) {
                    setActiveSlot(otherSlot as 0 | 1);
                    setCurrentTrackIndex(nextOriginalIndex);
                }
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const unsubscribe = EventsOn("spectrum", (data: { deck0: number[], deck1: number[] }) => {
            if (spectrumRef0.current && data.deck0) {
                drawSpectrum(spectrumRef0.current, data.deck0, 0);
            }
            if (spectrumRef1.current && data.deck1) {
                drawSpectrum(spectrumRef1.current, data.deck1, 1);
            }
        });
        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [currentTheme]);

    const drawSpectrum = (canvas: HTMLCanvasElement, spectrum: number[], slot: number) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const theme = themes[currentTheme as keyof typeof themes] || themes.emerald;
        const barGradient = ctx.createLinearGradient(0, h, 0, 0);
        barGradient.addColorStop(0, theme.accent + '15');
        barGradient.addColorStop(0.4, theme.accent + 'b3');
        barGradient.addColorStop(1, theme.accent);

        const smoothed = slot === 0 ? smoothedSpectrum0.current : smoothedSpectrum1.current;
        const peaks = slot === 0 ? peakSpectrum0.current : peakSpectrum1.current;

        for (let i = 0; i < spectrum.length; i++) {
            const rawVal = spectrum[i] || 0;
            const normalized = Math.min(1.0, rawVal / 128.0);
            const target = Math.pow(normalized, 0.75);

            if (target > smoothed[i]) {
                smoothed[i] = target;
            } else {
                smoothed[i] = smoothed[i] * 0.82 + target * 0.18;
            }

            if (smoothed[i] > peaks[i]) {
                peaks[i] = smoothed[i];
            } else {
                peaks[i] = Math.max(0, peaks[i] * 0.97 - 0.003);
            }
        }

        const barWidth = Math.max(1, (w / spectrum.length) - 1.5);
        for (let i = 0; i < spectrum.length; i++) {
            const val = smoothed[i];
            const peakVal = peaks[i];
            const x = i * (w / spectrum.length);

            if (val > 0.01) {
                const barHeight = val * h * 0.9;
                const y = h - barHeight;
                ctx.fillStyle = barGradient;
                ctx.fillRect(x, y, barWidth, barHeight);
            }

            if (peakVal > 0.01) {
                const peakY = h - peakVal * h * 0.9;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, peakY, barWidth, 1.5);
            }
        }
    };

    const draw = (canvas: HTMLCanvasElement, peaks: number[], pos: number, dur: number) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (peaks.length === 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();
            return;
        }

        const playPct = dur > 0 ? pos / dur : 0;
        const barWidth = w / peaks.length;
        const theme = themes[currentTheme as keyof typeof themes] || themes.emerald;
        const accentColor = theme.accent || '#22C55E';

        for (let i = 0; i < peaks.length; i++) {
            const pct = i / peaks.length;
            const val = peaks[i];
            const barHeight = val * h * 0.85;
            const x = i * barWidth;
            const y = (h - barHeight) / 2;

            if (pct < playPct) {
                ctx.fillStyle = accentColor;
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            }
            ctx.fillRect(x, y, Math.max(1, barWidth - 1), Math.max(2, barHeight));
        }
    };

    useEffect(() => {
        if (canvasRef0.current) {
            const t = tracks[0];
            draw(canvasRef0.current, t ? t.waveform : [], positions[0], t ? t.durationSec : 0);
        }
    }, [tracks[0], positions[0], currentTheme]);

    useEffect(() => {
        if (canvasRef1.current) {
            const t = tracks[1];
            draw(canvasRef1.current, t ? t.waveform : [], positions[1], t ? t.durationSec : 0);
        }
    }, [tracks[1], positions[1], currentTheme]);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="container">
            <div className="app-main-layout">
                <aside className="sidebar">
                    <div className="brand-logo">
                        <span className="logo-spark"><BoltIcon /></span>
                        <h2>0XPLAY</h2>
                    </div>

                    <nav className="nav-menu">
                        <button 
                            className={`nav-item ${activeTab === 'library' && selectedPlaylist === null ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedPlaylist(null);
                                setActiveTab('library');
                            }}
                        >
                            <LibraryIcon />
                            <span>Library</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'decks' ? 'active' : ''}`}
                            onClick={() => setActiveTab('decks')}
                        >
                            <DecksIcon />
                            <span>DJ Decks</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedPlaylist(null);
                                setActiveTab('search');
                            }}
                        >
                            <SearchIcon />
                            <span>Search SoundCloud</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <SettingsIcon />
                            <span>Settings</span>
                        </button>
                    </nav>

                    <div className="playlists-sidebar-section">
                        <div className="playlists-sidebar-header">
                            <span className="theme-section-title">PLAYLISTS</span>
                            <button 
                                className="create-playlist-sidebar-btn" 
                                onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}
                                title="Create Playlist"
                            >
                                <PlusIcon />
                            </button>
                        </div>
                        {isCreatingPlaylist && (
                            <div className="sidebar-playlist-input-container">
                                <input
                                    type="text"
                                    placeholder="New playlist name..."
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreatePlaylistSubmit();
                                        if (e.key === 'Escape') setIsCreatingPlaylist(false);
                                    }}
                                    className="sidebar-playlist-input"
                                    autoFocus
                                />
                                <button className="sidebar-playlist-submit-btn" onClick={handleCreatePlaylistSubmit}>✓</button>
                            </div>
                        )}
                        <div className="sidebar-playlists-list">
                            {playlists.map((pl) => {
                                const isActive = selectedPlaylist === pl.name && activeTab === 'library';
                                return (
                                    <div key={pl.name} className={`sidebar-playlist-row ${isActive ? 'active' : ''}`}>
                                        <button 
                                            className="sidebar-playlist-item-btn"
                                            onClick={() => {
                                                setSelectedPlaylist(pl.name);
                                                setActiveTab('library');
                                            }}
                                        >
                                            <MusicIconSmall />
                                            <span className="sidebar-playlist-name">{pl.name}</span>
                                        </button>
                                        <button 
                                            className="sidebar-delete-playlist-btn"
                                            onClick={() => handleDeletePlaylist(pl.name)}
                                            title="Delete Playlist"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="categories-sidebar-section">
                        <div className="categories-sidebar-header">
                            <span className="theme-section-title">ARTISTS</span>
                            {selectedArtist && (
                                <button className="clear-filter-btn" onClick={() => setSelectedArtist(null)}>Clear</button>
                            )}
                        </div>
                        <div className="sidebar-categories-list">
                            {availableArtists.map(artist => (
                                <button
                                    key={artist}
                                    className={`sidebar-category-item-btn ${selectedArtist === artist ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedArtist(selectedArtist === artist ? null : artist);
                                        setSelectedPlaylist(null);
                                        setActiveTab('library');
                                    }}
                                >
                                    <span>{artist}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="categories-sidebar-section">
                        <div className="categories-sidebar-header">
                            <span className="theme-section-title">GENRES</span>
                            {selectedGenre && (
                                <button className="clear-filter-btn" onClick={() => setSelectedGenre(null)}>Clear</button>
                            )}
                        </div>
                        <div className="sidebar-categories-list">
                            {availableGenres.map(genre => (
                                <button
                                    key={genre}
                                    className={`sidebar-category-item-btn ${selectedGenre === genre ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedGenre(selectedGenre === genre ? null : genre);
                                        setSelectedPlaylist(null);
                                        setActiveTab('library');
                                    }}
                                >
                                    <span>{genre}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="theme-selector-section">
                        <span className="theme-section-title">THEME PALETTE</span>
                        <div className="theme-buttons-grid">
                            {Object.keys(themes).map((tKey) => {
                                const th = themes[tKey as keyof typeof themes];
                                return (
                                    <button
                                        key={tKey}
                                        className={`theme-dot-btn ${currentTheme === tKey ? 'active' : ''}`}
                                        style={{ backgroundColor: th.accent }}
                                        onClick={() => setCurrentTheme(tKey)}
                                        title={tKey.toUpperCase()}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div className="sidebar-footer">
                        <button className="sidebar-btn" onClick={OpenMusicDir}>
                            <FolderIcon />
                            <span>Open Folder</span>
                        </button>
                        <button className="sidebar-btn" onClick={loadLibrary}>
                            <ResetIcon />
                            <span>Scan Folder</span>
                        </button>
                    </div>
                </aside>

                <main className="content-panel">
                    {activeTab === 'library' && (
                        <div className="library-view">
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

                            <div className="library-controls-bar">
                                <button className="hero-play-button" onClick={handleHeroPlayClick}>
                                    {playing[activeSlot] && tracks[activeSlot] ? <PauseIcon /> : <PlayIcon />}
                                </button>
                                
                                <div className="search-bar-container">
                                    <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input 
                                        type="text" 
                                        placeholder="Search in library..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                    {searchQuery && (
                                        <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
                                    )}
                                </div>
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
                                            {filteredTracks.map((track, idx) => {
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
                    )}
                    {activeTab === 'decks' && (
                        <div className="decks-view-tab">
                            <div className="decks-layout">
                                {[0, 1].map((slot) => {
                                    const track = tracks[slot];
                                    const canvasRef = slot === 0 ? canvasRef0 : canvasRef1;
                                    return (
                                        <section key={slot} className={`deck-card ${playing[slot] ? 'deck-active' : ''}`}>
                                            <div className="deck-header">
                                                <h2 className="deck-title">DECK {slot === 0 ? 'A' : 'B'}</h2>
                                                <button className="load-btn" onClick={() => handleSelectAndLoad(slot)}>
                                                    <LoadIcon />
                                                    <span>Load Track</span>
                                                </button>
                                            </div>

                                            {track ? (
                                                <div className="track-details">
                                                    <h3 className="track-name">{getFilename(track.filePath)}</h3>
                                                    <div className="stats-grid">
                                                        <div className="stat-box">
                                                            <span className="stat-label">BPM</span>
                                                            <span className="stat-val">{track.bpm.toFixed(1)}</span>
                                                        </div>
                                                        <div className="stat-box">
                                                            <span className="stat-label">KEY</span>
                                                            <span className="stat-val signature-glowing">{track.keySignature}</span>
                                                        </div>
                                                        <div className="stat-box">
                                                            <span className="stat-label">POSITION</span>
                                                            <span className="stat-val">
                                                                {formatTime(positions[slot])} / {formatTime(track.durationSec)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="visualizer-container" style={{ position: 'relative' }}>
                                                        <canvas
                                                            ref={slot === 0 ? spectrumRef0 : spectrumRef1}
                                                            width={600}
                                                            height={120}
                                                            className="spectrum-canvas"
                                                            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.8 }}
                                                        />
                                                        <canvas
                                                            ref={canvasRef}
                                                            width={600}
                                                            height={120}
                                                            className="waveform-canvas"
                                                            onClick={(e) => handleCanvasClick(e, slot)}
                                                            style={{ position: 'relative', zIndex: 10, mixBlendMode: 'screen' }}
                                                        />
                                                    </div>

                                                    <div className="controls-grid">
                                                        <div className="playback-controls">
                                                            <button className="play-btn" onClick={() => handlePlayPause(slot)}>
                                                                {playing[slot] ? <PauseIcon /> : <PlayIcon />}
                                                            </button>
                                                        </div>

                                                        <div className="sliders-section">
                                                            <div className="slider-group">
                                                                <label>Volume</label>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="1"
                                                                    step="0.01"
                                                                    value={volumes[slot]}
                                                                    onChange={(e) => handleVolume(slot, parseFloat(e.target.value))}
                                                                    className="slider"
                                                                    style={{
                                                                        background: `linear-gradient(to right, var(--accent-color, #22C55E) 0%, var(--accent-color, #22C55E) ${volumes[slot] * 100}%, rgba(255, 255, 255, 0.08) ${volumes[slot] * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                                                                    }}
                                                                />
                                                                <span className="slider-badge">{(volumes[slot] * 100).toFixed(0)}%</span>
                                                            </div>

                                                            <div className="slider-group">
                                                                <label>Tempo</label>
                                                                <input
                                                                    type="range"
                                                                    min="0.8"
                                                                    max="1.2"
                                                                    step="0.01"
                                                                    value={tempos[slot]}
                                                                    onChange={(e) => handleTempo(slot, parseFloat(e.target.value))}
                                                                    className="slider"
                                                                    style={{
                                                                        background: `linear-gradient(to right, var(--accent-color, #22C55E) 0%, var(--accent-color, #22C55E) ${((tempos[slot] - 0.8) / 0.4) * 100}%, rgba(255, 255, 255, 0.08) ${((tempos[slot] - 0.8) / 0.4) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                                                                    }}
                                                                />
                                                                <span 
                                                                    className="slider-badge resetable"
                                                                    onClick={() => handleTempo(slot, 1.0)}
                                                                >
                                                                    <ResetIcon />
                                                                    <span>{tempos[slot].toFixed(2)}x</span>
                                                                </span>
                                                            </div>

                                                            <div className="slider-group">
                                                                <label>Pitch Shift</label>
                                                                <input
                                                                    type="range"
                                                                    min="-2"
                                                                    max="2"
                                                                    step="1"
                                                                    value={pitches[slot]}
                                                                    onChange={(e) => handlePitch(slot, parseInt(e.target.value))}
                                                                    className="slider"
                                                                    style={{
                                                                        background: `linear-gradient(to right, var(--accent-color, #22C55E) 0%, var(--accent-color, #22C55E) ${((pitches[slot] + 2) / 4) * 100}%, rgba(255, 255, 255, 0.08) ${((pitches[slot] + 2) / 4) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                                                                    }}
                                                                />
                                                                <span 
                                                                    className="slider-badge resetable"
                                                                    onClick={() => handlePitch(slot, 0)}
                                                                >
                                                                    <ResetIcon />
                                                                    <span>{pitches[slot] > 0 ? '+' : ''}{pitches[slot]} semitones</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="deck-empty">
                                                    <div className="empty-state">
                                                        <div className="empty-icon-container">
                                                            <MusicIcon />
                                                        </div>
                                                        <p>No track loaded on this deck.</p>
                                                        <button className="btn-primary" onClick={() => handleSelectAndLoad(slot)}>
                                                            <LoadIcon />
                                                            <span>Select File</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {activeTab === 'search' && (
                        <div className="search-view">
                            <header className="search-header">
                                <h1>SoundCloud Search</h1>
                                <p>Search and import tracks directly into your music library</p>
                            </header>

                            <div className="soundcloud-search-bar-row">
                                <div className="soundcloud-search-container-large">
                                    <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input 
                                        type="text" 
                                        placeholder="Search SoundCloud tracks..." 
                                        value={soundcloudQuery}
                                        onChange={(e) => setSoundcloudQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSoundCloudSearch();
                                        }}
                                        className="soundcloud-input-large"
                                    />
                                    {soundcloudQuery && (
                                        <button className="clear-search-btn" onClick={() => setSoundcloudQuery('')}>✕</button>
                                    )}
                                </div>
                                <button 
                                    className="soundcloud-search-btn-large" 
                                    onClick={handleSoundCloudSearch}
                                    disabled={searchLoading}
                                >
                                    {searchLoading ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {soundcloudResults.length > 0 ? (
                                <div className="soundcloud-results-table-container-large">
                                    <table className="soundcloud-results-table-large">
                                        <thead>
                                            <tr>
                                                <th>TITLE</th>
                                                <th>ARTIST</th>
                                                <th style={{ width: '120px' }}>DURATION</th>
                                                <th style={{ width: '150px', textAlign: 'center' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {soundcloudResults.map((res) => {
                                                const isTrackDownloading = downloadingUrl === res.url;
                                                return (
                                                    <tr key={res.url}>
                                                        <td className="sc-title-cell">{res.title}</td>
                                                        <td>{res.uploader}</td>
                                                        <td>{formatTime(res.duration)}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                className="sc-import-btn-large"
                                                                onClick={() => handleSoundCloudDownload(res.url)}
                                                                disabled={isTrackDownloading || isDownloading}
                                                            >
                                                                {isTrackDownloading ? 'Importing...' : 'Import'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                !searchLoading && (
                                    <div className="search-empty-state">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-search-icon">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <h3>No results to display</h3>
                                        <p>Enter a query above to search for tracks on SoundCloud.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div className="settings-view">
                            <header className="settings-header">
                                <h1>App Settings</h1>
                                <p>Customize your 0xSoundPlayer experience and theme styles</p>
                            </header>

                            <section className="settings-section">
                                <h3 className="settings-section-title">Color Palette Theme</h3>
                                <div className="themes-grid-large">
                                    {Object.keys(themes).map((tKey) => {
                                        const th = themes[tKey as keyof typeof themes];
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
                                                        <span className="color-preview-dot" style={{ backgroundColor: th.bgStart }}></span>
                                                    </div>
                                                </div>
                                                <span className="theme-card-desc">
                                                    {tKey === 'emerald' ? 'Spotify green energy' : 
                                                     tKey === 'purple' ? 'Cosmic nebula space vibe' : 
                                                     tKey === 'amber' ? 'Cyberpunk neon sunset' : 
                                                     tKey === 'blue' ? 'Deep ocean tranquility' : 
                                                     'Velvet rose dynamic power'}
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
                                            onChange={async (e) => {
                                                const val = parseFloat(e.target.value);
                                                setCrossfadeDurationState(val);
                                                await SetCrossfadeDuration(val);
                                            }}
                                            className="slider"
                                            style={{
                                                background: `linear-gradient(to right, var(--accent-color, #22C55E) 0%, var(--accent-color, #22C55E) ${((crossfadeDuration - 1) / 19) * 100}%, rgba(255, 255, 255, 0.08) ${((crossfadeDuration - 1) / 19) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                                            }}
                                        />
                                        <span className="settings-item-badge">{crossfadeDuration}s</span>
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
                    )}
                </main>
            </div>

            <footer className="playback-bar">
                <div className="playback-left">
                    {(() => {
                        const activeTrack = tracks[activeSlot];
                        return activeTrack ? (
                            <div className="playing-meta">
                                <span className="playing-spark"><BoltIcon /></span>
                                <div className="meta-text">
                                    <span className="playing-title">{getFilename(activeTrack.filePath)}</span>
                                    <span className="playing-stats">BPM: {activeTrack.bpm.toFixed(0)} | KEY: {activeTrack.keySignature}</span>
                                </div>
                            </div>
                        ) : (
                            <span className="no-playing">No Track Playing</span>
                        );
                    })()}
                </div>

                <div className="playback-middle">
                    <div className="playback-bar-controls">
                        <button className={`nav-ctrl-btn ${shuffle ? 'active' : ''}`} onClick={() => setShuffle(!shuffle)}>
                            <ShuffleIcon />
                        </button>
                        <button className="nav-ctrl-btn" onClick={handlePrev}>
                            <PrevIcon />
                        </button>
                        <button className="global-play-btn" onClick={handleGlobalPlayPause}>
                            {playing[activeSlot] ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <button className="nav-ctrl-btn" onClick={handleNext}>
                            <NextIcon />
                        </button>
                        <button className={`nav-ctrl-btn ${repeat ? 'active' : ''}`} onClick={() => setRepeat(!repeat)}>
                            <RepeatIcon />
                        </button>
                    </div>

                    <div className="progress-container">
                        <span className="progress-time">{formatTime(dragPosition !== null ? dragPosition * (tracks[activeSlot]?.durationSec ?? 0) : positions[activeSlot])}</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.001"
                            value={dragPosition !== null ? dragPosition : (tracks[activeSlot] && (tracks[activeSlot]?.durationSec ?? 0) > 0 ? positions[activeSlot] / (tracks[activeSlot]?.durationSec ?? 1) : 0)}
                            onChange={(e) => setDragPosition(parseFloat(e.target.value))}
                            onMouseUp={() => {
                                if (dragPosition !== null) {
                                    handleSeek(activeSlot, dragPosition);
                                    setDragPosition(null);
                                }
                            }}
                            onTouchEnd={() => {
                                if (dragPosition !== null) {
                                    handleSeek(activeSlot, dragPosition);
                                    setDragPosition(null);
                                }
                            }}
                            className="progress-slider"
                            style={{
                                background: `linear-gradient(to right, var(--accent-color, #22C55E) 0%, var(--accent-color, #22C55E) ${(dragPosition !== null ? dragPosition : (tracks[activeSlot] && (tracks[activeSlot]?.durationSec ?? 0) > 0 ? positions[activeSlot] / (tracks[activeSlot]?.durationSec ?? 1) : 0)) * 100}%, rgba(255, 255, 255, 0.08) ${(dragPosition !== null ? dragPosition : (tracks[activeSlot] && (tracks[activeSlot]?.durationSec ?? 0) > 0 ? positions[activeSlot] / (tracks[activeSlot]?.durationSec ?? 1) : 0)) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                            }}
                        />
                        <span className="progress-time">
                            {(() => {
                                const activeTrack = tracks[activeSlot];
                                return activeTrack ? formatTime(activeTrack.durationSec) : "0:00";
                            })()}
                        </span>
                    </div>
                </div>

                <div className="playback-right">
                    <div className="bar-automix">
                        <span className="bar-automix-label">AUTO-MIX</span>
                        <button 
                            className={`bar-automix-toggle ${autoMix ? 'active' : ''}`}
                            onClick={handleToggleAutoMix}
                        >
                            <LightningIcon />
                            <span>{autoMix ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>

                    <div className="bar-volume">
                        <span className="vol-icon"><VolumeIcon /></span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volumes[activeSlot]}
                            onChange={(e) => handleVolume(activeSlot, parseFloat(e.target.value))}
                            className="volume-slider"
                            style={{
                                background: `linear-gradient(to right, var(--accent-color, #22C55E) 0%, var(--accent-color, #22C55E) ${volumes[activeSlot] * 100}%, rgba(255, 255, 255, 0.08) ${volumes[activeSlot] * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                            }}
                        />
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
