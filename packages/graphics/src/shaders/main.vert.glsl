#version 300 es

in vec2 aVertex;
in vec4 aColor;

uniform vec2 uPosition;

uniform mat4 uView;
uniform mat4 uProjection;

uniform float uAlpha;

flat out vec4 vColor;

void main() {

  mat4 m;
  m[0][0] = 1.0;
  m[1][1] = 1.0;
  m[2][2] = 1.0;
  m[3] = vec4(uPosition, 0, 1);

  gl_Position = uProjection * uView * m * vec4(aVertex, 0, 1);
  vColor = vec4(aColor.xyz, uAlpha);
}
