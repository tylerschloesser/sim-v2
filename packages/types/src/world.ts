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

export interface World {
  chunkSize: number
  chunks: Record<ChunkId, Chunk>
}
