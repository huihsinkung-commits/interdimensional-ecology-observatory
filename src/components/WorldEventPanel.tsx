
import { useEffect, useRef, useState } from 'react'
import { useWorld } from '../context/WorldContext'
import {
  appendWorldEvents,
  detectWorldEvents,
} from '../events/worldEvents'
import type {
  WorldEvent,
  WorldEventType,
} from '../events/worldEvents'
import type { WorldState } from '../types/world'
import './WorldEventPanel.css'

// 【AI 協助設計】事件類型與篩選條件
type EventFilter = 'all' | WorldEventType
type EventSort = 'newest' | 'oldest'

const eventLabels: Record<WorldEventType, string> = {
  species: '生物',
  civilization: '文明',
  environment: '環境',
  resource: '資源',
}

const filters: {
  value: EventFilter
  label: string
}[] = [
  { value: 'all', label: '全部事件' },
  { value: 'species', label: '生物' },
  { value: 'civilization', label: '文明' },
  { value: 'environment', label: '環境' },
  { value: 'resource', label: '資源' },
]

export default function WorldEventPanel() {
  const { world, activeBranchId } = useWorld()

  const [histories, setHistories] = useState<Record<string, WorldEvent[]>>({})
  const history = histories[activeBranchId] ?? []
  const [filter, setFilter] = useState<EventFilter>('all')
  const [sort, setSort] = useState<EventSort>('newest')
  const [expanded, setExpanded] = useState(false)

  // 保留上一個世界狀態，以偵測演化事件
  const previousWorld = useRef<WorldState>(world)
  const previousBranchId = useRef(activeBranchId)

  useEffect(() => {
    // 切換平行世界時，重新建立事件比較基準
    if (previousBranchId.current !== activeBranchId) {
      previousBranchId.current = activeBranchId
      previousWorld.current = world
      setFilter('all')
      setExpanded(false)
      return
    }

    const previous = previousWorld.current

    // 日期倒退代表世界重置或返回較早狀態
    if (world.info.time < previous.info.time) {
      setHistories(current => ({
        ...current,
        [activeBranchId]: [],
      }))
      setFilter('all')
      setSort('newest')
      setExpanded(false)
      previousWorld.current = world
      return
    }

    // 只有世界日期前進才偵測新事件
    if (world.info.time > previous.info.time) {
      const incoming = detectWorldEvents(previous, world)

      if (incoming.length > 0) {
        setHistories(current => ({
          ...current,
          [activeBranchId]: appendWorldEvents(
            current[activeBranchId] ?? [],
            incoming
          ),
        }))
      }
    }

    previousWorld.current = world
  }, [world, activeBranchId])

  // 一、根據類型篩選
  const filteredEvents = history.filter(event =>
    filter === 'all' || event.type === filter
  )

  // 二、根據日期排序
  const sortedEvents = [...filteredEvents].sort((a, b) =>
    sort === 'newest'
      ? b.day - a.day
      : a.day - b.day
  )

  // 三、預設顯示 12 則，展開後顯示全部
  const visibleEvents = expanded
    ? sortedEvents
    : sortedEvents.slice(0, 12)

  return (
    <section className="world-event-panel">
      <div className="world-event-header">
        <div>
          <h2>世界歷史時間線</h2>
          <p>回顧露米亞世界的重要演化事件</p>
        </div>

        <span className="world-event-count">
          共 {history.length} 則事件
        </span>
      </div>

      <div className="lumia-history-toolbar">
        <div
          className="lumia-history-filter"
          aria-label="事件類型篩選"
        >
          {filters.map(item => (
            <button
              key={item.value}
              type="button"
              className={
                filter === item.value
                  ? 'lumia-history-filter-button active'
                  : 'lumia-history-filter-button'
              }
              aria-pressed={filter === item.value}
              onClick={() => {
                setFilter(item.value)
                setExpanded(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="lumia-history-sort-label">
          排序
          <select
            className="lumia-history-sort"
            value={sort}
            onChange={event =>
              setSort(event.target.value as EventSort)
            }
          >
            <option value="newest">最新優先</option>
            <option value="oldest">最早優先</option>
          </select>
        </label>
      </div>

      <p className="lumia-history-summary">
        目前篩選結果：{filteredEvents.length} 則
      </p>

      {visibleEvents.length === 0 ? (
        <div className="world-event-empty">
          <span className="world-event-empty-icon">
            ✨
          </span>
          <p>
            {history.length === 0
              ? '世界的故事正在等待發生……'
              : '目前沒有符合篩選條件的事件'}
          </p>
          <small>
            {history.length === 0
              ? '推進世界時間，重要變化將記錄在這裡'
              : '可以切換其他事件類型查看'}
          </small>
        </div>
      ) : (
        <ol className="world-event-list">
          {visibleEvents.map(event => (
            <li
              key={event.id}
              className="world-event-item"
            >
              <div className="world-event-meta">
                <span className="world-event-day">
                  第 {event.day} 天
                </span>

                <span
                  className={
                    `world-event-type world-event-type-${event.type}`
                  }
                >
                  {eventLabels[event.type]}
                </span>
              </div>

              <strong>{event.title}</strong>
              <p>{event.description}</p>
            </li>
          ))}
        </ol>
      )}

      {sortedEvents.length > 12 && (
        <button
          type="button"
          className="lumia-history-expand"
          aria-expanded={expanded}
          onClick={() => setExpanded(value => !value)}
        >
          {expanded
            ? '收合歷史紀錄'
            : `展開完整歷史（共 ${sortedEvents.length} 則）`}
        </button>
      )}

      <p className="world-event-footer">
        目前顯示 {visibleEvents.length} 則事件
      </p>
    </section>
  )
}
