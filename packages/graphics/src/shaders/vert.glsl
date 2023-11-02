#version 300 es

in vec4 aVertex;
in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

flat out vec4 vColor;

void main() {
  gl_Position = uProjection * uView * uModel * aVertex;
  vColor = aColor;
}
