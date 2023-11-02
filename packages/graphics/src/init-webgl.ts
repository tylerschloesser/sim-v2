import {
  Chunk,
  ChunkId,
  TILE_TYPE_TO_COLOR,
} from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { colorStringToArray } from './color.js'
import frag from './shaders/frag.glsl'
import vert from './shaders/vert.glsl'

type ShaderType = number
type ShaderSource = string

type Shaders = {
  vert: WebGLShader
  frag: WebGLShader
}

type WebGLAttributeLocation = number

export interface WebGLState {
  programs: {
    main: {
      program: WebGLProgram
      attributes: {
        vertex: WebGLAttributeLocation
        color: WebGLAttributeLocation
      }
      uniforms: {
        model: WebGLUniformLocation
        view: WebGLUniformLocation
        projection: WebGLUniformLocation
        // color: WebGLUniformLocation
      }
    }
  }
  buffers: {
    square: WebGLBuffer
    chunk: {
      vertex: WebGLBuffer
      index: WebGLBuffer
    }
    color: Record<ChunkId, WebGLBuffer>
  }
}

export function initWebGL({
  gl,
  chunkSize,
}: {
  gl: WebGL2RenderingContext
  chunkSize: number
}): WebGLState {
  const shaders: Shaders = {
    vert: initShader(gl, gl.VERTEX_SHADER, vert),
    frag: initShader(gl, gl.FRAGMENT_SHADER, frag),
  }

  const program = initProgram(gl, shaders)

  const state: WebGLState = {
    programs: {
      main: {
        program,
        attributes: {
          vertex: getAttribLocation(gl, program, 'aVertex'),
          color: getAttribLocation(gl, program, 'aColor'),
        },
        uniforms: {
          model: getUniformLocation(gl, program, 'uModel'),
          view: getUniformLocation(gl, program, 'uView'),
          projection: getUniformLocation(
            gl,
            program,
            'uProjection',
          ),
          // color: getUniformLocation(gl, program, 'uColor'),
        },
      },
    },
    buffers: {
      square: initSquareBuffer(gl),
      chunk: initChunkBuffer(gl, chunkSize),
      color: {},
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
): WebGLState['buffers']['chunk'] {
  const vertexBuffer = gl.createBuffer()
  invariant(vertexBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

  const vertexes = new Float32Array(
    (chunkSize + 1) ** 2 * 2,
  )

  for (let y = 0, i = 0; y < chunkSize + 1; y++) {
    for (let x = 0; x < chunkSize + 1; x++) {
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

  const indexes = new Uint8Array(chunkSize ** 2 * 6)

  for (let y = 0, i = 0; y < chunkSize; y++) {
    for (let x = 0; x < chunkSize; x++) {
      indexes[i++] = (y + 1) * (chunkSize + 1) + x
      indexes[i++] = (y + 1) * (chunkSize + 1) + x + 1
      indexes[i++] = y * (chunkSize + 1) + x

      indexes[i++] = y * (chunkSize + 1) + x + 1
      indexes[i++] = (y + 1) * (chunkSize + 1) + x + 1
      indexes[i++] = y * (chunkSize + 1) + x
    }
  }

  invariant(indexes.length === chunkSize ** 2 * 6)
  invariant(indexes.every((v) => v < vertexes.length / 2))

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

export function initColorBuffer({
  gl,
  chunkSize,
  chunk,
}: {
  gl: WebGL2RenderingContext
  chunkSize: number
  chunk: Chunk
}): WebGLBuffer {
  const buffer = gl.createBuffer()
  invariant(buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  const values = new Float32Array(chunkSize ** 2 * 4)

  let i = 0
  for (const tile of chunk.tiles) {
    const color = TILE_TYPE_TO_COLOR[tile.type]
    const [r, g, b, a] = colorStringToArray(color)
    values[i++] = r
    values[i++] = g
    values[i++] = b
    values[i++] = a
  }

  invariant(i === chunkSize ** 2 * 4)
  gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW)
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
