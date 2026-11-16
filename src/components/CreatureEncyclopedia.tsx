import { useState } from 'react'
import { useWorld } from '../context/WorldContext'
import './CreatureEncyclopedia.css'

type Filter = 'all' | 'stable' | 'growing' | 'declining' | 'extinct'
type Sort = 'population' | 'name' | 'temperature'

const CREATURE_ICONS: Record<string, string> = {
  '霧角鹿': '🦌',
  '螢羽鳥': '🕊️',
  '岩甲獸': '🦔',
  '月苔靈': '🌱',
  '赤尾狐': '🦊',
}

export default function CreatureEncyclopedia() {
  const { world } = useWorld()
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [filter] = useState<Filter>('all')
  const [sort] = useState<Sort>('population')

  const species = world.species
  const selected = species.find(item => item.id === selectedId) ?? species[0]

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
        return a.preferredTemperature - b.preferredTemperature
      }
      return b.population - a.population
    })

  return (
    <section className="creature-book">
      <header className="creature-heading">
        <div>
          <h2>異界生物圖鑑</h2>
          <p>探索生命如何回應世界的變化</p>
        </div>
      </header>
      <div className="creature-summary">
        <span>物種數量：{species.length}</span>
        <span>已滅絕：{species.filter(item => item.population <= 0).length}</span>
      </div>
      <div className="creature-filters">
        <input
          placeholder="搜尋生物名稱"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="creature-grid">
        {filtered.map(item => (
          <button
            type="button"
            key={item.id}
            className={selected?.id === item.id ? 'creature-card active' : 'creature-card'}
            onClick={() => setSelectedId(item.id)}
          >
            <span className="creature-icon">{CREATURE_ICONS[item.name] ?? '✨'}</span>
            <strong>{item.name}</strong>
            <span>族群：{Math.round(item.population)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
