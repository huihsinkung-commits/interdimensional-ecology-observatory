
import { useState } from 'react'
import { useWorld } from '../context/WorldContext'
import './AnomalyExplorer.css'

// 【AI 參與】異界探索、事件選擇及世界後果

type Change = {
  target: 'environment' | 'resources'
  key: string
  amount: number
}

type Choice = {
  title: string
  description: string
  changes: Change[]
}

type ExplorationEvent = {
  id: string
  title: string
  icon: string
  description: string
  choices: [Choice, Choice]
}

type ExplorationRecord = {
  id: string
  branchId: string
  day: number
  eventTitle: string
  choiceTitle: string
  outcome: string
  createdAt: string
}

const STORAGE_KEY = 'lumia-exploration-records-v1'

const EVENTS: ExplorationEvent[] = [
  {
    id: 'forest',
    title: '霧光森林的異常生長',
    icon: '🌳',
    description:
      '森林深處出現發光藤蔓，植物生長速度突然加快。',
    choices: [
      {
        title: '保護異常植物',
        description: '改善土壤，但需要消耗食物補給。',
        changes: [
          {
            target: 'environment',
            key: 'soilFertility',
            amount: 5,
          },
          {
            target: 'resources',
            key: 'food',
            amount: -20,
          },
        ],
      },
      {
        title: '採集發光木材',
        description: '取得木材，但會降低環境穩定度。',
        changes: [
          {
            target: 'resources',
            key: 'wood',
            amount: 30,
          },
          {
            target: 'environment',
            key: 'stability',
            amount: -4,
          },
        ],
      },
    ],
  },
  {
    id: 'river',
    title: '月影河流的神祕波動',
    icon: '💧',
    description:
      '河流出現不尋常的光芒，水面形成規律的漣漪。',
    choices: [
      {
        title: '調查水源',
        description: '增加水資源，但需要能源。',
        changes: [
          {
            target: 'environment',
            key: 'water',
            amount: 6,
          },
          {
            target: 'resources',
            key: 'energy',
            amount: -15,
          },
        ],
      },
      {
        title: '利用水流能量',
        description: '獲得能源，但水資源略微減少。',
        changes: [
          {
            target: 'resources',
            key: 'energy',
            amount: 25,
          },
          {
            target: 'environment',
            key: 'water',
            amount: -3,
          },
        ],
      },
    ],
  },
  {
    id: 'ruins',
    title: '古代遺跡的能量核心',
    icon: '🏛️',
    description:
      '山地中的古代遺跡重新發出微弱的能量訊號。',
    choices: [
      {
        title: '研究遺跡',
        description: '消耗能源，取得礦物研究材料。',
        changes: [
          {
            target: 'resources',
            key: 'energy',
            amount: -20,
          },
          {
            target: 'resources',
            key: 'minerals',
            amount: 35,
          },
        ],
      },
      {
        title: '封存遺跡',
        description: '維持環境穩定，但需要木材。',
        changes: [
          {
            target: 'environment',
            key: 'stability',
            amount: 5,
          },
          {
            target: 'resources',
            key: 'wood',
            amount: -15,
          },
        ],
      },
    ],
  },
  {
    id: 'creature',
    title: '異界生物的集體遷徙',
    icon: '🦌',
    description:
      '大量異界生物開始遷徙，周圍生態出現變化。',
    choices: [
      {
        title: '建立保護區',
        description: '改善環境，但消耗食物資源。',
        changes: [
          {
            target: 'environment',
            key: 'stability',
            amount: 4,
          },
          {
            target: 'resources',
            key: 'food',
            amount: -25,
          },
        ],
      },
      {
        title: '維持自然觀察',
        description: '不干預遷徙，獲得少量環境改善。',
        changes: [
          {
            target: 'environment',
            key: 'soilFertility',
            amount: 2,
          },
        ],
      },
    ],
  },
]

function loadRecords(): ExplorationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is ExplorationRecord =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.branchId === 'string' &&
        typeof item.day === 'number' &&
        typeof item.eventTitle === 'string' &&
        typeof item.choiceTitle === 'string' &&
        typeof item.outcome === 'string' &&
        typeof item.createdAt === 'string'
    ).slice(-200)
  } catch {
    return []
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

const LABELS: Record<string, string> = {
  soilFertility: '土壤肥沃度',
  stability: '環境穩定度',
  water: '水資源',
  food: '食物',
  wood: '木材',
  minerals: '礦物',
  energy: '能源',
}

export default function AnomalyExplorer() {
  const {
    world,
    setWorld,
    activeBranchId,
    branches,
  } = useWorld()

  const [event, setEvent] =
    useState<ExplorationEvent | null>(null)

  const [eventBranchId, setEventBranchId] =
    useState('')

  const [records, setRecords] =
    useState<ExplorationRecord[]>(loadRecords)

  const [feedback, setFeedback] = useState('')

  const activeBranch = branches.find(
    item => item.id === activeBranchId
  )

  const ownRecords = records.filter(
    item => item.branchId === activeBranchId
  )

  const currentEvent =
    eventBranchId === activeBranchId ? event : null

  function explore() {
    const randomIndex = Math.floor(
      Math.random() * EVENTS.length
    )

    setEvent(EVENTS[randomIndex])
    setEventBranchId(activeBranchId)
    setFeedback('')
  }

  function choose(choice: Choice) {
    if (!currentEvent) return

    const snapshot = world

    // 資源不足時不可執行需要消耗資源的選擇。
    const sufficient = choice.changes.every(change => {
      if (change.amount >= 0) return true

      const current =
        change.target === 'resources'
          ? snapshot.resources[
              change.key as keyof typeof snapshot.resources
            ]
          : snapshot.environment[
              change.key as keyof typeof snapshot.environment
            ]

      return current + change.amount >= 0
    })

    if (!sufficient) {
      setFeedback('目前資源不足，請選擇另一個方案。')
      return
    }

    setWorld(previous => {
      const environment = { ...previous.environment }
      const resources = { ...previous.resources }

      for (const change of choice.changes) {
        if (change.target === 'environment') {
          const key = change.key as keyof typeof environment
          const value = environment[key] + change.amount

          environment[key] =
            key === 'temperature'
              ? clamp(value, -50, 100)
              : clamp(value, 0, 100)
        } else {
          const key = change.key as keyof typeof resources
          resources[key] = Math.max(
            0,
            resources[key] + change.amount
          )
        }
      }

      return {
        ...previous,
        environment,
        resources,
      }
    })

    const outcome = choice.changes.map(change => {
      const sign = change.amount > 0 ? '+' : ''
      return `${LABELS[change.key] ?? change.key} ` +
        `${sign}${change.amount}`
    }).join('、')

    const record: ExplorationRecord = {
      id: crypto.randomUUID(),
      branchId: activeBranchId,
      day: world.info.time,
      eventTitle: currentEvent.title,
      choiceTitle: choice.title,
      outcome,
      createdAt: new Date().toISOString(),
    }

    const next = [...records, record].slice(-200)

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      )
      setRecords(next)
      setFeedback(
        `已完成「${choice.title}」。${outcome}`
      )
    } catch {
      setFeedback(
        `世界已更新，但探索紀錄儲存失敗。${outcome}`
      )
    }

    setEvent(null)
  }

  return (
    <section className="anomaly-explorer">
      <header className="anomaly-heading">
        <div>
          <h2>探索與異常事件</h2>
          <p>
            每次探索都可能改變世界的未來。
          </p>
        </div>
        <div className="anomaly-world">
          <strong>
            {activeBranch?.name ?? world.info.name}
          </strong>
          <small>第 {world.info.time} 天</small>
        </div>
      </header>

      <div className="anomaly-overview">
        <span>🌍 世界探索</span>
        <span>📜 已完成 {ownRecords.length} 次</span>
        <span>✨ 異常事件 {EVENTS.length} 種</span>
      </div>

      {!currentEvent ? (
        <div className="anomaly-start">
          <div className="anomaly-symbol">🧭</div>
          <h3>準備探索未知的異界</h3>
          <p>
            探索可能發現特殊生態、古代遺跡，
            或不尋常的自然現象。
          </p>
          <button type="button" onClick={explore}>
            開始探索
          </button>
        </div>
      ) : (
        <div className="anomaly-event">
          <div className="anomaly-symbol">
            {currentEvent.icon}
          </div>
          <h3>{currentEvent.title}</h3>
          <p>{currentEvent.description}</p>

          <h4>你想如何處理這次事件？</h4>

          <div className="anomaly-choices">
            {currentEvent.choices.map(choice => (
              <button
                type="button"
                key={choice.title}
                onClick={() => choose(choice)}
              >
                <strong>{choice.title}</strong>
                <small>{choice.description}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {feedback && (
        <div className="anomaly-feedback" role="status">
          {feedback}
        </div>
      )}

      <div className="anomaly-history">
        <h3>探索紀錄</h3>

        {ownRecords.length === 0 ? (
          <p>尚無探索紀錄。</p>
        ) : (
          [...ownRecords].reverse().slice(0, 10)
            .map(record => (
              <article key={record.id}>
                <strong>
                  第 {record.day} 天｜
                  {record.eventTitle}
                </strong>
                <p>
                  選擇：{record.choiceTitle}
                </p>
                <small>
                  世界變化：{record.outcome}
                </small>
              </article>
            ))
        )}
      </div>
    </section>
  )
}
