
import type { WorldState } from '../types/world'
import type { WorldEvent } from '../events/worldEvents'

const SAVE_KEY = 'lumia-world-save-v1'
const SAVE_VERSION = 3

export type NodeKind = 'auto' | 'manual' | 'safety'

export interface HistoryNode {
  id: string
  name: string
  kind: NodeKind
  day: number
  createdAt: string
  world: WorldState
  history: WorldEvent[]
  protected?: boolean
}

export interface GameSave {
  world: WorldState
  history: WorldEvent[]
  historyNodes: HistoryNode[]
}

export interface WorldBranch extends GameSave {
  id: string
  name: string
  speed: number
  createdAt: string
  archived?: boolean
  parentBranchId?: string
  parentBranchName?: string
  parentDay?: number
  trash?: HistoryNode[]
  lineage?: {
    kind: 'fusion'
    origins: [
      { branchId: string; branchName: string; weight: number },
      { branchId: string; branchName: string; weight: number }
    ]
  }
}

export interface ParallelSave {
  activeBranchId: string
  branches: WorldBranch[]}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' &&
    value !== null && !Array.isArray(value)
}

function numeric(
  value: Record<string, unknown>,
  fields: string[]
): boolean {
  return fields.every(key =>
    typeof value[key] === 'number' &&
    Number.isFinite(value[key])
  )
}

function validWorld(value: unknown): value is WorldState {
  if (!object(value) ||
      !object(value.info) ||
      !object(value.environment) ||
      !object(value.resources) ||
      !Array.isArray(value.species) ||
      !Array.isArray(value.civilizations)) return false

  if (
    typeof value.info.id !== 'string' ||
    typeof value.info.name !== 'string' ||
    !Number.isInteger(value.info.time) ||
    (value.info.time as number) < 0 ||
    !['paused', 'running'].includes(String(value.info.status))
  ) return false

  if (!numeric(value.environment, [
    'temperature', 'rainfall', 'water',
    'soilFertility', 'stability'
  ]) || !numeric(value.resources, [
    'food', 'wood', 'minerals', 'energy'
  ])) return false

  return value.species.every(item =>
    object(item) &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    numeric(item, [
      'population', 'preferredTemperature', 'foodDemand'
    ]) &&
    ['stable', 'growing', 'declining', 'extinct']
      .includes(String(item.status))
  ) && value.civilizations.every(item =>
    object(item) &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    numeric(item, ['population', 'technology']) &&
    typeof item.culture === 'string' &&
    ['tribal', 'village', 'city', 'kingdom']
      .includes(String(item.stage))
  )
}

function validHistory(value: unknown): value is WorldEvent[] {
  return Array.isArray(value) && value.every(item =>
    object(item) &&
    typeof item.id === 'string' &&
    Number.isInteger(item.day) &&
    (item.day as number) >= 0 &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    ['species', 'civilization', 'environment', 'resource']
      .includes(String(item.type))
  )
}

function validNodes(value: unknown): value is HistoryNode[] {
  return Array.isArray(value) &&
    value.length <= 500 &&
    value.every(item =>
      object(item) &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      ['auto', 'manual', 'safety'].includes(String(item.kind)) &&
      Number.isInteger(item.day) &&
      typeof item.createdAt === 'string' &&
      validWorld(item.world) &&
      item.day === item.world.info.time &&
      validHistory(item.history)
    )
}

function validGame(value: unknown): value is GameSave {
  return object(value) &&
    validWorld(value.world) &&
    validHistory(value.history) &&
    validNodes(value.historyNodes)
}

function validParallel(value: unknown): value is ParallelSave {
  if (!object(value) ||
      typeof value.activeBranchId !== 'string' ||
      !Array.isArray(value.branches) ||
      value.branches.length < 1 ||
      value.branches.length > 20) return false

  const ids = new Set<string>()

  for (const item of value.branches) {
    if (!object(item) ||
        !validGame(item) ||
        typeof item.id !== 'string' ||
        !item.id ||
        typeof item.name !== 'string' ||
        typeof item.createdAt !== 'string' ||
        ![1, 5, 10].includes(Number(item.speed)) ||
        ids.has(item.id)) return false

    ids.add(item.id)
  }

  return ids.has(value.activeBranchId)
}

function makeMain(data: GameSave): ParallelSave {
  return {
    activeBranchId: 'main',
    branches: [{
      ...data,
      id: 'main',
      name: '露米亞主世界',
      speed: 1,
      createdAt: new Date().toISOString(),
    }],
  }
}

export function loadParallelSave(): ParallelSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!object(parsed)) return null

    if (parsed.version === SAVE_VERSION && validParallel(parsed.data)) {
      return parsed.data
    }

    if (parsed.version === 2 && validGame(parsed.data)) {
      return makeMain(parsed.data)
    }

    if (parsed.version === 1 && object(parsed.data)) {
      const data = parsed.data
      if (validWorld(data.world) && validHistory(data.history)) {
        return makeMain({
          world: data.world,
          history: data.history,
          historyNodes: [],
        })
      }
    }

    console.warn('世界存檔版本或資料格式不相容')
    return null
  } catch (error) {
    console.warn('世界存檔讀取失敗', error)
    return null
  }
}

export function saveParallelGame(data: ParallelSave): void {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: SAVE_VERSION, data })
    )
  } catch (error) {
    console.warn('平行世界存檔寫入失敗', error)
  }
}

export function clearGameSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch (error) {
    console.warn('無法清除存檔', error)
  }
}
