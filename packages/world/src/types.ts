export type ChunkId = string

export enum ResourceType {
  Tree = 'tree',
}

export interface TreeResource {
  type: ResourceType.Tree
}

export type Resource = TreeResource

export enum TileType {
  WaterDeep = 'water-deep',
  WaterShallow = 'water-shallow',
  Sand = 'sand',
  GrassDark = 'grass-dark',
  GrassMedium = 'grass-medium',
  GrassLight = 'grass-light',
}

export interface Tile {
  type: TileType
  resource?: Resource
}

export interface Chunk {
  id: ChunkId
  tiles: Tile[]
}

export type WorldId = string

export interface World {
  id: WorldId
  seed: string
  tickDuration: number
  chunkSize: number
  tick: number
  chunks: Record<ChunkId, Chunk>
}

export enum WorldUpdateType {
  Tick = 'tick',
}

export interface TickWorldUpdate {
  type: WorldUpdateType.Tick
  tick: number
}

export type WorldUpdate = TickWorldUpdate
