
import { useState } from 'react'
import { useWorld } from '../context/WorldContext'
import './CreatureEncyclopedia.css'

// 【AI 參與】異界生物圖鑑與觀測研究系統

type Note = {
  id: string
  branchId: string
  speciesId: string
  day: number
  text: string
  createdAt: string
}

type Filter = 'all' | 'stable' | 'growing' |
  'declining' | 'extinct'

type Sort = 'population' | 'name' | 'temperature'

const STORAGE_KEY = 'lumia-creature-notes-v1'

const CREATURE_ICONS: Record<string, string> = {
  '霧角鹿': '🦌',
  '螢羽鳥': '🕊️',
  '岩甲獸': '🦔',
  '月苔靈': '🌱',
  '赤尾狐': '🦊',
}

const STATUS_LABELS: Record<string, string> = {
  stable: '穩定',
  growing: '成長',
  declining: '衰退',
  extinct: '滅絕',
}

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []

    return value.filter((item): item is Note =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.branchId === 'string' &&
      typeof item.speciesId === 'string' &&
      typeof item.day === 'number' &&
      typeof item.text === 'string' &&
      typeof item.createdAt === 'string'
    ).slice(-500)
  } catch {
    return []
  }
}

export default function CreatureEncyclopedia() { 
  const {
    world, historyNodes,
    branches, activeBranchId,
  } = useWorld()

  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('population')
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [message, setMessage] = useState('')

  const activeBranch = branches.find(
    item => item.id === activeBranchId
  )

  const species = world.species
  const selected = species.find(
    item => item.id === selectedId
  ) ?? species[0]

  const filtered = species
    .filter(item =>
      item.name.includes(query.trim()) &&
      (filter === 'all' || item.status === filter)
    )
    .sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name, 'zh-TW')
      }
      if (sort === 'temperature') {
        return a.preferredTemperature -
          b.preferredTemperature
      }
      return b.population - a.population
    })

  const totalPopulation = species.reduce(
    (sum, item) => sum + item.population, 0
  )

  const ownNotes = notes.filter(
    item => item.branchId === activeBranchId &&
      item.speciesId === selected?.id
  )

  // 歷史趨勢只使用真實保存的歷史節點
  const historyPoints = selected
    ? historyNodes
        .map(node => {
          const match = node.world.species.find(
            item => item.id === selected.id
          )
          return match
            ? {
                id: node.id,
                day: node.day,
                population: match.population,
              }
            : null
        })
        .filter(
          (item): item is {
            id: string
            day: number
            population: number
          } => item !== null
        )
        .sort((a, b) => a.day - b.day)
    : []

  const dayMap = new Map<number, number>()
  for (const point of historyPoints) {
    dayMap.set(point.day, point.population)
  }

  const trend = [...dayMap.entries()]
    .map(([day, population]) => ({ 
      day, population,
    }))
    .sort((a, b) => a.day - b.day)

  const maxPopulation = Math.max(
    1, ...trend.map(point => point.population)
  )

  const environmentDifference = selected
    ? Math.abs(
        world.environment.temperature -
        selected.preferredTemperature
      )
    : 0

  function saveNote() {
    if (!selected || !noteText.trim()) return

    const note: Note = {
      id: crypto.randomUUID(),
      branchId: activeBranchId,
      speciesId: selected.id,
      day: world.info.time,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    }

    const next = [...notes, note].slice(-500)

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      )
      setNotes(next)
      setNoteText('')
      setMessage('觀測筆記已儲存')
    } catch {
      setMessage('儲存失敗，請檢查瀏覽器儲存空間')
    }
  }

  return (
    <section className="creature-book">
      <header className="creature-heading">
        <div>
          <h2>異界生物圖鑑</h2>
          <p>探索生命如何回應世界的變化</p>
        </div>
        <div className="creature-world">
          <strong>
            {activeBranch?.name ?? world.info.name}
          </strong>
          <small>第 {world.info.time} 天</small>
        </div>
      </header>

      <div className="creature-summary">
        <span>物種數量：{species.length}</span>
        <span>
          族群總數：{Math.round(totalPopulation)}
        </span>
        <span>
          已滅絕：
          {species.filter(item =>
            item.status === 'extinct' ||
            item.population <= 0
          ).length}
        </span>
      </div>

      <div className="creature-filters">
        <input
          aria-label="搜尋生物"
          placeholder="搜尋生物名稱"
          value={query}
          onChange={event =>
            setQuery(event.target.value)
          }
        />

        <select
          aria-label="生物狀態篩選"
          value={filter}
          onChange={event =>
            setFilter(event.target.value as Filter)
          }
        >
          <option value="all">所有狀態</option>
          <option value="stable">穩定</option>
          <option value="growing">成長</option>
          <option value="declining">衰退</option>
          <option value="extinct">滅絕</option>
        </select>

        <select
          aria-label="生物排序"
          value={sort}
          onChange={event =>
            setSort(event.target.value as Sort)
          }
        >
          <option value="population">族群數量</option>
          <option value="name">生物名稱</option>
          <option value="temperature">偏好溫度</option>
        </select>
      </div>

      <div className="creature-grid">
        {filtered.map(item => (
          <button
            type="button"
            key={item.id}
            className={
              selected?.id === item.id
                ? 'creature-card active'
                : 'creature-card'
            }
            onClick={() => {
              setSelectedId(item.id)
              setMessage('')
            }}
          >
            <span className="creature-icon">
              {CREATURE_ICONS[item.name] ?? '✨'}
            </span>
            <strong>{item.name}</strong>
            <small>
              {STATUS_LABELS[item.status] ??
                item.status}
            </small>
            <span>
              族群：{Math.round(item.population)}
            </span>
          </button>
        ))} 
      </div>

      {filtered.length === 0 && (
        <p>沒有符合條件的生物</p>
      )}

      {selected && (
        <div className="creature-details">
          <h3>
            {CREATURE_ICONS[selected.name] ?? '✨'}
            {' '}{selected.name}｜生物觀測檔案
          </h3>

          <div className="creature-stats">
            <div>
              <small>目前族群</small>
              <strong>
                {Math.round(selected.population)}
              </strong>
            </div>
            <div>
              <small>族群狀態</small>
              <strong>
                {STATUS_LABELS[selected.status] ??
                  selected.status}
              </strong>
            </div>
            <div>
              <small>偏好溫度</small>
              <strong>
                {selected.preferredTemperature}°C
              </strong>
            </div>
            <div>
              <small>食物需求參數</small>
              <strong>{selected.foodDemand}</strong>
            </div>
          </div>

          <h4>生存條件觀察</h4>
          <p>
            目前世界溫度為
            {' '}{world.environment.temperature}°C，
            與偏好溫度相差
            {' '}{Number(environmentDifference.toFixed(2))}°C。
          </p>
          <p>
            目前食物資源：
            {' '}{Number(world.resources.food.toFixed(2))}。
            食物需求為模型參數，不能直接當成
            每日實際消耗量
          </p>

          <h4>族群歷史趨勢</h4>
          {trend.length < 2 ? ( 
            <p>
              歷史資料不足
              請先讓世界演化並建立不同日期的歷史節點
            </p>
          ) : ( 
            <div className="creature-trend">
              {trend.slice(-12).map(point => (
                <div
                  className="creature-trend-item"
                  key={point.day}
                >
                  <small>第 {point.day} 天</small>
                  <div className="creature-trend-track">
                    <div
                      className="creature-trend-bar"
                      style={{
                        width: `${
                          point.population /
                          maxPopulation * 100
                        }%`,
                      }}
                    />
                  </div>
                  <strong>
                    {Math.round(point.population)}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <h4>生物觀測筆記</h4>
          <textarea
            aria-label="輸入生物觀測筆記"
            rows={4}
            maxLength={1000}
            placeholder="記錄你對這個物種的觀察……"
            value={noteText}
            onChange={event =>
              setNoteText(event.target.value)
            }
          />

          <button
            type="button"
            onClick={saveNote}
            disabled={!noteText.trim()}
          >
            儲存觀測筆記
          </button>

          {message && (
            <p role="status">{message}</p>
          )}

          <div className="creature-notes">
            <h4>歷史觀測筆記</h4>
            {ownNotes.length === 0 ? (
              <p>尚無觀測筆記。</p>
            ) : (
              [...ownNotes].reverse().slice(0, 10)
                .map(note => (
                  <article key={note.id}>
                    <small>第 {note.day} 天</small>
                    <p>{note.text}</p>
                  </article>
                ))
            )}
          </div>
        </div>
      )}
    </section>
  )
}
