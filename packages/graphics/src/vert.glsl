attribute vec4 aVertex;
uniform mat4 uTransform;
void main() {
  gl_Position = uTransform * aVertex;
}
