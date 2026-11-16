import type { WorldState } from '../types/world'
import type { WorldBranch } from '../storage/worldSave'

export interface FusionOrigin {
  branchId: string
  branchName: string
  weight: number
}

export interface FusionLineage {
  kind: 'fusion'
  origins: [FusionOrigin, FusionOrigin]
}

export function weighted(
  a: number,
  b: number,
  weightA: number
): number {
  return Number(
    (a * weightA + b * (1 - weightA)).toFixed(2)
  )
}

export function fuseWorlds(
  a: WorldBranch,
  b: WorldBranch,
  weightA: number
): WorldState {
  if (a.id === b.id) {
    throw new Error('融合來源必須是不同世界')
  }

  if (!Number.isFinite(weightA) || weightA < 0 || weightA > 1) {
    throw new Error('融合權重必須介於 0 與 1')
  }

  const w = (x: number, y: number) => weighted(x, y, weightA)

  const speciesIds = new Set([
    ...a.world.species.map(s => s.id),
    ...b.world.species.map(s => s.id),
  ])

  const species = [...speciesIds].map(id => {
    const sa = a.world.species.find(s => s.id === id)
    const sb = b.world.species.find(s => s.id === id)

    if (!sa && !sb) {
      throw new Error('無法取得物種資料')
    }

    const template = structuredClone(sa ?? sb!)
    const population = Math.max(
      0, Math.round(w(
        sa?.population ?? 0,
        sb?.population ?? 0
      ))
    )

    return {
      ...template,
      population,
      preferredTemperature: w(
        sa?.preferredTemperature ?? sb!.preferredTemperature,
        sb?.preferredTemperature ?? sa!.preferredTemperature
      ),
      foodDemand: w(
        sa?.foodDemand ?? sb!.foodDemand,
        sb?.foodDemand ?? sa!.foodDemand
      ),
      status: population === 0
        ? 'extinct' as const
        : 'stable' as const,
    }
  })

  const civilizationIds = new Set([
    ...a.world.civilizations.map(c => c.id),
    ...b.world.civilizations.map(c => c.id),
  ])

  const civilizations = [...civilizationIds].map(id => {
    const ca = a.world.civilizations.find(c => c.id === id)
    const cb = b.world.civilizations.find(c => c.id === id)

    if (!ca && !cb) {
      throw new Error('無法取得文明資料')
    }

    const template = structuredClone(ca ?? cb!)
    const culture = weightA >= 0.5
      ? (ca?.culture ?? cb!.culture)
      : (cb?.culture ?? ca!.culture)

    return {
      ...template,
      population: Math.max(
        0, Math.round(w(
          ca?.population ?? 0,
          cb?.population ?? 0
        ))
      ),
      technology: w(
        ca?.technology ?? cb!.technology,
        cb?.technology ?? ca!.technology
      ),
      culture,
    }
  })

  const ea = a.world.environment
  const eb = b.world.environment
  const ra = a.world.resources
  const rb = b.world.resources

  return {
    info: {
      ...structuredClone(a.world.info),
      id: crypto.randomUUID(),
      name: '融合世界',
      description: `融合 ${a.name} 與 ${b.name}`,
      time: Math.round(
        w(a.world.info.time, b.world.info.time)
      ),
      status: 'paused',
    },
    environment: {
      temperature: w(ea.temperature, eb.temperature),
      rainfall: w(ea.rainfall, eb.rainfall),
      water: w(ea.water, eb.water),
      soilFertility: w(
        ea.soilFertility, eb.soilFertility
      ),
      stability: w(ea.stability, eb.stability),
    },
    resources: {
      food: w(ra.food, rb.food),
      wood: w(ra.wood, rb.wood),
      minerals: w(ra.minerals, rb.minerals),
      energy: w(ra.energy, rb.energy),
    },
    species,
    civilizations,
  }
}

export function createResearchReport(
  branch: WorldBranch,
  allBranches: WorldBranch[]
): string {
  const world = branch.world
  const totalSpecies = world.species.reduce(
    (sum, item) => sum + item.population, 0
  )
  const totalCivilization = world.civilizations.reduce(
    (sum, item) => sum + item.population, 0
  )

  const lineage = branch.lineage
  const originText = lineage
    ? lineage.origins.map(origin =>
        `- ${origin.branchName}：${Math.round(origin.weight * 100)}%`
      ).join('\n')
    : '- 非融合世界'

  const speciesLines = world.species.map(item =>
    `| ${item.name} | ${item.population} | ${item.status} |`
  ).join('\n')

  const civLines = world.civilizations.map(item =>
    `| ${item.name} | ${item.population} | ${item.stage} | ${item.technology} |`
  ).join('\n')

  const related = allBranches.filter(item =>
    item.lineage?.origins.some(origin =>
      origin.branchId === branch.id
    )
  )

  return [
    `# ${branch.name}｜世界研究報告`,
    '',
    `產生日期：${new Date().toLocaleString('zh-TW')}`,
    `世界日期：第 ${world.info.time} 天`,
    '',
    '## 一、世界來源',
    originText,
    '',
    '## 二、環境觀測',
    `- 溫度：${world.environment.temperature}`,
    `- 降雨：${world.environment.rainfall}`,
    `- 水資源：${world.environment.water}`,
    `- 土壤肥沃度：${world.environment.soilFertility}`,
    `- 環境穩定度：${world.environment.stability}`,
    '',
    '## 三、資源狀態',
    `- 食物：${world.resources.food}`,
    `- 木材：${world.resources.wood}`,
    `- 礦物：${world.resources.minerals}`,
    `- 能源：${world.resources.energy}`,
    '',
    '## 四、生物觀測',
    `生物總數：${totalSpecies}`,
    '',
    '| 物種 | 族群數量 | 狀態 |',
    '|---|---:|---|',
    speciesLines,
    '',
    '## 五、文明觀測',
    `文明總人口：${totalCivilization}`,
    '',
    '| 文明 | 人口 | 階段 | 科技 |',
    '|---|---:|---|---:|',
    civLines,
    '',
    '## 六、世界歷史',
    `- 事件紀錄：${branch.history.length} 則`,
    `- 歷史節點：${branch.historyNodes.length} 個`,
    `- 以此世界為來源的融合分支：${related.length} 個`,
    '',
    '## 七、研究說明',
    '本報告根據遊戲模擬資料自動產生。',
    '數值代表模型內部狀態，不代表真實生態預測。',
    '',
  ].join('\n')
}
