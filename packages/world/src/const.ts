import { TileType } from './types.js'

export const TILE_TYPE_TO_COLOR: Record<TileType, string> =
  {
    [TileType.WaterDeep]: 'hsl(217, 94%, 34%)',
    [TileType.WaterShallow]: 'hsl(217, 58%, 52%)',
    [TileType.GrassDark]: 'hsl(141, 85%, 17%)',
    [TileType.GrassMedium]: 'hsl(141, 65%, 27%)',
    [TileType.GrassLight]: 'hsl(141, 65%, 44%)',
  }
