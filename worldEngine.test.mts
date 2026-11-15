// ============================================================
// 《異界生態觀測局》世界演化引擎測試
//
// 【AI 參與說明】
// 測試程式由 ChatGPT 協助產生
// 實際測試與驗證由開發者負責
// ============================================================

import assert from 'node:assert/strict'

import { createInitialWorld } from './src/data/initialWorld.ts'
import { advanceWorld } from './src/simulation/worldEngine.ts'

// ------------------------------------------------------------
// 一、建立初始世界
// ------------------------------------------------------------

const initialWorld = createInitialWorld()
const initialSnapshot = JSON.stringify(initialWorld)

console.log('《異界生態觀測局》世界演化測試')
console.log('='.repeat(55))

console.log(`初始世界：${initialWorld.info.name}`)
console.log(`初始時間：${initialWorld.info.time}`)

// ------------------------------------------------------------
// 二、連續推進十個時間單位
// ------------------------------------------------------------

let currentWorld = initialWorld

for (let step = 0; step < 10; step++) {
  currentWorld = advanceWorld(currentWorld)
}

// ------------------------------------------------------------
// 三、驗證世界時間
// ------------------------------------------------------------

assert.equal(currentWorld.info.time, 10)
console.log('✅ 世界時間成功推進至 10')

// ------------------------------------------------------------
// 四、驗證環境與資源
// ------------------------------------------------------------

assert.notEqual(
  currentWorld.environment.water,
  initialWorld.environment.water
)

assert.notEqual(
  currentWorld.environment.soilFertility,
  initialWorld.environment.soilFertility
)

assert.notEqual(
  currentWorld.resources.food,
  initialWorld.resources.food
)

console.log('✅ 環境與資源數值正常變化')

// ------------------------------------------------------------
// 五、驗證生物族群
// ------------------------------------------------------------

assert.equal(currentWorld.species.length, 5)

const populationChanged = currentWorld.species.some(
  (species: any, index: number) =>
    species.population !==
    initialWorld.species[index].population
)

assert.equal(populationChanged, true)
console.log('✅ 生物族群數量產生變化')

// ------------------------------------------------------------
// 六、驗證文明資料
// ------------------------------------------------------------

assert.equal(currentWorld.civilizations.length, 1)

assert.ok(
  currentWorld.civilizations[0].technology >
  initialWorld.civilizations[0].technology
)

console.log('✅ 文明技術程度正常更新')

// ------------------------------------------------------------
// 七、驗證原始資料未被修改
// ------------------------------------------------------------

assert.equal(
  JSON.stringify(initialWorld),
  initialSnapshot
)

assert.notStrictEqual(currentWorld, initialWorld)
console.log('✅ 原始世界資料未被修改')

// ------------------------------------------------------------
// 八、顯示演化結果
// ------------------------------------------------------------

console.log('\n世界演化結果')
console.log('-'.repeat(55))

console.log(
  `世界時間：${initialWorld.info.time} → ${currentWorld.info.time}`
)

console.log(
  `水資源：${initialWorld.environment.water} → ${currentWorld.environment.water}`
)

console.log(
  `土壤肥沃度：${initialWorld.environment.soilFertility} → ${currentWorld.environment.soilFertility}`
)

console.log(
  `食物資源：${initialWorld.resources.food} → ${currentWorld.resources.food}`
)

console.log('\n生物族群變化：')

currentWorld.species.forEach((species: any, index: number) => {
  console.log(
    `${species.name}：` +
    `${initialWorld.species[index].population} → ` +
    `${species.population}`
  )
})

console.log('\n文明變化：')

currentWorld.civilizations.forEach((civilization: any, index: number) => {
  const previous = initialWorld.civilizations[index]

  console.log(
    `${civilization.name}：人口 ` +
    `${previous.population} → ${civilization.population}`
  )

  console.log(
    `技術程度：${previous.technology} → ` +
    `${civilization.technology}`
  )
})

console.log('\n🎉 世界演化引擎基本測試全部通過！')
