import invariant from 'tiny-invariant'
import frag from './shaders/frag.glsl'
import vert from './shaders/vert.glsl'

type ShaderType = number
type ShaderSource = string

type Shaders = {
  vert: WebGLShader
  frag: WebGLShader
}

type WebGLAttributeLocation = number

interface State {
  programs: {
    main: {
      program: WebGLProgram
      attributes: {
        vertex: WebGLAttributeLocation
      }
      uniforms: {
        model: WebGLUniformLocation
        view: WebGLUniformLocation
        projection: WebGLUniformLocation
        color: WebGLUniformLocation
      }
    }
  }
  buffers: {
    square: WebGLBuffer
  }
}

export function initWebgl(
  gl: WebGL2RenderingContext,
): State {
  const shaders: Shaders = {
    vert: initShader(gl, gl.VERTEX_SHADER, vert),
    frag: initShader(gl, gl.FRAGMENT_SHADER, frag),
  }

  const program = initProgram(gl, shaders)

  const state: State = {
    programs: {
      main: {
        program,
        attributes: {
          vertex: getAttribLocation(gl, program, 'aVertex'),
        },
        uniforms: {
          model: getUniformLocation(gl, program, 'uModel'),
          view: getUniformLocation(gl, program, 'uView'),
          projection: getUniformLocation(
            gl,
            program,
            'uProjection',
          ),
          color: getUniformLocation(gl, program, 'uColor'),
        },
      },
    },
    buffers: {
      square: initBuffer(gl),
    },
  }

  return state
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
