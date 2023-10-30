import { Graphics, Viewport } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import frag from './frag.glsl'
import { getGpuContext } from './util.js'
import vert from './vert.glsl'

type ShaderType = number
type ShaderSource = string

export function initGpuGraphics({
  canvas,
  viewport,
}: {
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
}): Graphics {
  const gl = getGpuContext(canvas)
  invariant(gl)

  const shaders = {
    vert: loadShader(gl, gl.VERTEX_SHADER, vert),
    frag: loadShader(gl, gl.FRAGMENT_SHADER, frag),
  }

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  console.log('vert', vert)

  return {
    stop() {},
    move(delta) {},
  }
}

function loadShader(
  gl: WebGL2RenderingContext,
  type: ShaderType,
  source: ShaderSource,
): WebGLShader {
  const shader = gl.createShader(type)
  invariant(shader)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  invariant(
    gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== 0,
  )
  return shader
}
