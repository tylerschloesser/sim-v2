import {
  Camera,
  InitGraphicsArgs,
  InitGraphicsFn,
  Viewport,
} from '@sim-v2/types'
import { mat4, vec3 } from 'gl-matrix'
import invariant from 'tiny-invariant'
import { checkInputLatency } from './check-input-latency.js'
import { measureFps } from './measure-fps.js'
import frag from './shaders/frag.glsl'
import vert from './shaders/vert.glsl'
import { getGpuContext } from './util.js'

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

export const initGpuGraphics: InitGraphicsFn<
  Omit<InitGraphicsArgs, 'executor' | 'strategy'>
> = ({ canvas, appPort, ...args }) => {
  let { viewport, camera } = args

  const controller = new AbortController()

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

  const projection = mat4.create()
  mat4.scale(
    projection,
    projection,
    vec3.fromValues(1, -1, 1),
  )
  mat4.translate(
    projection,
    projection,
    vec3.fromValues(-1, -1, 0),
  )
  mat4.scale(
    projection,
    projection,
    vec3.fromValues(2, 2, 2),
  )
  mat4.scale(
    projection,
    projection,
    vec3.fromValues(
      1 / viewport.size.x,
      1 / viewport.size.y,
      1,
    ),
  )
  gl.uniformMatrix4fv(
    context.programs.main.uniforms.projection,
    false,
    projection,
  )

  const view = mat4.create()

  function updateView() {
    mat4.identity(view)

    mat4.translate(
      view,
      view,
      vec3.fromValues(
        camera.position.x,
        camera.position.y,
        0,
      ),
    )

    mat4.translate(
      view,
      view,
      vec3.fromValues(
        viewport.size.x / 2,
        viewport.size.y / 2,
        0,
      ),
    )

    mat4.scale(
      view,
      view,
      vec3.fromValues(camera.tileSize, camera.tileSize, 1),
    )
  }
  updateView()

  gl.uniform4f(
    context.programs.main.uniforms.color,
    0,
    0,
    1,
    1,
  )

  const model = mat4.create()

  const render = measureFps(appPort, (_time: number) => {
    if (controller.signal.aborted) {
      return
    }
    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    mat4.identity(model)
    mat4.translate(model, model, vec3.fromValues(0, 0, 0))

    gl.uniformMatrix4fv(
      context.programs.main.uniforms.view,
      false,
      view,
    )
    gl.uniformMatrix4fv(
      context.programs.main.uniforms.model,
      false,
      model,
    )
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    requestAnimationFrame(render)
  })
  requestAnimationFrame(render)

  return {
    stop() {
      controller.abort()
    },
    setCamera(next: Camera, time: number): void {
      checkInputLatency(appPort, time)
      camera = next
      updateView()
    },
    setViewport(_next: Viewport): void {
      invariant(false, 'TODO')
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
