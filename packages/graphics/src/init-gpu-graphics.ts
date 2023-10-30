import {
  InitGraphicsArgs,
  InitGraphicsFn,
} from '@sim-v2/types'
import { mat4 } from 'gl-matrix'
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

type WebGLAttributeLocation = number

interface Context {
  programs: {
    main: {
      program: WebGLProgram
      attributes: {
        vertex: WebGLAttributeLocation
      }
      uniforms: {
        transform: WebGLUniformLocation
      }
    }
  }
  buffers: {
    square: WebGLBuffer
  }
}

enum GraphicsState {
  Started = 'started',
  Stopped = 'stopped',
}

export const initGpuGraphics: InitGraphicsFn<
  Omit<InitGraphicsArgs, 'executor' | 'strategy'>
> = ({ canvas, camera }) => {
  let state: GraphicsState = GraphicsState.Started

  const gl = getGpuContext(canvas)
  invariant(gl)

  const shaders: Shaders = {
    vert: initShader(gl, gl.VERTEX_SHADER, vert),
    frag: initShader(gl, gl.FRAGMENT_SHADER, frag),
  }

  const program = initProgram(gl, shaders)

  const context: Context = {
    programs: {
      main: {
        program,
        attributes: {
          vertex: getAttribLocation(gl, program, 'aVertex'),
        },
        uniforms: {
          transform: getUniformLocation(
            gl,
            program,
            'uTransform',
          ),
        },
      },
    },
    buffers: {
      square: initBuffer(gl),
    },
  }

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.bindBuffer(gl.ARRAY_BUFFER, context.buffers.square)
  gl.vertexAttribPointer(
    context.programs.main.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )
  // TODO study this and figure out where it should go
  gl.enableVertexAttribArray(
    context.programs.main.attributes.vertex,
  )

  gl.useProgram(context.programs.main.program)

  const transform = mat4.create()

  gl.uniformMatrix4fv(
    context.programs.main.uniforms.transform,
    false,
    transform,
  )
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  return {
    stop() {},
    move(delta) {
      camera.position.madd(delta)
    },
  }
}

function initBuffer(
  gl: WebGL2RenderingContext,
): WebGLBuffer {
  const buffer = gl.createBuffer()
  invariant(buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  // prettier-ignore
  const square = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0,
  ]

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(square),
    gl.STATIC_DRAW,
  )
  return buffer
}

function initProgram(
  gl: WebGL2RenderingContext,
  shaders: Shaders,
): WebGLProgram {
  const program = gl.createProgram()
  invariant(program)
  gl.attachShader(program, shaders.vert)
  gl.attachShader(program, shaders.frag)
  gl.linkProgram(program)
  if (
    gl.getProgramParameter(program, gl.LINK_STATUS) === 0
  ) {
    invariant(
      false,
      `Error linking program: ${gl.getProgramInfoLog(
        program,
      )}`,
    )
  }
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
  if (
    gl.getShaderParameter(shader, gl.COMPILE_STATUS) === 0
  ) {
    invariant(
      false,
      `Error compiling shader: ${gl.getShaderInfoLog(
        shader,
      )}`,
    )
  }
  return shader
}

function getUniformLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name)
  invariant(location)
  return location
}

function getAttribLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
): WebGLAttributeLocation {
  const location = gl.getAttribLocation(program, name)
  invariant(location !== -1)
  return location
}
