import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react'

import type { WorldState } from '../types/world'
import type { WorldEvent } from '../events/worldEvents'

import { createInitialWorld } from '../data/initialWorld'
import { advanceWorld } from '../simulation/worldEngine'
import {
  appendWorldEvents,
  detectWorldEvents,
} from '../events/worldEvents'

import {
  loadParallelSave,
  saveParallelGame,
  clearGameSave,
  type GameSave,
  type HistoryNode,
  type NodeKind,
  type WorldBranch,
  type ParallelSave,
} from '../storage/worldSave'

import { fuseWorlds } from '../fusion/worldFusion'

const MAX_NODES = 100
const AUTO_INTERVAL = 10
const MAX_BRANCHES = 8

type WorldContextValue = {
  world: WorldState
  setWorld: Dispatch<SetStateAction<WorldState>>
  history: WorldEvent[]
  historyNodes: HistoryNode[]
  advanceOneDay: () => void
  resetWorld: () => void
  createHistoryNode: (name: string) => void
  renameHistoryNode: (id: string, name: string) => void
  deleteHistoryNode: (id: string) => void
  restoreHistoryNode: (id: string) => void
  branches: WorldBranch[]
  activeBranchId: string
  createBranch: (name: string) => void
  switchBranch: (id: string) => void
  renameBranch: (id: string, name: string) => void
  setBranchSpeed: (id: string, speed: number) => void
  advanceBranch: (id: string) => void
  toggleNodeProtection: (id: string) => void
  restoreTrashNode: (id: string) => void
  permanentlyDeleteTrashNode: (id: string) => void
  archiveBranch: (id: string) => void
  unarchiveBranch: (id: string) => void
  createFusionBranch: (idA: string, idB: string, weightA: number, name: string) => void
}

const WorldContext = createContext<WorldContextValue | undefined>(undefined)

function newGame(): ParallelSave {
  const loaded = loadParallelSave()
  if (loaded) return loaded

  return {
    activeBranchId: 'main',
    branches: [{
      id: 'main',
      name: '露米亞主世界',
      speed: 1,
      createdAt: new Date().toISOString(),
      world: createInitialWorld(),
      history: [],
      historyNodes: [],
      trash: [],
    }],
  }
}

function makeNode(
  name: string,
  kind: NodeKind,
  world: WorldState,
  history: WorldEvent[]
): HistoryNode {
  return {
    id: crypto.randomUUID(),
    name,
    kind,
    day: world.info.time,
    createdAt: new Date().toISOString(),
    world: structuredClone(world),
    history: structuredClone(history),
    protected: false,
  }
}

function addNode(nodes: HistoryNode[], node: HistoryNode) {
  return [...nodes, node].slice(-MAX_NODES)
}

function evolve(game: GameSave, nextWorld: WorldState): GameSave {
  const forward = nextWorld.info.time > game.world.info.time
  const backward = nextWorld.info.time < game.world.info.time

  const incoming = forward ? detectWorldEvents(game.world, nextWorld) : []
  const history = backward ? [] : appendWorldEvents(game.history, incoming)
  let nodes = game.historyNodes

  if (forward) {
    const prevBucket = Math.floor(game.world.info.time / AUTO_INTERVAL)
    const nextBucket = Math.floor(nextWorld.info.time / AUTO_INTERVAL)
    if (nextBucket > prevBucket) {
      nodes = addNode(nodes, makeNode(`第 ${nextWorld.info.time} 天・自動節點`, 'auto', nextWorld, history))
    }
  }

  return { world: nextWorld, history, historyNodes: nodes }
}

export function WorldProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<ParallelSave>(newGame)

  const active = game.branches.find(b => b.id === game.activeBranchId) ?? game.branches[0]

  function updateActive(transform: (branch: WorldBranch) => WorldBranch) {
    setGame(previous => ({
      ...previous,
      branches: previous.branches.map(b => b.id === previous.activeBranchId ? transform(b) : b),
    }))
  }

  const setWorld = useCallback<Dispatch<SetStateAction<WorldState>>>(update => {
    setGame(previous => ({
      ...previous,
      branches: previous.branches.map(branch => {
        if (branch.id !== previous.activeBranchId) return branch
        const nextWorld = typeof update === 'function' ? update(branch.world) : update
        return { ...branch, ...evolve(branch, nextWorld) }
      }),
    }))
  }, [])

  const advanceOneDay = useCallback(() => {
    setWorld(previous => advanceWorld(previous))
  }, [setWorld])

  const resetWorld = useCallback(() => {
    clearGameSave()
    setGame(newGame())
  }, [])

  const createHistoryNode = useCallback((name: string) => {
    updateActive(branch => ({
      ...branch,
      historyNodes: addNode(
        branch.historyNodes,
        makeNode(name.trim() || `第 ${branch.world.info.time} 天・手動存檔`, 'manual', branch.world, branch.history)
      ),
    }))
  }, [])

  const renameHistoryNode = useCallback((id: string, name: string) => {
    if (!name.trim()) return
    updateActive(branch => ({
      ...branch,
      historyNodes: branch.historyNodes.map(node => node.id === id ? { ...node, name: name.trim() } : node),
    }))
  }, [])

  const deleteHistoryNode = useCallback((id: string) => {
    updateActive(branch => {
      const node = branch.historyNodes.find(item => item.id === id)
      if (!node || node.protected) return branch
      return {
        ...branch,
        historyNodes: branch.historyNodes.filter(item => item.id !== id),
        trash: [...(branch.trash ?? []), node].slice(-100),
      }
    })
  }, [])

  const restoreHistoryNode = useCallback((id: string) => {
    updateActive(branch => {
      const node = branch.historyNodes.find(item => item.id === id)
      if (!node) return branch
      const safety = makeNode(`回溯前備份・第 ${branch.world.info.time} 天`, 'safety', branch.world, branch.history)
      return {
        ...branch,
        world: {
          ...structuredClone(node.world),
          info: { ...node.world.info, status: 'paused' },
        },
        history: structuredClone(node.history),
        historyNodes: addNode(branch.historyNodes, safety),
      }
    })
  }, [])

  const createBranch = useCallback((name: string) => {
    setGame(previous => {
      if (previous.branches.length >= MAX_BRANCHES) return previous
      const source = previous.branches.find(b => b.id === previous.activeBranchId)
      if (!source) return previous

      const copy: WorldBranch = {
        ...structuredClone(source),
        id: crypto.randomUUID(),
        parentBranchId: source.id,
        parentBranchName: source.name,
        parentDay: source.world.info.time,
        archived: false,
        trash: [],
        name: name.trim() || `${source.name}・平行分支`,
        speed: 1,
        createdAt: new Date().toISOString(),
      }
      return { ...previous, branches: [...previous.branches, copy], activeBranchId: copy.id }
    })
  }, [])

  const switchBranch = useCallback((id: string) => {
    setGame(previous => {
      if (!previous.branches.some(b => b.id === id && !b.archived)) return previous
      return { ...previous, activeBranchId: id }
    })//
  }, [])

  const renameBranch = useCallback((id: string, name: string) => {
    if (!name.trim()) return
    setGame(previous => ({
      ...previous,
      branches: previous.branches.map(b => b.id === id ? { ...b, name: name.trim() } : b),
    }))
  }, [])

  const setBranchSpeed = useCallback((id: string, speed: number) => {
    if (![1, 5, 10].includes(speed)) return
    setGame(previous => ({
      ...previous,
      branches: previous.branches.map(b => b.id === id ? { ...b, speed } : b),
    }))
  }, [])

  const advanceBranch = useCallback((id: string) => {
    setGame(previous => ({
      ...previous,
      branches: previous.branches.map(branch => {
        if (branch.id !== id || branch.archived) return branch
        let next: GameSave = {
          world: branch.world,
          history: branch.history,
          historyNodes: branch.historyNodes,
        }
        for (let i = 0; i < branch.speed; i++) {
          next = evolve(next, advanceWorld(next.world))
        }
        return { ...branch, ...next }
      }),
    }))
  }, [])

  const toggleNodeProtection = useCallback((id: string) => {
    updateActive(branch => ({
      ...branch,
      historyNodes: branch.historyNodes.map(n => n.id === id ? { ...n, protected: !n.protected } : n),
    }))
  }, [])

  const restoreTrashNode = useCallback((id: string) => {
    updateActive(branch => {
      const node = (branch.trash ?? []).find(item => item.id === id)
      if (!node) return branch
      return {
        ...branch,
        trash: (branch.trash ?? []).filter(item => item.id !== id),
        historyNodes: addNode(branch.historyNodes, node),
      }
    })
  }, [])

  const permanentlyDeleteTrashNode = useCallback((id: string) => {
    updateActive(branch => ({
      ...branch,
      trash: (branch.trash ?? []).filter(item => item.id !== id),
    }))
  }, [])

  const archiveBranch = useCallback((id: string) => {
    if (id === 'main') return
    setGame(previous => {
      const target = previous.branches.find(item => item.id === id)
      if (!target) return previous
      return {
        ...previous,
        activeBranchId: previous.activeBranchId === id ? 'main' : previous.activeBranchId,
        branches: previous.branches.map(b => b.id === id ? { ...b, archived: true, world: { ...b.world, info: { ...b.world.info, status: 'paused' } } } : b),
      }
    })
  }, [])

  const unarchiveBranch = useCallback((id: string) => {
    setGame(previous => ({
      ...previous,
      branches: previous.branches.map(b => b.id === id ? { ...b, archived: false } : b),
    }))
  }, [])

  const createFusionBranch = useCallback((idA: string, idB: string, weightA: number, name: string) => {
    setGame(previous => {
      if (previous.branches.length >= MAX_BRANCHES || idA === idB || !Number.isFinite(weightA) || weightA < 0 || weightA > 1) return previous
      const a = previous.branches.find(item => item.id === idA)
      const b = previous.branches.find(item => item.id === idB)
      if (!a || !b) return previous

      const world = fuseWorlds(a, b, weightA)
      const branchName = name.trim() || `${a.name} × ${b.name}・融合世界`
      world.info.name = branchName

      const fused: WorldBranch = {
        id: crypto.randomUUID(),
        name: branchName,
        speed: 1,
        createdAt: new Date().toISOString(),
        world,
        history: [],
        historyNodes: [],
        trash: [],
        lineage: {
          kind: 'fusion',
          origins: [
            { branchId: a.id, branchName: a.name, weight: weightA },
            { branchId: b.id, branchName: b.name, weight: 1 - weightA },
          ],
        },
      }
      return { ...previous, branches: [...previous.branches, fused], activeBranchId: fused.id }
    })
  }, [])

  useEffect(() => {
    saveParallelGame(game)
  }, [game])

  return (
    <WorldContext.Provider value={{
      world: active.world,
      setWorld,
      history: active.history,
      historyNodes: active.historyNodes,
      advanceOneDay,
      resetWorld,
      createHistoryNode,
      renameHistoryNode,
      deleteHistoryNode,
      restoreHistoryNode,
      branches: game.branches,
      activeBranchId: game.activeBranchId,
      createBranch,
      switchBranch,
      renameBranch,
      setBranchSpeed,
      advanceBranch,
      toggleNodeProtection,
      restoreTrashNode,
      permanentlyDeleteTrashNode,
      archiveBranch,
      unarchiveBranch,
      createFusionBranch,
    }}>
      {children}
    </WorldContext.Provider>
  )
}

export function useWorld() {
  const context = useContext(WorldContext)
  if (!context) throw new Error('useWorld 必須在 WorldProvider 內使用')
  return context
}
