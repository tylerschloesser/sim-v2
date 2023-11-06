#version 300 es

in vec2 aVertex;

out vec2 vTextureCoord;

void main() {
  gl_Position = vec4(aVertex.x, aVertex.y, 0, 1);
  vTextureCoord = aVertex;
}
