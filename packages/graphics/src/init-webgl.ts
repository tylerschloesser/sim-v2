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
    chunk: {
      vertex: WebGLBuffer
      index: WebGLBuffer
    }
  }
}

export function initWebgl(
  gl: WebGL2RenderingContext,
  chunkSize: number,
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
      square: initSquareBuffer(gl),
      chunk: initChunkBuffer(gl, chunkSize),
    },
  }

  return state
}

function initSquareBuffer(
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

function initChunkBuffer(
  gl: WebGL2RenderingContext,
  chunkSize: number,
): State['buffers']['chunk'] {
  const vertexBuffer = gl.createBuffer()
  invariant(vertexBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

  const vertexes = new Float32Array(
    (chunkSize + 1) ** 2 * 2,
  )

  for (let x = 0, i = 0; x < chunkSize + 1; x++) {
    for (let y = 0; y < chunkSize + 1; y++) {
      vertexes[i++] = x
      vertexes[i++] = y
    }
  }

  invariant(vertexes.length === (chunkSize + 1) ** 2 * 2)
  invariant(vertexes.every((v) => typeof v === 'number'))

  gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  invariant(indexBuffer)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

  const indexes = new Uint8Array(chunkSize ** 2 * 4)
  for (let i = 0; i < chunkSize ** 2; ) {
    let x = i % chunkSize
    let y = Math.floor(i / chunkSize)

    indexes[i++] = y * chunkSize + x
    indexes[i++] = y * chunkSize + x + 1
    indexes[i++] = (y + 1) * chunkSize + x
    indexes[i++] = (y + 1) * chunkSize + x + 1
  }

  invariant(indexes.length === chunkSize ** 2 * 4)
  invariant(indexes.every((v) => typeof v === 'number'))

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    indexes,
    gl.STATIC_DRAW,
  )

  return {
    vertex: vertexBuffer,
    index: indexBuffer,
  }
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