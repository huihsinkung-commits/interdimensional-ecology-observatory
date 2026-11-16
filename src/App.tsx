import { useState } from 'react'
import { WorldProvider, useWorld } from './context/WorldContext'

import LumiaIsland from './components/LumiaIsland'
import WorldControls from './components/WorldControls'
import WorldDecisionPanel from './components/WorldDecisionPanel'
import WorldInterventionEffect from './components/WorldInterventionEffect'
import ParallelWorldManager from './components/ParallelWorldManager'
import CreatureEncyclopedia from './components/CreatureEncyclopedia'
import CivilizationObservatory from './components/CivilizationObservatory'
import AnomalyExplorer from './components/AnomalyExplorer'
import ResearchArchive from './components/ResearchArchive'
import WorldEventPanel from './components/WorldEventPanel'
import MicroWorldExplorer from './components/MicroWorldExplorer'

import './App.css'

type Area =
  | 'control'
  | 'world'
  | 'creatures'
  | 'civilization'
  | 'exploration'
  | 'research'

const systems: {
  id: Area
  symbol: string
  title: string
  description: string
}[] = [
  {
    id: 'control',
    symbol: '◈',
    title: '觀測總控中心',
    description: '查看世界狀態、資源與研究資訊',
  },
  {
    id: 'world',
    symbol: '◎',
    title: '微型世界',
    description: '探索島嶼、控制時間並干預環境',
  },
  {
    id: 'creatures',
    symbol: '✦',
    title: '異界生物圖鑑',
    description: '觀察物種、族群與生態變化',
  },
  {
    id: 'civilization',
    symbol: '⌘',
    title: '文明觀測所',
    description: '研究聚落、文化與科技發展',
  },
  {
    id: 'exploration',
    symbol: '◇',
    title: '探索與異常事件',
    description: '探索未知現象與世界事件',
  },
  {
    id: 'research',
    symbol: '▤',
    title: '研究與歷史檔案',
    description: '保存研究成果並追溯世界歷史',
  },
]

function ObservatoryGame() {
  const { world, branches, activeBranchId } = useWorld()
  const [area, setArea] = useState<Area>('control')

  const activeBranch = branches.find(
    branch => branch.id === activeBranchId
  )

  const population = world.species.reduce(
    (total, species) => total + species.population,
    0
  )

  const civilizationPopulation = world.civilizations.reduce(
    (total, civilization) =>
      total + civilization.population,
    0
  )

  function navigate(next: Area) {
    setArea(next)

    window.requestAnimationFrame(() => {
      document.getElementById('research-content')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    })
  }

  const selected = systems.find(
    system => system.id === area
  )!

  return (
    <div className="observatory-app">

      <header className="site-header">
        <div className="brand">
          <div className="brand-symbol" aria-hidden="true">
            ◈
          </div>
          <div>
            <p className="brand-en">
              INTERDIMENSIONAL ECOLOGY OBSERVATORY
            </p>
            <strong className="brand-name">
              異界生態觀測局
            </strong>
          </div>
        </div>

        <div className="researcher-tag">
          <span className="online-dot" aria-hidden="true" />
          <span>見習異界研究員</span>
        </div>
      </header>

      <main className="main-content">

        <section className="demo-hero">
          <p className="eyebrow">
            INTERDIMENSIONAL RESEARCH TERMINAL
          </p>

          <h1>異界生態觀測局</h1>

          <p>
            玩家掌握條件，世界決定反應。
            觀察生命、文明與環境，
            透過每一次決策見證不同的未來。
          </p>

          <div className="demo-status-line">
            <span>
              🌐 {activeBranch?.name ?? world.info.name}
            </span>
            <span>📅 第 {world.info.time} 天</span>
            <span>
              {world.info.status === 'running'
                ? '▶ 世界運行中'
                : '⏸ 世界已暫停'}
            </span>
          </div>
        </section>

        <section className="systems-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">
                RESEARCH DIVISIONS
              </p>
              <h2>六大研究系統</h2>
            </div>
            <span className="section-caption">
              SELECT A RESEARCH DIVISION
            </span>
          </div>

          <div className="systems-grid">
            {systems.map(system => (
              <button
                key={system.id}
                type="button"
                className={
                  'system-card demo-system-button' +
                  (area === system.id
                    ? ' demo-system-selected'
                    : '')
                }
                onClick={() => navigate(system.id)}
                aria-pressed={area === system.id}
              >
                <div className="system-top">
                  <span className="system-symbol">
                    {system.symbol}
                  </span>

                  <span className="module-status">
                    {area === system.id
                      ? '目前所在'
                      : '進入系統'}
                  </span>
                </div>

                <h3>{system.title}</h3>
                <p>{system.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section
          id="research-content"
          className="demo-research-content"
        >
          <div className="demo-section-heading">
            <span className="demo-section-icon">
              {selected.symbol}
            </span>

            <div>
              <p className="section-kicker">
                ACTIVE RESEARCH DIVISION
              </p>
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
            </div>
          </div>

          {area === 'control' && (
            <div className="demo-division">
              <div className="demo-dashboard">
                <article>
                  <span>目前世界</span>
                  <strong>
                    {activeBranch?.name ?? world.info.name}
                  </strong>
                </article>

                <article>
                  <span>世界時間</span>
                  <strong>第 {world.info.time} 天</strong>
                </article>

                <article>
                  <span>世界分支</span>
                  <strong>{branches.length}</strong>
                </article>

                <article>
                  <span>生物總數</span>
                  <strong>{population}</strong>
                </article>

                <article>
                  <span>文明人口</span>
                  <strong>{civilizationPopulation}</strong>
                </article>

                <article>
                  <span>環境穩定度</span>
                  <strong>
                    {world.environment.stability.toFixed(1)}
                  </strong>
                </article>
              </div>

              <div className="demo-resource-panel">
                <h3>世界資源</h3>

                <div className="demo-resource-grid">
                  <span>🍎 食物：{world.resources.food}</span>
                  <span>🪵 木材：{world.resources.wood}</span>
                  <span>⛏️ 礦物：{world.resources.minerals}</span>
                  <span>⚡ 能量：{world.resources.energy}</span>
                  <span>💧 水資源：{world.environment.water}</span>
                  <span>
                    🌱 土壤肥沃度：
                    {world.environment.soilFertility}
                  </span>
                </div>
              </div>

              <div className="demo-quick-actions">
                <button
                  type="button"
                  onClick={() => navigate('world')}
                >
                  🌍 前往微型世界
                </button>

                <button
                  type="button"
                  onClick={() => navigate('civilization')}
                >
                  🏛️ 觀測文明
                </button>

                <button
                  type="button"
                  onClick={() => navigate('research')}
                >
                  📜 查看歷史
                </button>
              </div>
            </div>
          )}

          {area === 'world' && (
            <div className="demo-division">
              <div className="lumia-effect-container">
                <LumiaIsland />
                <WorldInterventionEffect />
              </div>
              <WorldControls />
              <WorldDecisionPanel />
              <MicroWorldExplorer />
              <ParallelWorldManager />
            </div>
          )}

          {area === 'creatures' && (
            <div className="demo-division">
              <CreatureEncyclopedia />
            </div>
          )}

          {area === 'civilization' && (
            <div className="demo-division">
              <CivilizationObservatory />
            </div>
          )}

          {area === 'exploration' && (
            <div className="demo-division">
              <AnomalyExplorer />
            </div>
          )}

          {area === 'research' && (
            <div className="demo-division">
              <ResearchArchive />
              <WorldEventPanel />
            </div>
          )}
        </section>

      </main>

      <footer className="site-footer">
        <span>
          INTERDIMENSIONAL ECOLOGY OBSERVATORY
        </span>
        <span>互動展示版本 · 六大研究系統</span>
      </footer>

    </div>
  )
}

export default function App() {
  return (
    <WorldProvider>
      <ObservatoryGame />
    </WorldProvider>
  )
}
