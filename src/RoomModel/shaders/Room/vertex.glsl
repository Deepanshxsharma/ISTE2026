precision mediump float;
varying vec2 vUv;
varying vec3 vWorld;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vWorld = modelPosition.xyz;
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    vUv = uv;
}
