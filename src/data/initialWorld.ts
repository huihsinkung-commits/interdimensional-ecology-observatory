// ============================================================
// 《異界生態觀測局》初始世界：露米亞
//
// 【AI 參與說明】
// 虛構世界設定及初始數值由 ChatGPT 協助產生
// 實際執行與驗證由開發者負責
// ============================================================

import type { WorldState } from '../types/world'

// 建立初始世界的工廠函式
// 每次呼叫都會產生新的資料物件，避免不同模擬實例意外共用可修改的資料
export function createInitialWorld(): WorldState {
  return {
    // 世界基本資訊
    info: {
      id: 'lumia-001',
      name: '露米亞',
      description: '森林、草原與古老聚落交織的微型世界',
      seed: 104729,
      time: 0,
      status: 'paused',
    },

    // 初始環境
    environment: {
      temperature: 23,
      rainfall: 65,
      water: 70,
      soilFertility: 75,
      stability: 80,
    },

    // 初始資源
    resources: {
      food: 700,
      wood: 450,
      minerals: 250,
      energy: 300,
    },

    // 五種虛構生物
    species: [
      {
        id: 'sp-001',
        name: '霧角鹿',
        population: 120,
        preferredTemperature: 20,
        foodDemand: 2,
        status: 'stable',
      },
      {
        id: 'sp-002',
        name: '螢羽鳥',
        population: 240,
        preferredTemperature: 24,
        foodDemand: 1,
        status: 'stable',
      },
      {
        id: 'sp-003',
        name: '岩甲獸',
        population: 65,
        preferredTemperature: 26,
        foodDemand: 3,
        status: 'stable',
      },
      {
        id: 'sp-004',
        name: '月苔靈',
        population: 320,
        preferredTemperature: 18,
        foodDemand: 1,
        status: 'stable',
      },
      {
        id: 'sp-005',
        name: '赤尾狐',
        population: 85,
        preferredTemperature: 22,
        foodDemand: 2,
        status: 'stable',
      },
    ],

    // 初始文明
    civilizations: [
      {
        id: 'civ-001',
        name: '晨霧部族',
        population: 180,
        stage: 'tribal',
        technology: 12,
        culture: '崇尚自然循環與星象觀測',
      },
    ],
  }
}
