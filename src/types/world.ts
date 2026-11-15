// ============================================================
// 《異界生態觀測局》世界資料型別
//
// 【AI 參與說明】
// 由 ChatGPT 協助設計與產生
// 實際執行及驗證由開發者負責
// ============================================================

// 世界目前的運作狀態
export type WorldStatus = 'paused' | 'running'

// 文明發展階段
export type CivilizationStage =
  | 'tribal'
  | 'village'
  | 'city'
  | 'kingdom'

// 生物的生存狀態
export type SpeciesStatus =
  | 'stable'
  | 'growing'
  | 'declining'
  | 'extinct'

// 世界基本資訊
export interface WorldInfo {
  id: string
  name: string
  description: string
  seed: number
  time: number
  status: WorldStatus
}

// 環境數值
// 第一版使用簡化的數值模型
// temperature 單位為攝氏度
// 其餘數值採 0 至 100 的抽象尺度
export interface Environment {
  temperature: number
  rainfall: number
  water: number
  soilFertility: number
  stability: number
}

// 世界資源
// 第一版採抽象資源單位
export interface Resources {
  food: number
  wood: number
  minerals: number
  energy: number
}

// 生物物種
export interface Species {
  id: string
  name: string
  population: number
  preferredTemperature: number
  foodDemand: number
  status: SpeciesStatus
}

// 文明資料
export interface Civilization {
  id: string
  name: string
  population: number
  stage: CivilizationStage
  technology: number
  culture: string
}

// 完整世界資料
export interface WorldState {
  info: WorldInfo
  environment: Environment
  resources: Resources
  species: Species[]
  civilizations: Civilization[]
}
