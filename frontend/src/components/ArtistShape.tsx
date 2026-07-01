import React from 'react';

interface ArtistShapeProps {
    name: string;
    size?: number;
}

export const ArtistShape: React.FC<ArtistShapeProps> = ({ name, size = 150 }) => {
    // Generate deterministic hash from the name
    let hash = 0;
    const str = name || 'Unknown Artist';
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    // Extract hues
    const h1 = hash % 360;
    const h2 = (h1 + 80 + (hash % 100)) % 360;
    
    // Choose shape style based on hash
    const shapeType = hash % 4;
    const numPoints = 6 + (hash % 8); // 6 to 14 points
    
    // Color definitions
    const color1 = `hsl(${h1}, 80%, 55%)`;
    const color2 = `hsl(${h2}, 85%, 50%)`;
    const color3 = `hsl(${(h1 + 180) % 360}, 75%, 50%)`;

    // Render deterministic SVG path/shapes
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: 'block', borderRadius: '16px', overflow: 'hidden' }}>
            <defs>
                <linearGradient id={`grad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color1} />
                    <stop offset="100%" stopColor={color2} />
                </linearGradient>
                <radialGradient id={`rad-${hash}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </radialGradient>
                <filter id={`glow-${hash}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            
            {/* Background color/gradient overlay */}
            <rect width="100" height="100" fill="var(--bg-color)" />
            <rect width="100" height="100" fill={`url(#grad-${hash})`} opacity={0.12} />
            
            {/* Geometric center figure */}
            {renderShape(shapeType, numPoints, hash, `url(#grad-${hash})`, color3)}
            
            {/* Highlight bubble */}
            <circle cx="35" cy="35" r="22" fill={`url(#rad-${hash})`} />
        </svg>
    );
};

const renderShape = (type: number, points: number, hash: number, fill: string, altColor: string) => {
    if (type === 0) {
        // Star polygon
        const pathPoints: string[] = [];
        const center = 50;
        const rMax = 35;
        const rMin = 15 + (hash % 10);
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const r = i % 2 === 0 ? rMax : rMin;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            pathPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        return <polygon points={pathPoints.join(' ')} fill={fill} filter={`url(#glow-${hash})`} opacity={0.85} />;
    } else if (type === 1) {
        // Bezier Blob
        const center = 50;
        const baseRadius = 26;
        const pathCoords: string[] = [];
        for (let i = 0; i < points; i++) {
            const angle = (i * 2 * Math.PI) / points;
            const offset = Math.sin(angle * 3 + hash) * 6 + Math.cos(angle * 2) * 3;
            const r = baseRadius + offset;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            pathCoords.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
        }
        pathCoords.push('Z');
        return <path d={pathCoords.join(' ')} fill={fill} filter={`url(#glow-${hash})`} opacity={0.9} />;
    } else if (type === 2) {
        // Overlapping concentric rings
        const rings = [];
        const numRings = 3 + (hash % 3);
        for (let i = 0; i < numRings; i++) {
            const r = 30 - i * 6;
            const cx = 50 + Math.sin(hash + i) * (i * 1.5);
            const cy = 50 + Math.cos(hash - i) * (i * 1.5);
            rings.push(
                <circle 
                    key={i} 
                    cx={cx.toFixed(1)} 
                    cy={cy.toFixed(1)} 
                    r={r} 
                    fill={i % 2 === 0 ? fill : altColor} 
                    opacity={0.5 - i * 0.08}
                    filter={i === 0 ? `url(#glow-${hash})` : undefined}
                />
            );
        }
        return <g>{rings}</g>;
    } else {
        // Spirograph / Petals
        const petals = [];
        const numPetals = 6 + (hash % 6);
        for (let i = 0; i < numPetals; i++) {
            const angle = (i * 360) / numPetals;
            petals.push(
                <ellipse 
                    key={i}
                    cx="50" 
                    cy="50" 
                    rx="30" 
                    ry="9" 
                    fill={fill} 
                    transform={`rotate(${angle} 50 50)`} 
                    opacity={0.35}
                />
            );
        }
        return <g filter={`url(#glow-${hash})`}>{petals}</g>;
    }
};
