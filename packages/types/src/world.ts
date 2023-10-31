export type ChunkId = string

export enum ResourceType {
  Tree = 'tree',
}

export interface TreeResource {
  type: ResourceType.Tree
}

export type Resource = TreeResource

export interface Tile {
  resource?: Resource
}

export interface Chunk {
  id: ChunkId
  tiles: Tile[]
}

export interface World {
  chunks: Record<ChunkId, Chunk>
}
