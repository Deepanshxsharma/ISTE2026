uniform sampler2D nbakedm;
uniform sampler2D dbakedm;
uniform sampler2D lightMapm;
uniform float uLightAmount;

// Two lighting states: "from" (outside the wave) and "to" (inside the wave).
uniform float uFromNightMix;
uniform float uFromExposure;
uniform vec3 uFromTint;
uniform float uFromTintAmount;
uniform vec3 uFromBoardColor;
uniform float uFromBoardStrength;
uniform vec3 uFromDeskColor;
uniform float uFromDeskStrength;
uniform vec3 uFromPcColor;
uniform float uFromPcStrength;

uniform float uToNightMix;
uniform float uToExposure;
uniform vec3 uToTint;
uniform float uToTintAmount;
uniform vec3 uToBoardColor;
uniform float uToBoardStrength;
uniform vec3 uToDeskColor;
uniform float uToDeskStrength;
uniform vec3 uToPcColor;
uniform float uToPcStrength;

uniform vec3 uWaveOrigin;
uniform float uWaveRadius;
uniform float uWaveWidth;
uniform float uWaveStrength;
uniform vec3 uWaveColor;

varying vec2 vUv;
varying vec3 vWorld;

#include "../partials/blend.glsl"

vec3 shade(
    vec3 dayColor, vec3 nightColor, vec3 lightMap,
    float nightMix, float exposure, vec3 tint, float tintAmount,
    vec3 boardColor, float boardStrength,
    vec3 deskColor, float deskStrength,
    vec3 pcColor, float pcStrength
) {
    vec3 color = mix(dayColor, nightColor, nightMix) * exposure;

    // Duotone grade: pull shadows and mid-tones towards the mood tint.
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    vec3 graded = tint * (0.18 + luma * 2.4);
    color = mix(color, graded, tintAmount * (1.0 - smoothstep(0.55, 1.1, luma)));

    color = blendLighten(color, boardColor, lightMap.r * boardStrength * uLightAmount);
    color = blendLighten(color, deskColor, lightMap.g * deskStrength * uLightAmount);
    color = blendLighten(color, pcColor, lightMap.b * pcStrength * uLightAmount);
    return color;
}

// The lightmaps are heavily compressed; strong mood lights amplify their block artifacts.
// Light falloff is smooth, so a small gaussian tap pattern hides the blocks without losing shape.
vec3 softLightMap(vec2 uv) {
    const float s = 3.0 / 4096.0;
    vec3 sum = texture2D(lightMapm, uv).rgb * 4.0;
    sum += texture2D(lightMapm, uv + vec2( s, 0.0)).rgb * 2.0;
    sum += texture2D(lightMapm, uv + vec2(-s, 0.0)).rgb * 2.0;
    sum += texture2D(lightMapm, uv + vec2(0.0,  s)).rgb * 2.0;
    sum += texture2D(lightMapm, uv + vec2(0.0, -s)).rgb * 2.0;
    sum += texture2D(lightMapm, uv + vec2( s,  s)).rgb;
    sum += texture2D(lightMapm, uv + vec2(-s,  s)).rgb;
    sum += texture2D(lightMapm, uv + vec2( s, -s)).rgb;
    sum += texture2D(lightMapm, uv + vec2(-s, -s)).rgb;
    return sum / 16.0;
}

void main(){
    vec3 day = texture2D(dbakedm, vUv).rgb;
    vec3 night = texture2D(nbakedm, vUv).rgb;
    vec3 lightMap = softLightMap(vUv);

    float dist = distance(vWorld, uWaveOrigin);
    float reveal = smoothstep(uWaveRadius, uWaveRadius - 0.8, dist);

    vec3 color = shade(
        day, night, lightMap,
        uToNightMix, uToExposure, uToTint, uToTintAmount,
        uToBoardColor, uToBoardStrength,
        uToDeskColor, uToDeskStrength,
        uToPcColor, uToPcStrength
    );

    if (reveal < 0.999) {
        vec3 fromColor = shade(
            day, night, lightMap,
            uFromNightMix, uFromExposure, uFromTint, uFromTintAmount,
            uFromBoardColor, uFromBoardStrength,
            uFromDeskColor, uFromDeskStrength,
            uFromPcColor, uFromPcStrength
        );
        color = mix(fromColor, color, reveal);
    }

    // Leading edge of the light wave.
    float edge = (dist - uWaveRadius) / uWaveWidth;
    color += uWaveColor * exp(-edge * edge) * uWaveStrength * 1.8;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
