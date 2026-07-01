export const VERTEX_SHADER_SOURCE = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_phaseBass;
uniform float u_phaseMid;
uniform float u_phaseHigh;
uniform vec3 u_colorBg;
uniform vec3 u_colorAccent;
uniform vec3 u_colorSurface;
uniform vec3 u_colorMuted;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    v += a * noise(p); p = rot * p * 2.0; a *= 0.5;
    v += a * noise(p);
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    vec2 warp1 = vec2(
        fbm(p + vec2(u_phaseBass * 0.4, u_phaseMid * 0.25)),
        fbm(p + vec2(u_phaseMid * 0.35, -u_phaseBass * 0.5))
    );
    
    vec2 warp2 = vec2(
        fbm(p + 3.0 * warp1 + vec2(u_phaseHigh * 0.15, u_phaseBass * 0.08)),
        fbm(p + 3.0 * warp1 + vec2(-u_phaseMid * 0.15, u_phaseHigh * 0.2))
    );
    
    vec2 warpedCoords = p + 2.0 * warp2;
    
    vec2 center0 = vec2(0.6 * sin(u_phaseBass * 0.7), 0.4 * cos(u_phaseMid * 0.5));
    vec2 center1 = vec2(-0.5 * cos(u_phaseMid * 0.6), -0.3 * sin(u_phaseHigh * 0.4));
    vec2 center2 = vec2(0.4 * cos(u_phaseHigh * 0.8), -0.5 * cos(u_phaseBass * 0.3));
    
    float d0 = length(warpedCoords - center0);
    float d1 = length(warpedCoords - center1);
    float d2 = length(warpedCoords - center2);
    
    float glow0 = 1.0 / (d0 * d0 + 0.35);
    float glow1 = 1.0 / (d1 * d1 + 0.45);
    float glow2 = 1.0 / (d2 * d2 + 0.55);
    
    float totalGlow = glow0 + glow1 + glow2 + 0.01;
    float w0 = glow0 / totalGlow;
    float w1 = glow1 / totalGlow;
    float w2 = glow2 / totalGlow;
    
    vec3 col0 = u_colorAccent * 1.4;
    vec3 col1 = u_colorSurface * 1.15;
    vec3 col2 = u_colorMuted * 1.25;
    
    vec3 paintCol = col0 * w0 + col1 * w1 + col2 * w2;
    
    float blendFactor = fbm(warpedCoords * 0.75);
    vec3 col = mix(u_colorBg, paintCol, blendFactor);
    
    float peakGlow = pow(max(0.0, 1.0 - min(d0, min(d1, d2))), 3.5);
    col += u_colorAccent * peakGlow * (0.35 + 0.15 * sin(u_phaseBass));
    
    col = pow(col, vec3(0.85));
    col = clamp(col, 0.0, 1.0);
    
    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);
    col *= mix(0.7, 1.0, vignette);
    
    gl_FragColor = vec4(col, 1.0);
}
`;

export function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function createWebGLProgram(
    gl: WebGLRenderingContext,
    vsSource: string,
    fsSource: string
): WebGLProgram | null {
    const vs = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
    }
    return program;
}
