import HistoryManager from './HistoryManager'
import ParallelWorldManager from './ParallelWorldManager'

import { useState } from 'react'
import { useWorld } from '../context/WorldContext'
import './ResearchArchive.css'

// 【AI 參與】研究與歷史檔案整合介面

type LocalRecord = {
  id: string
  branchId: string
  day: number
  category: string
  title: string
  detail: string
}

type StoredItem = Record<string, unknown>

function readRecords(
  key: string,
  category: string
): LocalRecord[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((value: unknown) => {
      if (
        typeof value !== 'object' ||
        value === null
      ) return []

      const item = value as StoredItem

      if (
        typeof item.id !== 'string' ||
        typeof item.branchId !== 'string' ||
        typeof item.day !== 'number'
      ) return []

      const title =
        typeof item.eventTitle === 'string'
          ? item.eventTitle
          : typeof item.speciesId === 'string'
            ? `生物 ${item.speciesId}`
            : typeof item.civilizationId === 'string'
              ? `文明 ${item.civilizationId}`
              : category

      const detail =
        typeof item.text === 'string'
          ? item.text
          : typeof item.outcome === 'string'
            ? [
                typeof item.choiceTitle === 'string'
                  ? `選擇：${item.choiceTitle}`
                  : '',
                item.outcome,
              ].filter(Boolean).join('；')
            : typeof item.description === 'string'
              ? item.description
              : ''

      return [{
        id: item.id,
        branchId: item.branchId,
        day: item.day,
        category,
        title,
        detail,
      }]
    }).slice(-500)
  } catch {
    return []
  }
}

function getLocalRecords(): LocalRecord[] {
  return [
    ...readRecords(
      'lumia-creature-notes-v1',
      '生物觀測'
    ),
    ...readRecords(
      'lumia-civilization-notes-v1',
      '文明研究'
    ),
    ...readRecords(
      'lumia-exploration-records-v1',
      '異常探索'
    ),
    ...readRecords(
      'lumia-micro-observations-v1',
      '區域觀測'
    ),
  ]
}

function escapeMarkdown(value: unknown) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, ' ')
}

function safeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '_')
}

export default function ResearchArchive() {
  const {
    world,
    history,
    historyNodes,
    branches,
    activeBranchId,
  } = useWorld()

  const [records, setRecords] =
    useState<LocalRecord[]>(getLocalRecords)

  const [message, setMessage] = useState('')

  const activeBranch = branches.find(
    item => item.id === activeBranchId
  )

  const ownRecords = records
    .filter(item => item.branchId === activeBranchId)
    .sort((a, b) => b.day - a.day)

  const timeline = [...historyNodes]
    .sort((a, b) => b.day - a.day)
    .slice(0, 20)

  const otherBranches = branches.filter(
    item => item.id !== activeBranchId
  )

  const totalSpecies = world.species.reduce(
    (sum, item) => sum + item.population,
    0
  )

  const totalCivilization = world.civilizations.reduce(
    (sum, item) => sum + item.population,
    0
  )

  function refreshRecords() {
    setRecords(getLocalRecords())
    setMessage('已重新讀取研究紀錄。')
  }

  function downloadReport() {
    const lines: string[] = [
      '# 異界生態觀測局｜世界研究報告',
      '',
      `世界：${escapeMarkdown(
        activeBranch?.name ?? world.info.name
      )}`,
      `研究日期：${new Date().toLocaleString('zh-TW')}`,
      `世界時間：第 ${world.info.time} 天`,
      '',
      '## 一、世界基本資料',
      '',
      `- 生物物種：${world.species.length}`,
      `- 生物總數：${Math.round(totalSpecies)}`,
      `- 文明數量：${world.civilizations.length}`,
      `- 文明總人口：${Math.round(totalCivilization)}`,
      `- 歷史節點：${historyNodes.length}`,
      `- 世界事件：${history.length}`,
      '',
      '## 二、環境與資源',
      '',
      `- 溫度：${world.environment.temperature}`,
      `- 降雨：${world.environment.rainfall}`,
      `- 水資源：${world.environment.water}`,
      `- 土壤肥沃度：${world.environment.soilFertility}`,
      `- 環境穩定度：${world.environment.stability}`,
      `- 食物：${world.resources.food}`,
      `- 木材：${world.resources.wood}`,
      `- 礦物：${world.resources.minerals}`,
      `- 能源：${world.resources.energy}`,
      '',
      '## 三、生物資料',
      '',
    ]

    if (world.species.length === 0) {
      lines.push('目前沒有生物資料。')
    } else {
      world.species.forEach(item => {
        lines.push(
          `- ${escapeMarkdown(item.name)}：` +
          `族群 ${item.population}，狀態 ${item.status}`
        )
      })
    }

    lines.push('', '## 四、文明資料', '')

    if (world.civilizations.length === 0) {
      lines.push('目前沒有文明資料。')
    } else {
      world.civilizations.forEach(item => {
        lines.push(
          `- ${escapeMarkdown(item.name)}：` +
          `人口 ${item.population}，` +
          `階段 ${item.stage}，` +
          `科技 ${item.technology}，` +
          `文化 ${escapeMarkdown(item.culture)}`
        )
      })
    }

    lines.push('', '## 五、歷史節點', '')

    if (historyNodes.length === 0) {
      lines.push('目前沒有歷史節點。')
    } else {
      [...historyNodes]
        .sort((a, b) => a.day - b.day)
        .forEach(node => {
          lines.push(
            `- 第 ${node.day} 天：` +
            escapeMarkdown(node.name)
          )
        })
    }

    lines.push('', '## 六、研究與探索紀錄', '')

    if (ownRecords.length === 0) {
      lines.push('目前沒有研究紀錄。')
    } else {
      ownRecords.forEach(item => {
        lines.push(
          `- 第 ${item.day} 天｜` +
          `${item.category}｜` +
          `${escapeMarkdown(item.title)}：` +
          escapeMarkdown(item.detail)
        )
      })
    }

    lines.push(
      '',
      '---',
      '',
      '本報告由遊戲目前保存的資料自動整理。',
      '研究紀錄可能受到瀏覽器儲存空間限制。',
      ''
    )

    const blob = new Blob(
      [lines.join('\n')],
      { type: 'text/markdown;charset=utf-8' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = safeFileName(
      `異界研究報告_${activeBranch?.name ?? '世界'}_` +
      `第${world.info.time}天.md`
    )

    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    setMessage('研究報告已開始下載。')
  }

  return (
    <section className="research-archive">
      <header className="research-header">
        <div>
          <h2>研究與歷史檔案</h2>
          <p>
            保存觀測成果，回顧世界的演化歷程。
          </p>
        </div>

        <div className="research-world">
          <strong>
            {activeBranch?.name ?? world.info.name}
          </strong>
          <small>第 {world.info.time} 天</small>
        </div>
      </header>

      <div className="research-summary">
        <div>
          <small>歷史節點</small>
          <strong>{historyNodes.length}</strong>
        </div>
        <div>
          <small>世界事件</small>
          <strong>{history.length}</strong>
        </div>
        <div>
          <small>研究紀錄</small>
          <strong>{ownRecords.length}</strong>
        </div>
        <div>
          <small>平行世界</small>
          <strong>{branches.length}</strong>
        </div>
      </div>

      <div className="research-actions">
        <button
          type="button"
          onClick={refreshRecords}
        >
          重新整理研究紀錄
        </button>

        <button
          type="button"
          onClick={downloadReport}
        >
          下載 Markdown 研究報告
        </button>
      </div>

      {message && (
        <p role="status">{message}</p>
      )}

      <ParallelWorldManager />
      <HistoryManager />

      <div className="research-section">
        <h3>世界歷史時間線</h3>

        {timeline.length === 0 ? (
          <p>尚無歷史節點。</p>
        ) : (
          <div className="research-timeline">
            {timeline.map(node => (
              <article key={node.id}>
                <small>第 {node.day} 天</small>
                <strong>{node.name}</strong>
                <span>
                  {node.kind === 'manual'
                    ? '手動紀錄'
                    : node.kind === 'auto'
                      ? '自動紀錄'
                      : '安全備份'}
                </span>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="research-section">
        <h3>平行世界研究比較</h3>

        <div className="research-comparison">
          <div className="research-comparison-row">
            <strong>目前世界</strong>
            <span>
              {activeBranch?.name ?? world.info.name}
            </span>
            <small>
              第 {world.info.time} 天｜
              生物 {Math.round(totalSpecies)}｜
              文明人口 {Math.round(totalCivilization)}
            </small>
          </div>

          {otherBranches.map(branch => {
            const speciesTotal =
              branch.world.species.reduce(
                (sum, item) => sum + item.population,
                0
              )

            const civTotal =
              branch.world.civilizations.reduce(
                (sum, item) => sum + item.population,
                0
              )

            return (
              <div
                key={branch.id}
                className="research-comparison-row"
              >
                <strong>平行世界</strong>
                <span>{branch.name}</span>
                <small>
                  第 {branch.world.info.time} 天｜
                  生物 {Math.round(speciesTotal)}｜
                  文明人口 {Math.round(civTotal)}
                </small>
              </div>
            )
          })}
        </div>
      </div>

      <div className="research-section">
        <h3>觀測與探索研究紀錄</h3>

        {ownRecords.length === 0 ? (
          <p>
            尚無研究紀錄。
            可以前往生物圖鑑、文明觀測所或探索區域
            建立資料，再按重新整理。
          </p>
        ) : (
          <div className="research-records">
            {ownRecords.slice(0, 20).map(item => (
              <article
                key={`${item.category}-${item.id}`}
              >
                <small>
                  第 {item.day} 天｜
                  {item.category}
                </small>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
