import { useState } from 'react'
import { useWorld } from '../context/WorldContext'
import './WorldDecisionPanel.css'

type Decision = 'rain' | 'restore' | 'aid'

const decisions: {
  id: Decision
  icon: string
  title: string
  description: string
}[] = [
  {
    id: 'rain',
    icon: '🌧️',
    title: '人工降雨',
    description: '消耗 20 能量，增加 15 水資源',
  },
  {
    id: 'restore',
    icon: '🌱',
    title: '生態復育',
    description: '消耗 30 食物，土壤 +10、穩定度 +5',
  },
  {
    id: 'aid',
    icon: '🏛️',
    title: '文明援助',
    description: '消耗 20 木材、10 礦物，文明技術 +5',
  },
]

export default function WorldDecisionPanel() {
  const { world, setWorld } = useWorld()
  const [message, setMessage] = useState('')

  const canAfford = (decision: Decision) => {
    if (decision === 'rain') {
      return world.resources.energy >= 20
    }
    if (decision === 'restore') {
      return world.resources.food >= 30
    }
    return (
      world.resources.wood >= 20 &&
      world.resources.minerals >= 10 &&
      world.civilizations.length > 0
    )
  }

  function choose(decision: Decision) {
    if (world.info.status === 'running') {
      setMessage('請先暫停世界，再進行干預。')
      return
    }

    if (!canAfford(decision)) {
      setMessage('資源不足，無法執行此項決策。')
      return
    }

    setWorld(previous => {
      const next = {
        ...previous,
        environment: { ...previous.environment },
        resources: { ...previous.resources },
        civilizations: previous.civilizations.map(c => ({ ...c })),
      }

      // 再次檢查，避免資源被重複扣除
      if (decision === 'rain') {
        if (next.resources.energy < 20) return previous
        next.resources.energy -= 20
        next.environment.water = Math.min(
          100, next.environment.water + 15
        )
      }

      if (decision === 'restore') {
        if (next.resources.food < 30) return previous
        next.resources.food -= 30
        next.environment.soilFertility = Math.min(
          100, next.environment.soilFertility + 10
        )
        next.environment.stability = Math.min(
          100, next.environment.stability + 5
        )
      }

      if (decision === 'aid') {
        if (
          next.resources.wood < 20 ||
          next.resources.minerals < 10 ||
          next.civilizations.length === 0
        ) return previous

        next.resources.wood -= 20
        next.resources.minerals -= 10
        next.civilizations = next.civilizations.map(c => ({
          ...c,
          technology: Math.min(100, c.technology + 5),
        }))
      }

      return next
    })

    const titles: Record<Decision, string> = {
      rain: '人工降雨',
      restore: '生態復育',
      aid: '文明援助',
    }

    setMessage(
      `已執行「${titles[decision]}」，請推進時間觀察變化。`
    )
  }

  return (
    <section className="world-decision-panel">
      <h2>⚖️ 世界干預決策</h2>
      <p>每個選擇都需要付出代價，也可能改變世界的未來。</p>

      <div className="world-decision-grid">
        {decisions.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => choose(item.id)}
            disabled={
              world.info.status === 'running' ||
              !canAfford(item.id)
            }
          >
            <span>{item.icon}</span>
            <strong>{item.title}</strong>
            <small>{item.description}</small>
          </button>
        ))}
      </div>

      <p className="world-decision-message" role="status">
        {message}
      </p>
    </section>
  )
}
