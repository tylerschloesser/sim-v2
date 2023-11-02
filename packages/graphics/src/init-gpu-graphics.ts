import { random } from '@sim-v2/math'
import {
  Camera,
  InitGraphicsArgs,
  InitGraphicsFn,
  Viewport,
} from '@sim-v2/types'
import {
  TILE_TYPE_TO_COLOR,
  getPosition,
  iterateTiles,
} from '@sim-v2/world'
import { mat4, vec3 } from 'gl-matrix'
import invariant from 'tiny-invariant'
import { checkInputLatency } from './check-input-latency.js'
import { colorStringToArray } from './color.js'
import {
  SyncChunkCallbackFn,
  initSimulatorMessageHandler,
} from './init-simulator-message-handler.js'
import { initColorBuffer, initWebGL } from './init-webgl.js'
import { measureFps } from './measure-fps.js'
import { getGpuContext } from './util.js'

export const initGpuGraphics: InitGraphicsFn<
  Omit<InitGraphicsArgs, 'executor' | 'strategy'>
> = ({
  canvas,
  simulatorPort,
  appPort,
  world,
  ...args
}) => {
  let { viewport, camera } = args
  const { chunkSize } = world

  const controller = new AbortController()

  const gl = getGpuContext(canvas)
  invariant(gl)

  const state = initWebGL({ gl, chunkSize })

  const syncChunkCallback: SyncChunkCallbackFn = (
    chunk,
  ) => {
    invariant(state.buffers.color[chunk.id] === undefined)
    const buffer = initColorBuffer({ gl, chunkSize, chunk })
    state.buffers.color[chunk.id] = buffer
  }

  initSimulatorMessageHandler({
    world,
    simulatorPort,
    syncChunkCallback,
  })

  gl.useProgram(state.programs.main.program)

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
    state.programs.main.uniforms.projection,
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

    mat4.translate(
      view,
      view,
      vec3.fromValues(
        camera.position.x,
        camera.position.y,
        0,
      ),
    )

    gl.uniformMatrix4fv(
      state.programs.main.uniforms.view,
      false,
      view,
    )
  }
  updateView()

  const model = mat4.create()
  const translate = vec3.create()

  // gl.bindBuffer(gl.ARRAY_BUFFER, state.buffers.square)
  // gl.vertexAttribPointer(
  //   state.programs.main.attributes.vertex,
  //   2,
  //   gl.FLOAT,
  //   false,
  //   0,
  //   0,
  // )

  gl.bindBuffer(gl.ARRAY_BUFFER, state.buffers.chunk.vertex)
  gl.bindBuffer(
    gl.ELEMENT_ARRAY_BUFFER,
    state.buffers.chunk.index,
  )
  gl.vertexAttribPointer(
    state.programs.main.attributes.vertex,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  )

  const render = measureFps(appPort, (_time: number) => {
    if (controller.signal.aborted) {
      return
    }

    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    for (const chunk of Object.values(world.chunks)) {
      // const color = state.buffers.color[chunk.id]
      // if (!color) {
      //   continue
      // }

      const color = random(
        Object.values(TILE_TYPE_TO_COLOR),
      )
      gl.uniform4f(
        state.programs.main.uniforms.color,
        ...colorStringToArray(color),
      )

      const position = getPosition(chunk, world)
      translate[0] = position.x
      translate[1] = position.y

      mat4.identity(model)
      mat4.translate(model, model, translate)
      gl.uniformMatrix4fv(
        state.programs.main.uniforms.model,
        false,
        model,
      )

      gl.drawElements(
        gl.TRIANGLES,
        chunkSize ** 2 * 6,
        gl.UNSIGNED_BYTE,
        0,
      )

      // gl.drawElements(
      //   gl.TRIANGLE_STRIP,
      //   chunkSize ** 2 * 4,
      //   gl.UNSIGNED_BYTE,
      //   0,
      // )

      // for (let { position, tile } of iterateTiles(
      //   chunk,
      //   world,
      // )) {
      //   const color = TILE_TYPE_TO_COLOR[tile.type]
      //   // prettier-ignore
      //   gl.uniform4f(
      //     state.programs.main.uniforms.color,
      //     ...colorStringToArray(color)
      //   )
      //   translate[0] = position.x
      //   translate[1] = position.y
      //   mat4.identity(model)
      //   mat4.translate(model, model, translate)
      //   gl.uniformMatrix4fv(
      //     state.programs.main.uniforms.model,
      //     false,
      //     model,
      //   )
      //   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      // }
    }

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
