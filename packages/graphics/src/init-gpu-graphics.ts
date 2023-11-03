import {
  Camera,
  InitGraphicsArgs,
  InitGraphicsFn,
  Viewport,
} from '@sim-v2/types'
import { Chunk, ChunkId, getPosition } from '@sim-v2/world'
import invariant from 'tiny-invariant'
import { initMatrices } from './init-matricies.js'
import { initColorBuffer, initWebGL } from './init-webgl.js'
import { measureFps } from './measure-fps.js'
import { getGpuContext } from './util.js'

export const initGpuGraphics: InitGraphicsFn<
  Omit<InitGraphicsArgs, 'executor' | 'strategy'>
> = ({ canvas, world, callbacks, ...args }) => {
  let { viewport, camera } = args
  const { chunkSize } = world

  const controller = new AbortController()

  const gl = getGpuContext(canvas)
  invariant(gl)

  const state = initWebGL({ gl, chunkSize })

  for (const chunk of Object.values(world.chunks)) {
    const buffer = initColorBuffer({ gl, chunkSize, chunk })
    state.buffers.color[chunk.id] = buffer
  }

  gl.useProgram(state.programs.main.program)

  const {
    model,
    view,
    projection,
    updateModel,
    updateView,
  } = initMatrices({ camera, viewport })

  gl.uniformMatrix4fv(
    state.programs.main.uniforms.projection,
    false,
    projection,
  )

  gl.uniformMatrix4fv(
    state.programs.main.uniforms.view,
    false,
    view,
  )

  gl.bindBuffer(gl.ARRAY_BUFFER, state.buffers.chunk.vertex)
  gl.bindBuffer(
    gl.ELEMENT_ARRAY_BUFFER,
    state.buffers.chunk.index,
  )
  gl.enableVertexAttribArray(
    state.programs.main.attributes.vertex,
  )
  // prettier-ignore
  gl.vertexAttribPointer(
    state.programs.main.attributes.vertex,
    2, gl.FLOAT, false, 0, 0,
  )

  const animate: Record<
    ChunkId,
    {
      start: number
      duration: number
    }
  > = {}

  function addChunk(chunk: Chunk): void {
    invariant(!world.chunks[chunk.id])
    invariant(!state.buffers.color[chunk.id])
    invariant(!animate[chunk.id])

    const buffer = initColorBuffer({
      gl,
      chunkSize,
      chunk,
    })
    state.buffers.color[chunk.id] = buffer
    world.chunks[chunk.id] = chunk
  }

  const render = measureFps(
    callbacks?.reportFps,
    (_time: number) => {
      if (controller.signal.aborted) {
        return
      }

      gl.clearColor(1, 1, 1, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      for (const chunk of Object.values(world.chunks)) {
        const color = state.buffers.color[chunk.id]
        if (!color) {
          continue
        }

        gl.uniform1f(
          state.programs.main.uniforms.alpha,
          1.0,
        )

        gl.bindBuffer(gl.ARRAY_BUFFER, color)
        gl.enableVertexAttribArray(
          state.programs.main.attributes.color,
        )
        // prettier-ignore
        gl.vertexAttribPointer(
        state.programs.main.attributes.color,
        4, gl.FLOAT, false, 0, 0,
      )

        updateModel(getPosition(chunk.id, chunkSize))
        gl.uniformMatrix4fv(
          state.programs.main.uniforms.model,
          false,
          model,
        )

        gl.drawElements(
          gl.TRIANGLES,
          chunkSize ** 2 * 6,
          gl.UNSIGNED_SHORT,
          0,
        )
      }

      requestAnimationFrame(render)
    },
  )
  requestAnimationFrame(render)

  return {
    stop() {
      controller.abort()
    },
    setCamera(next: Camera, time: number): void {
      const now = performance.timeOrigin + performance.now()
      callbacks?.reportInputLatency?.(now - time)
      camera = next
      updateView(camera, viewport)
      gl.uniformMatrix4fv(
        state.programs.main.uniforms.view,
        false,
        view,
      )
    },
    setViewport(_next: Viewport): void {
      invariant(false, 'TODO')
    },
    syncChunks(chunks: Record<ChunkId, Chunk>): void {
      for (const chunk of Object.values(chunks)) {
        if (!world.chunks[chunk.id]) {
          addChunk(chunk)
        }
      }
    },
  }
}
