#version 300 es

precision mediump float;

in vec2 vTextureCoord;

uniform sampler2D uSampler;

out vec4 color;

void main() {
  color = texture(uSampler, (vTextureCoord.xy + vec2(1,1)) / vec2(2,2));
}
