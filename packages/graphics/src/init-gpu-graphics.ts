import { getVisibleChunkIds } from '@sim-v2/camera'
import { easeOut } from '@sim-v2/math'
import {
  Camera,
  InitGraphicsArgs,
  InitGraphicsFn,
  StatType,
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

  const reportRenderedChunks = (() => {
    let value: number | undefined
    return (count: number) => {
      if (value !== count) {
        value = count
        callbacks.reportStat({
          type: StatType.RenderedChunks,
          value,
        })
      }
    }
  })()

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

  const visibleChunkIds = getVisibleChunkIds({
    camera,
    chunkSize,
    viewport,
  })

  function addChunk(chunk: Chunk): void {
    invariant(!world.chunks[chunk.id])
    invariant(!state.buffers.color[chunk.id])
    invariant(!animate[chunk.id])

    world.chunks[chunk.id] = chunk

    state.buffers.color[chunk.id] = initColorBuffer({
      gl,
      chunkSize,
      chunk,
    })

    // assume that if we're adding a chunk, we're showing it immediately
    animate[chunk.id] = {
      start: performance.now(),
      duration: 250,
    }
  }

  const render = measureFps(
    callbacks.reportStat,
    (time: number) => {
      if (controller.signal.aborted) {
        return
      }

      gl.clearColor(1, 1, 1, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      let renderedChunkCount = 0

      for (const chunkId of visibleChunkIds) {
        const chunk = world.chunks[chunkId]
        if (!chunk) {
          continue
        }
        const color = state.buffers.color[chunk.id]
        invariant(color)
        renderedChunkCount += 1

        let alpha: number = 1.0
        const animation = animate[chunk.id]
        if (animation) {
          const elapsed = time - animation.start
          if (elapsed >= animation.duration) {
            delete animate[chunk.id]
          } else {
            alpha = easeOut(elapsed / animation.duration)
          }
        }

        gl.uniform1f(
          state.programs.main.uniforms.alpha,
          alpha,
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

      reportRenderedChunks(renderedChunkCount)

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
      callbacks.reportStat({
        type: StatType.InputLatency,
        value: now - time,
      })
      camera = next
      updateView(camera, viewport)
      gl.uniformMatrix4fv(
        state.programs.main.uniforms.view,
        false,
        view,
      )
      getVisibleChunkIds({
        camera,
        chunkSize,
        viewport,
        chunkIds: visibleChunkIds,
      })
    },
    setViewport(_next: Viewport): void {
      invariant(false, 'TODO')
    },
    syncChunks({ chunks }): void {
      for (const chunk of chunks) {
        addChunk(chunk)
      }
    },
  }
}
