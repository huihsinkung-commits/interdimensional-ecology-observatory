// ============================================================
// 露米亞島嶼視覺演化規則
//
// 【AI 參與說明】
// ChatGPT 協助設計視覺參數及轉換函式
// ============================================================

import type { WorldState } from '../types/world'

// 限制數值範圍，避免視覺元素超出設計上限
function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.max(minimum, Math.min(maximum, value))
}

// 視覺參數：供 2.5D 島嶼元件使用
export type IslandVisualState = {
  treeCount: number
  waterLevel: number
  vegetationHealth: number
  creatureCount: number
  cottageCount: number
  speciesCounts: Record<string, number>
}

// 根據世界資料計算視覺狀態
export function calculateIslandVisualState(
  world: WorldState
): IslandVisualState {

  const { environment, species, civilizations } = world

  // 植物健康度：水資源與土壤各占一半
  const vegetationHealth = clamp(
    (environment.water + environment.soilFertility) / 2,
    0,
    100
  )

  // 植物越健康，顯示的樹木越多
  const treeCount = Math.round(
    3 + (vegetationHealth / 100) * 15
  )

  // 河流水位使用 0～1 的比例
  const waterLevel = clamp(
    environment.water / 100,
    0,
    1
  )

  // 各物種使用代表性數量顯示
  // 每 60 個族群成員約顯示一隻，最多 6 隻
  const speciesCounts: Record<string, number> = {}

  for (const item of species) {
    speciesCounts[item.id] =
      item.status === 'extinct' || item.population <= 0
        ? 0
        : clamp(
            Math.ceil(item.population / 60),
            1,
            6
          )
  }

  const creatureCount = Object.values(
    speciesCounts
  ).reduce((sum, count) => sum + count, 0)

  // 文明人口越多，聚落規模越大
  const civilization = civilizations[0]

  const cottageCount = civilization
    ? clamp(
        Math.ceil(civilization.population / 80),
        1,
        12
      )
    : 0

  return {
    treeCount,
    waterLevel,
    vegetationHealth,
    creatureCount,
    cottageCount,
    speciesCounts,
  }
}
