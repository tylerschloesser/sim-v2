import { getVisibleChunkIds } from '@sim-v2/camera'
import { easeOut } from '@sim-v2/math'
import {
  Camera,
  InitGraphicsArgs,
  InitGraphicsFn,
  StatType,
  SyncChunkFn,
  Viewport,
} from '@sim-v2/types'
import { ChunkId, getPosition } from '@sim-v2/world'
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
  invariant(Object.keys(world.chunks).length === 0)

  const controller = new AbortController()

  const gl = getGpuContext(canvas)
  invariant(gl)

  const state = initWebGL({ gl, chunkSize, viewport })

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

  const { view, projection, updateView } = initMatrices({
    camera,
    viewport,
  })

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

  const syncChunk: SyncChunkFn = (chunk) => {
    invariant(!world.chunks[chunk.id])
    invariant(!state.buffers.color[chunk.id])
    invariant(!animate[chunk.id])

    function callback() {
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

      world.chunks[chunk.id] = chunk
    }

    // queue creating the chunk because it takes a while
    if (typeof self.requestIdleCallback === 'function') {
      self.requestIdleCallback(callback)
    } else {
      // not available on web workers, not documented...
      callback()
    }
  }

  function renderMain(time: number) {
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

      const position = getPosition(chunk.id, chunkSize)
      gl.uniform2f(
        state.programs.main.uniforms.position,
        position.x,
        position.y,
      )

      gl.drawElements(
        gl.TRIANGLES,
        chunkSize ** 2 * 6,
        gl.UNSIGNED_SHORT,
        0,
      )
    }

    reportRenderedChunks(renderedChunkCount)
  }

  const render = measureFps(
    callbacks.reportStat,
    (time: number) => {
      if (controller.signal.aborted) {
        return
      }
      renderMain(time)

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
    syncChunk,
  }
}
