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
uniform float u_bass;
uniform float u_mid;
uniform float u_high;
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
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float pulse = 1.0 + u_bass * 0.35;
    vec2 p = uv * (2.2 / pulse);
    float angle = u_time * (0.05 + u_high * 0.05);
    mat2 rot = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    p = rot * p;
    float speed = u_time * (0.15 + u_mid * 0.2 + u_high * 0.25);
    vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0) + speed * 0.25),
        fbm(p + vec2(5.2, 1.3) + speed * 0.15)
    );
    vec2 r = vec2(
        fbm(p + 4.0 * q + vec2(1.7, 9.2) - speed * 0.1),
        fbm(p + 4.0 * q + vec2(8.3, 2.8) + speed * 0.2)
    );
    float f = fbm(p + 4.0 * r);
    float dist = length(uv);
    float waveEdge = 0.55 + 0.12 * sin(angle * 4.0 + f * (5.0 + u_mid * 8.0 + u_high * 12.0));
    float blobVal = smoothstep(waveEdge + 0.25, waveEdge - 0.25, dist);
    vec3 col = mix(u_colorBg, u_colorSurface, f);
    col = mix(col, u_colorAccent, r.x * blobVal);
    col = mix(col, u_colorMuted, q.y * blobVal * 0.6);
    float glow = 0.1 * pulse / (dist + 0.12);
    col += u_colorAccent * glow * blobVal;
    col *= 1.0 - 0.18 * length(uv);
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
