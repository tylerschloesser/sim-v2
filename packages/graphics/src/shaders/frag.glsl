#version 300 es

// TODO figure out why I need this
precision mediump float;

flat in vec4 vColor;
out vec4 color;

void main() {
  color = vColor;
}
