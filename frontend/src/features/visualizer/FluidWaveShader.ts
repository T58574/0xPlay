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

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 warped = p;
    warped.x += sin(p.y * 1.2 + u_phaseBass * 0.5) * 0.45;
    warped.y += cos(p.x * 1.2 + u_phaseMid * 0.4) * 0.45;
    warped.x += sin(warped.y * 1.8 + u_phaseMid * 0.6) * 0.25;
    warped.y += cos(warped.x * 1.8 + u_phaseHigh * 0.5) * 0.25;
    warped.x += sin(warped.y * 2.4 + u_phaseHigh * 0.7) * 0.15;
    warped.y += cos(warped.x * 2.4 + u_phaseBass * 0.6) * 0.15;
    vec2 c0 = vec2(0.6 * sin(u_phaseBass * 0.7), 0.4 * cos(u_phaseMid * 0.5));
    vec2 c1 = vec2(-0.5 * cos(u_phaseMid * 0.6), -0.3 * sin(u_phaseHigh * 0.4));
    vec2 c2 = vec2(0.4 * cos(u_phaseHigh * 0.8), -0.5 * cos(u_phaseBass * 0.3));
    float d0 = length(warped - c0);
    float d1 = length(warped - c1);
    float d2 = length(warped - c2);
    float g0 = 1.0 / (d0 * d0 + 0.35);
    float g1 = 1.0 / (d1 * d1 + 0.45);
    float g2 = 1.0 / (d2 * d2 + 0.55);
    float total = g0 + g1 + g2 + 0.01;
    float w0 = g0 / total;
    float w1 = g1 / total;
    float w2 = g2 / total;
    vec3 col0 = u_colorAccent * 1.4;
    vec3 col1 = u_colorSurface * 1.15;
    vec3 col2 = u_colorMuted * 1.25;
    vec3 paint = col0 * w0 + col1 * w1 + col2 * w2;
    float blend = clamp(0.5 + 0.5 * sin(warped.x * 0.8 + warped.y * 0.6), 0.0, 1.0);
    vec3 col = mix(u_colorBg, paint, blend);
    float peak = pow(max(0.0, 1.0 - min(d0, min(d1, d2))), 3.5);
    col += u_colorAccent * peak * (0.35 + 0.15 * sin(u_phaseBass));
    col = pow(col, vec3(0.85));
    col = clamp(col, 0.0, 1.0);
    float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vig = clamp(pow(16.0 * vig, 0.25), 0.0, 1.0);
    col *= mix(0.7, 1.0, vig);
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

