import { Executor, InitSimulatorFn } from '@sim-v2/types'
import { initLocalSimulator } from './init-local-simulator.js'
import { initWebWorkerSimulator } from './init-web-worker-simulator.js'

export const initSimulator: InitSimulatorFn = ({
  executor,
  ...args
}) => {
  switch (executor) {
    case Executor.Local:
      return initLocalSimulator(args)
    case Executor.WebWorker:
      return initWebWorkerSimulator(args)
  }
}
