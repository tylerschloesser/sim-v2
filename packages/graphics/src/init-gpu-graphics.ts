import { Graphics, Viewport } from '@sim-v2/types'
import invariant from 'tiny-invariant'
import frag from './frag.glsl'
import { getGpuContext } from './util.js'
import vert from './vert.glsl'

type ShaderType = number
type ShaderSource = string

type Shaders = {
  vert: WebGLShader
  frag: WebGLShader
}

export function initGpuGraphics({
  canvas,
  viewport,
}: {
  canvas: HTMLCanvasElement | OffscreenCanvas
  viewport: Viewport
}): Graphics {
  const gl = getGpuContext(canvas)
  invariant(gl)

  const shaders: Shaders = {
    vert: initShader(gl, gl.VERTEX_SHADER, vert),
    frag: initShader(gl, gl.FRAGMENT_SHADER, frag),
  }

  const program = initProgram(gl, shaders)

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  return {
    stop() {},
    move(delta) {},
  }
}

function initProgram(
  gl: WebGL2RenderingContext,
  shaders: Shaders,
) {
  const program = gl.createProgram()
  invariant(program)
  gl.attachShader(program, shaders.vert)
  gl.attachShader(program, shaders.frag)
  gl.linkProgram(program)
  invariant(
    gl.getProgramParameter(program, gl.LINK_STATUS) !== 0,
  )
  return program
}

function initShader(
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
