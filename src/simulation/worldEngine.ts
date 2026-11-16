// ============================================================
// 《異界生態觀測局》世界演化引擎
//
// 【AI 參與說明】
// 演化規則與程式碼由 ChatGPT 協助產生
// 實際執行、驗證與參數調整由開發者負責
//
// 本模型為遊戲設計使用的簡化模擬
// 不代表真實生態系統的科學預測
// ============================================================

import type {
  WorldState,
  Species,
  CivilizationStage,
} from '../types/world'

// ------------------------------------------------------------
// 一、數值限制工具
// ------------------------------------------------------------

// 將數值限制在指定範圍內
// 例如水資源不可小於 0，也不可大於 100。
function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(maximum, Math.max(minimum, value))
}

// 將數值四捨五入到小數點後兩位
function round2(value: number): number {
  return Math.round(value * 100) / 100
}

// ------------------------------------------------------------
// 二、文明發展階段判斷
// ------------------------------------------------------------

// 根據人口及技術程度判斷文明階段
// 第一版使用簡化的遊戲規則
function determineCivilizationStage(
  population: number,
  technology: number
): CivilizationStage {

  if (population >= 1500 && technology >= 75) {
    return 'kingdom'
  }

  if (population >= 800 && technology >= 50) {
    return 'city'
  }

  if (population >= 300 && technology >= 25) {
    return 'village'
  }

  return 'tribal'
}

// ------------------------------------------------------------
// 三、世界單步演化
// ------------------------------------------------------------

// advanceWorld：
// 接收目前世界資料，計算下一個時間單位的狀態
//
// 此函式不直接修改傳入的 world，而是建立並回傳新的 WorldState
export function advanceWorld(
  world: WorldState
): WorldState {

  // ----------------------------------------------------------
  // 1. 複製目前世界資料
  // ----------------------------------------------------------

  const next: WorldState = {
    info: { ...world.info },
    environment: { ...world.environment },
    resources: { ...world.resources },

    species: world.species.map(
      species => ({ ...species })
    ),

    civilizations: world.civilizations.map(
      civilization => ({ ...civilization })
    ),
  }

  // ----------------------------------------------------------
  // 2. 推進世界時間
  // ----------------------------------------------------------

  next.info.time += 1

  // ----------------------------------------------------------
  // 3. 環境演化
  // ----------------------------------------------------------

  const environment = next.environment

  // 降雨使水資源增加
  // 高溫則使水資源流失
  const waterChange =
    (environment.rainfall - 50) * 0.12 -
    Math.max(0, environment.temperature - 22) * 0.15

  environment.water = round2(
    clamp(
      environment.water + waterChange,
      0,
      100
    )
  )

  // 水資源充足時，土壤肥沃度緩慢改善
  // 缺水時則逐漸下降
  const fertilityChange =
    (environment.water - 50) * 0.035

  environment.soilFertility = round2(
    clamp(
      environment.soilFertility + fertilityChange,
      0,
      100
    )
  )

  // 生態穩定度受到水資源與土壤條件影響
  const stabilityTarget =
    (
      environment.water +
      environment.soilFertility
    ) / 2

  environment.stability = round2(
    clamp(
      environment.stability +
      (stabilityTarget - environment.stability) * 0.08,
      0,
      100
    )
  )

  // ----------------------------------------------------------
  // 4. 資源演化
  // ----------------------------------------------------------

  const resources = next.resources

  // 食物再生量由水資源及土壤條件決定
  const foodGrowth =
    environment.water *
    environment.soilFertility *
    0.003

  // 計算所有生物的食物需求
  const speciesFoodDemand = next.species.reduce(
    (total, species) =>
      total + species.population * species.foodDemand,
    0
  )

  // 計算文明的食物需求
  const civilizationFoodDemand =
    next.civilizations.reduce(
      (total, civilization) =>
        total + civilization.population * 0.4,
      0
    )

  // 將需求轉換成每個時間單位的資源消耗
  const totalFoodConsumption =
    (
      speciesFoodDemand +
      civilizationFoodDemand
    ) * 0.012

  // 食物增加或減少，但不可小於零
  resources.food = round2(
    clamp(
      resources.food +
      foodGrowth -
      totalFoodConsumption,
      0,
      2000
    )
  )

  // 木材隨環境條件緩慢再生
  const woodGrowth =
    environment.soilFertility * 0.025

  // 文明消耗部分木材
  const woodConsumption =
    next.civilizations.reduce(
      (total, civilization) =>
        total + civilization.population * 0.003,
      0
    )

  resources.wood = round2(
    clamp(
      resources.wood +
      woodGrowth -
      woodConsumption,
      0,
      1500
    )
  )

  // 第一版礦物不會自然再生
  // 文明發展會消耗少量礦物
  const mineralConsumption =
    next.civilizations.reduce(
      (total, civilization) =>
        total + civilization.technology * 0.004,
      0
    )

  resources.minerals = round2(
    clamp(
      resources.minerals - mineralConsumption,
      0,
      1000
    )
  )

  // 能量依據水資源緩慢補充，並受到文明活動消耗
  const energyGrowth = environment.water * 0.015

  const energyConsumption =
    next.civilizations.reduce(
      (total, civilization) =>
        total + civilization.population * 0.002,
      0
    )

  resources.energy = round2(
    clamp(
      resources.energy +
      energyGrowth -
      energyConsumption,
      0,
      1000
    )
  )

  // ----------------------------------------------------------
  // 5. 生物族群演化
  // ----------------------------------------------------------

  // 食物充足程度以 0 至 1 表示
  const foodFactor = clamp(
    resources.food / 500,
    0,
    1
  )

  next.species = next.species.map(
    (species): Species => {

      // 已滅絕物種不會自行復活
      if (species.population <= 0) {
        return {
          ...species,
          population: 0,
          status: 'extinct',
        }
      }

      // 溫度越接近適應溫度，生存條件越好
      const temperatureDifference = Math.abs(
        environment.temperature -
        species.preferredTemperature
      )

      const temperatureFactor = clamp(
        1 - temperatureDifference / 25,
        0,
        1
      )

      // 環境與食物共同影響族群成長率
      const growthRate =
        0.06 * temperatureFactor * foodFactor -
        0.035 * (1 - temperatureFactor) -
        0.045 * (1 - foodFactor)

      // 根據成長率計算下一期族群數量
      const newPopulation = Math.max(
        0,
        Math.round(
          species.population * (1 + growthRate)
        )
      )

      // 根據人口變化判定生存狀態
      let status: Species['status'] = 'stable'

      if (newPopulation === 0) {
        status = 'extinct'
      } else if (newPopulation > species.population) {
        status = 'growing'
      } else if (newPopulation < species.population) {
        status = 'declining'
      }

      return {
        ...species,
        population: newPopulation,
        status,
      }
    }
  )

  // ----------------------------------------------------------
  // 6. 文明演化
  // ----------------------------------------------------------

  next.civilizations = next.civilizations.map(
    civilization => {

      // 文明人口受到食物、水資源與穩定度影響
      const livingConditions =
        (
          foodFactor +
          environment.water / 100 +
          environment.stability / 100
        ) / 3

      // 良好環境下人口成長，惡劣環境下人口可能下降
      const populationGrowthRate =
        (livingConditions - 0.45) * 0.035

      const population = Math.max(
        0,
        Math.round(
          civilization.population *
          (1 + populationGrowthRate)
        )
      )

      // 只有文明仍有人口時，技術才會成長
      const technology = round2(
        clamp(
          civilization.technology +
          (population > 0 ? livingConditions * 0.08 : 0),
          0,
          100
        )
      )

      // 重新判斷文明發展階段
      const stage = determineCivilizationStage(
        population,
        technology
      )

      return {
        ...civilization,
        population,
        technology,
        stage,
      }
    }
  )

  // ----------------------------------------------------------
  // 7. 回傳下一期世界狀態
  // ----------------------------------------------------------

  return next
}
