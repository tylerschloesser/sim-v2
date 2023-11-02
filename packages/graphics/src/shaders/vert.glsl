attribute vec4 aVertex;
attribute vec4 aColor;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

varying lowp vec4 vColor;

void main() {
  gl_Position = uProjection * uView * uModel * aVertex;
  vColor = aColor;
}
