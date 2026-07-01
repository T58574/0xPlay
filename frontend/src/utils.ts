export const splitArtists = (artistStr: string | undefined): string[] => {
    if (!artistStr) return ['Unknown Artist'];
    
    // Regular expression to split by commas, ampersands, or feat/ft indicators
    // Separators: "," or "&" or case-insensitive "feat." / "feat" / "ft." / "ft"
    const regex = /\s*(?:,|\bfeat\.?\b|\bft\.?\b|&)\s*/i;
    
    const parts = artistStr.split(regex);
    const artists = parts
        .map(p => p.trim())
        .filter(p => p.length > 0 && p.toLowerCase() !== 'unknown artist');
        
    return artists.length > 0 ? artists : ['Unknown Artist'];
};
