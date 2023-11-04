#version 300 es

precision mediump float;

flat in vec4 vColor;
out vec4 color;

void main() {
  color = vColor;
}
