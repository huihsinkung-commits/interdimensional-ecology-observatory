
import assert from 'node:assert/strict'
import { createInitialWorld } from './src/data/initialWorld.ts'
import {
  detectWorldEvents,
  appendWorldEvents,
} from './src/events/worldEvents.ts'

const original = createInitialWorld()

function copyWorld() {
  return structuredClone(original)
}

// 測試一：物種人口突破 150
{
  const before = copyWorld()
  const after = copyWorld()

  before.species[0].population = 149
  after.species[0].population = 151
  after.info.time = 1

  const events = detectWorldEvents(before, after)

  assert.ok(
    events.some(event =>
      event.type === 'species' &&
      event.title.includes('族群成長')
    )
  )

  console.log('✅ 測試一：物種人口事件正常')
}

// 測試二：文明人口突破 200
{
  const before = copyWorld()
  const after = copyWorld()

  before.civilizations[0].population = 199
  after.civilizations[0].population = 201
  after.info.time = 2

  const events = detectWorldEvents(before, after)

  assert.ok(
    events.some(event =>
      event.type === 'civilization'
    )
  )

  console.log('✅ 測試二：文明人口事件正常')
}

// 測試三：水資源進入警戒
{
  const before = copyWorld()
  const after = copyWorld()

  before.environment.water = 35
  after.environment.water = 29
  after.info.time = 3

  const events = detectWorldEvents(before, after)

  assert.ok(
    events.some(event =>
      event.type === 'environment'
    )
  )

  console.log('✅ 測試三：水資源警戒正常')
}

// 測試四：食物資源進入警戒
{
  const before = copyWorld()
  const after = copyWorld()

  before.resources.food = 250
  after.resources.food = 190
  after.info.time = 4

  const events = detectWorldEvents(before, after)

  assert.ok(
    events.some(event =>
      event.type === 'resource'
    )
  )

  console.log('✅ 測試四：食物資源警戒正常')
}

// 測試五：同一事件不重複紀錄
{
  const event = {
    id: '5-species-test',
    day: 5,
    type: 'species' as const,
    title: '測試事件',
    description: '測試去重功能',
  }

  const history = appendWorldEvents(
    [event],
    [event]
  )

  assert.equal(history.length, 1)

  console.log('✅ 測試五：歷史事件去重正常')
}

// 測試六：沒有跨越門檻就不產生事件
{
  const before = copyWorld()
  const after = copyWorld()

  before.species[0].population = 151
  after.species[0].population = 152
  after.info.time = 6

  const events = detectWorldEvents(before, after)

  assert.equal(events.length, 0)

  console.log('✅ 測試六：無門檻事件時正常')
}

console.log('')
console.log('🎉 步驟 5-18：六項事件判斷測試全部通過！')
