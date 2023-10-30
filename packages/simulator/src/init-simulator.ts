import {
  InitSimulatorFn,
  SimulatorStrategy,
} from '@sim-v2/types'
import { initLocalSimulator } from './init-local-simulator.js'
import { initWebWorkerSimulator } from './init-web-worker-simulator.js'

export const initSimulator: InitSimulatorFn = ({
  strategy,
  ...args
}) => {
  switch (strategy) {
    case SimulatorStrategy.Local:
      return initLocalSimulator(args)
    case SimulatorStrategy.WebWorker:
      return initWebWorkerSimulator({
        ...args,
        canvas: args.canvas.transferControlToOffscreen(),
      })
  }
}
