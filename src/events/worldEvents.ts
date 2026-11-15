
import type { WorldState } from '../types/world'

// 【AI 協助設計】事件類型
export type WorldEventType =
  | 'species'
  | 'civilization'
  | 'environment'
  | 'resource'

// 世界事件的資料格式
export interface WorldEvent {
  id: string
  day: number
  type: WorldEventType
  title: string
  description: string
}

// 判斷數值是否由低於門檻變成達到門檻
function crossedAbove(
  before: number,
  after: number,
  threshold: number
): boolean {
  return before < threshold && after >= threshold
}

// 判斷數值是否由高於門檻變成進入警戒範圍
function crossedBelow(
  before: number,
  after: number,
  threshold: number
): boolean {
  return before > threshold && after <= threshold
}

// 建立事件，使用穩定 ID 避免重複紀錄
function createEvent(
  day: number,
  type: WorldEventType,
  key: string,
  title: string, 
  description: string
): WorldEvent {
  return {
    id: `${day}-${type}-${key}`,
    day,
    type,
    title,
    description,
  }
}

// 【核心功能】比較世界演化前後的資料
export function detectWorldEvents(
  previous: WorldState,
  current: WorldState
): WorldEvent[] {
  const events: WorldEvent[] = []
  const day = current.info.time

  // 一、偵測物種人口成長
  for (const species of current.species) {
    const oldSpecies = previous.species.find(
      item => item.id === species.id
    )

    if (!oldSpecies) continue

    // 每突破 150、300、600 隻，記錄一次
    for (const threshold of [150, 300, 600]) {
      if (
        crossedAbove(
          oldSpecies.population,
          species.population,
          threshold
        )
      ) {
        events.push(
          createEvent(
            day,
            'species',
            `${species.id}-${threshold}`,
            `${species.name}族群成長`,
            `${species.name}族群達到 ${threshold} 隻。`
          )
        )
      } 
    }

    // 物種滅絕
    if (
      oldSpecies.population > 0 &&
      species.population <= 0
    ) {
      events.push(
        createEvent(
          day,
          'species',
          `${species.id}-extinct`,
          `${species.name}滅絕`,
          `${species.name}族群數量降至零。`
        )
      )
    }
  }

  // 二、偵測文明人口成長
  for (const civilization of current.civilizations) {
    const oldCivilization = 
      previous.civilizations.find(
        item => item.id === civilization.id
      )

    if (!oldCivilization) continue

    for (const threshold of [200, 300, 500, 1000]) {
      if (
        crossedAbove(
          oldCivilization.population,
          civilization.population,
          threshold
        )
      ) {
        events.push(
          createEvent(
            day,
            'civilization',
            `${civilization.id}-${threshold}`,
            `${civilization.name}人口成長`,
            `${civilization.name}人口達到 ${threshold} 人。`
          )
        )
      }
    }
  }

  // 三、偵測水資源警戒
  if (
    crossedBelow(
      previous.environment.water,
      current.environment.water,
      30
    )
  ) {
    events.push(
      createEvent(
        day,
        'environment',
        'low-water',
        '水資源警戒',
        '世界水資源下降至 30 以下，生態環境可能受到影響。'
      )
    )
  }

  // 四、偵測食物資源警戒
  if (
    crossedBelow(
      previous.resources.food,
      current.resources.food,
      200
    )
  ) {
    events.push(
      createEvent(
        day,
        'resource',
        'low-food',
        '食物資源警戒',
        '世界食物資源下降至 200 以下。'
      )
    )
  }

  return events
}

// 將新事件加入歷史紀錄，避免重複
export function appendWorldEvents(
  history: WorldEvent[],
  incoming: WorldEvent[]
): WorldEvent[] {
  const existingIds = new Set(
    history.map(event => event.id)
  )

  const result = [...history]

  for (const event of incoming) {
    if (!existingIds.has(event.id)) {
      result.push(event)
      existingIds.add(event.id)
    }
  }

  return result
}
