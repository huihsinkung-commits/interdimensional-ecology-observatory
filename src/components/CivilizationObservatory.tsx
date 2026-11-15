
import { useEffect, useState } from 'react'
import { useWorld } from '../context/WorldContext'
import './CivilizationObservatory.css'

// 【AI 參與】文明觀測、政策實驗與研究紀錄

type ResearchNote = {
  id: string
  branchId: string
  civilizationId: string
  day: number
  text: string
  createdAt: string
}

type PolicyKind = 'agriculture' | 'research' | 'exchange'

const STORAGE_KEY = 'lumia-civilization-notes-v1'

const STAGE_LABELS: Record<string, string> = {
  tribal: '部族',
  village: '村落',
  city: '城市',
  kingdom: '王國',
}

const POLICIES: {
  id: PolicyKind
  name: string
  description: string
}[] = [
  {
    id: 'agriculture',
    name: '農業發展',
    description: '消耗木材與能源，增加食物供應。',
  },
  {
    id: 'research',
    name: '技術研究',
    description: '消耗礦物與能源，提升文明科技。',
  },
  {
    id: 'exchange',
    name: '文化交流',
    description: '消耗食物與能源，留下文化交流紀錄。',
  },
]

function loadNotes(): ResearchNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []

    return value.filter(
      (item): item is ResearchNote =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.branchId === 'string' &&
        typeof item.civilizationId === 'string' &&
        typeof item.day === 'number' &&
        typeof item.text === 'string' &&
        typeof item.createdAt === 'string'
    ).slice(-500)
  } catch {
    return []
  }
}

function round(value: number) {
  return Number(value.toFixed(2))
}

export default function CivilizationObservatory() {
  const {
    world,
    setWorld,
    historyNodes,
    activeBranchId,
    branches,
  } = useWorld()

  const [selectedId, setSelectedId] = useState('')
  const [notes, setNotes] =
    useState<ResearchNote[]>(loadNotes)
  const [noteText, setNoteText] = useState('')
  const [feedback, setFeedback] = useState('')

  const civilizations = world.civilizations

  const selected = civilizations.find(
    item => item.id === selectedId
  ) ?? civilizations[0]

  const activeBranch = branches.find(
    item => item.id === activeBranchId
  )

  const archived = activeBranch?.archived === true

  // 切換平行世界時，清除上一個世界的操作提示。
  useEffect(() => {
    setFeedback('')
    setNoteText('')
  }, [activeBranchId])

  const populationTotal = civilizations.reduce(
    (sum, item) => sum + item.population,
    0
  )

  const ownNotes = notes.filter(
    item =>
      item.branchId === activeBranchId &&
      item.civilizationId === selected?.id
  )

  // 5-54：只使用已保存的歷史節點。
  const history = selected
    ? historyNodes
        .map(node => {
          const civ = node.world.civilizations.find(
            item => item.id === selected.id
          )

          return civ
            ? {
                id: node.id,
                day: node.day,
                population: civ.population,
                technology: civ.technology,
                stage: civ.stage,
              }
            : null
        })
        .filter(
          (item): item is {
            id: string
            day: number
            population: number
            technology: number
            stage: typeof selected.stage
          } => item !== null
        )
        .sort((a, b) => a.day - b.day)
    : []

  const dayMap = new Map<number, (typeof history)[number]>()

  for (const item of history) {
    dayMap.set(item.day, item)
  }

  const trend = [...dayMap.values()]
    .sort((a, b) => a.day - b.day)
    .slice(-12)

  const maxPopulation = Math.max(
    1,
    ...trend.map(item => item.population)
  )

  // 5-55：三種政策共用相同的資源檢查邏輯。
  function applyPolicy(kind: PolicyKind) {
    if (!selected || archived) return

    const current = world.resources

    const sufficient =
      kind === 'agriculture'
        ? current.wood >= 15 && current.energy >= 10
        : kind === 'research'
          ? current.minerals >= 15 &&
            current.energy >= 15
          : current.food >= 20 &&
            current.energy >= 10

    if (!sufficient) {
      setFeedback('資源不足，無法執行此項政策。')
      return
    }

    const currentId = selected.id

    setWorld(previous => {
      const resources = { ...previous.resources }

      const civilizationsNext =
        previous.civilizations.map(civ => {
          if (civ.id !== currentId) return civ

          if (kind === 'research') {
            return {
              ...civ,
              technology: round(civ.technology + 3),
            }
          }

          if (kind === 'exchange') {
            const marker = `第${previous.info.time}天文化交流`

            return {
              ...civ,
              culture: civ.culture.includes(marker)
                ? civ.culture
                : `${civ.culture}；${marker}`,
            }
          }

          return civ
        })

      if (kind === 'agriculture') {
        resources.wood -= 15
        resources.energy -= 10
        resources.food += 40
      } else if (kind === 'research') {
        resources.minerals -= 15
        resources.energy -= 15
      } else {
        resources.food -= 20
        resources.energy -= 10
      }

      return {
        ...previous,
        resources,
        civilizations: civilizationsNext,
      }
    })

    const descriptions: Record<PolicyKind, string> = {
      agriculture:
        '農業發展完成：食物 +40、木材 -15、能源 -10。',
      research:
        '技術研究完成：科技 +3、礦物 -15、能源 -15。',
      exchange:
        '文化交流完成：文化紀錄已更新，食物 -20、能源 -10。',
    }

    setFeedback(descriptions[kind])
  }

  // 5-56：儲存文明研究筆記
  function saveNote() {
    if (!selected || !noteText.trim()) return

    const note: ResearchNote = {
      id: crypto.randomUUID(),
      branchId: activeBranchId,
      civilizationId: selected.id,
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
      setFeedback('文明研究筆記已儲存。')
    } catch {
      setFeedback(
        '筆記儲存失敗，請確認瀏覽器儲存空間。'
      )
    }
  }

  return (
    <section className="civil-observatory">
      <header className="civil-header">
        <div>
          <h2>文明觀測所</h2>
          <p>
            觀察文明如何在環境與資源之間發展。
          </p>
        </div>

        <div className="civil-world">
          <strong>
            {activeBranch?.name ?? world.info.name}
          </strong>
          <small>第 {world.info.time} 天</small>
        </div>
      </header>

      <div className="civil-summary">
        <span>文明數量：{civilizations.length}</span>
        <span>
          文明總人口：{Math.round(populationTotal)}
        </span>
        <span>
          世界食物：{round(world.resources.food)}
        </span>
      </div>

      <h3>文明總覽</h3>

      {civilizations.length === 0 ? (
        <p>
          目前世界尚未出現文明。
          請先觀察世界演化。
        </p>
      ) : (
        <>
          <div className="civil-grid">
            {civilizations.map(civ => (
              <button
                type="button"
                key={civ.id}
                className={
                  selected?.id === civ.id
                    ? 'civil-card active'
                    : 'civil-card'
                }
                onClick={() => {
                  setSelectedId(civ.id)
                  setFeedback('')
                }}
              >
                <span className="civil-icon">🏘️</span>
                <strong>{civ.name}</strong>
                <small>
                  {STAGE_LABELS[civ.stage] ?? civ.stage}
                </small>
                <span>
                  人口：{Math.round(civ.population)}
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="civil-detail">
              <h3>🏛️ {selected.name}｜文明檔案</h3>

              <div className="civil-stats">
                <div>
                  <small>發展階段</small>
                  <strong>
                    {STAGE_LABELS[selected.stage] ??
                      selected.stage}
                  </strong>
                </div>
                <div>
                  <small>文明人口</small>
                  <strong>
                    {Math.round(selected.population)}
                  </strong>
                </div>
                <div>
                  <small>科技程度</small>
                  <strong>
                    {round(selected.technology)}
                  </strong>
                </div>
                <div>
                  <small>食物資源</small>
                  <strong>
                    {round(world.resources.food)}
                  </strong>
                </div>
              </div>

              <h4>文化觀測</h4>
              <p className="civil-culture">
                {selected.culture || '尚無文化紀錄'}
              </p>

              <h4>文明生存環境</h4>
              <p>
                溫度：
                {round(world.environment.temperature)}°C；
                水資源：
                {round(world.environment.water)}；
                土壤肥沃度：
                {round(world.environment.soilFertility)}。
              </p>

              <h4>文明發展歷程</h4>

              {trend.length < 2 ? (
                <p>
                  歷史資料不足。
                  請先在不同日期建立歷史節點。
                </p>
              ) : (
                <div className="civil-trend">
                  {trend.map(point => (
                    <div
                      key={point.day}
                      className="civil-trend-row"
                    >
                      <small>第 {point.day} 天</small>

                      <div className="civil-trend-track">
                        <div
                          className="civil-trend-bar"
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

                      <small>
                        科技 {round(point.technology)}
                      </small>
                    </div>
                  ))}
                </div>
              )}

              <h4>文明政策實驗</h4>
              <p>
                玩家可調整發展條件，
                後續結果仍由世界模擬系統演化。
              </p>

              <div className="civil-policy-grid">
                {POLICIES.map(policy => (
                  <div
                    key={policy.id}
                    className="civil-policy"
                  >
                    <strong>{policy.name}</strong>
                    <small>{policy.description}</small>
                    <button
                      type="button"
                      disabled={archived}
                      onClick={() =>
                        applyPolicy(policy.id)
                      }
                    >
                      執行政策
                    </button>
                  </div>
                ))}
              </div>

              {archived && (
                <p>
                  目前世界已封存，
                  請重新啟用後再執行政策。
                </p>
              )}

              {feedback && (
                <div
                  className="civil-feedback"
                  role="status"
                >
                  {feedback}
                </div>
              )}

              <h4>文明研究筆記</h4>

              <textarea
                aria-label="文明研究筆記"
                rows={4}
                maxLength={1000}
                placeholder="記錄文明的發展與研究發現……"
                value={noteText}
                onChange={event =>
                  setNoteText(event.target.value)
                }
              />

              <button
                type="button"
                disabled={!noteText.trim()}
                onClick={saveNote}
              >
                儲存研究筆記
              </button>

              <div className="civil-notes">
                <h4>研究紀錄</h4>

                {ownNotes.length === 0 ? (
                  <p>目前沒有研究筆記。</p>
                ) : (
                  [...ownNotes]
                    .reverse()
                    .slice(0, 10)
                    .map(note => (
                      <article key={note.id}>
                        <small>
                          第 {note.day} 天
                        </small>
                        <p>{note.text}</p>
                      </article>
                    ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
