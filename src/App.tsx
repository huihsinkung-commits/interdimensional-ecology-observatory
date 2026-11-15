import GameNavigation from './components/GameNavigation'
import WorldEventPanel from './components/WorldEventPanel'
import { WorldProvider } from './context/WorldContext'
import LumiaIsland from './components/LumiaIsland'
import WorldControls from './components/WorldControls'
import './App.css'

// 定義六大系統的資料結構
// TypeScript 可以協助檢查每個系統是否具有必要資訊
type SystemModule = {
  id: string
  symbol: string
  title: string
  description: string
  status: string
}

// 六大系統導覽資料
// 目前只用於首頁展示，尚未建立完整功能頁面
const systems: SystemModule[] = [
  {
    id: 'control',
    symbol: '◈',
    title: '觀測總控中心',
    description: '掌握研究員資訊與世界整體狀態',
    status: '目前所在',
  },
  {
    id: 'world',
    symbol: '◎',
    title: '微型世界',
    description: '探索世界環境、時間與生態變化',
    status: '規劃中',
  },
  {
    id: 'creatures',
    symbol: '✦',
    title: '異界生物圖鑑',
    description: '記錄物種特徵、棲地與演化歷程',
    status: '規劃中',
  },
  {
    id: 'civilization',
    symbol: '⌘',
    title: '文明觀測所',
    description: '觀察聚落、文化與文明的發展',
    status: '規劃中',
  },
  {
    id: 'exploration',
    symbol: '◇',
    title: '探索與異常事件',
    description: '發現未知現象與特殊研究事件',
    status: '規劃中',
  },
  {
    id: 'research',
    symbol: '▤',
    title: '研究與歷史檔案',
    description: '整理觀測日誌、實驗與歷史紀錄',
    status: '規劃中',
  },
]

// 首頁示範統計資料
// 這些數值並非實際模擬結果
const statistics = [
  { label: '觀測世界', value: '01' },
  { label: '示範物種', value: '05' },
  { label: '研究紀錄', value: '00' },
]

// React 主要首頁元件
function App() {
  return (
    <WorldProvider>
      <div className="observatory-app">

      {/* 網站頂部：品牌與研究員資訊 */}
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

      {/* 主要內容區域 */}
      <main className="main-content">
      <GameNavigation />
        <LumiaIsland />

        {/* 歡迎區：呈現世界觀與核心理念 */}
        <section className="welcome-section">
          <p className="eyebrow">
            OBSERVATION TERMINAL / 001
          </p>

          <h1>歡迎來到異界觀測局</h1>

          <p className="welcome-description">
            在未知世界之間展開研究，觀察生命、環境與文明如何彼此影響
          </p>

          <p className="motto">
            玩家掌握條件，世界決定反應
          </p>
        </section>

        {/* 統計資訊：目前使用示範數據 */}
        <section
          className="statistics-grid"
          aria-label="觀測統計"
        >
          {statistics.map((item) => (
            <article
              className="stat-card"
              key={item.label}
            >
              <span className="stat-label">
                {item.label}
              </span>

              <strong className="stat-value">
                {item.value}
              </strong>
            </article>
          ))}
        </section>

        {/* 世界資訊與研究員檔案 */}
        <section className="overview-grid">

          <article className="panel world-panel">
            <div className="panel-heading">
              <span className="section-kicker">
                WORLD OBSERVATION
              </span>
              <span className="status-pill">
                示範世界
              </span>
            </div>

            <div className="world-orb" aria-hidden="true">
              <div className="orb-inner" />
            </div>

            <h2>露米亞 · Lumia</h2>

            <p>
              一個等待研究員展開觀測的微型世界
              未來將加入環境、物種與文明的動態模擬
            </p>

            <div className="world-meta">
              <span>世界狀態</span>
              <strong>尚未啟動模擬</strong>
            </div>
          </article>

          <article className="panel researcher-panel">
            <span className="section-kicker">
              RESEARCHER PROFILE
            </span>

            <div className="researcher-avatar" aria-hidden="true">
              ✧
            </div>

            <h2>未命名研究員</h2>

            <p>
              身分：見習異界研究員
            </p>

            <p>
              研究專長與個人履歷將在後續階段建立
            </p>

            <div className="researcher-note">
              目前為示範檔案，尚未建立帳號系統
            </div>
          </article>
        </section>

        {/* 六大系統入口：此階段只展示，不假裝已可操作 */}
        <section className="systems-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">
                RESEARCH DIVISIONS
              </p>
              <h2>六大研究系統</h2>
            </div>

            <span className="section-caption">
              OBSERVATORY MODULES
            </span>
          </div>

          <div className="systems-grid">
            {systems.map((system) => (
              <article
                className="system-card"
                key={system.id}
              >
                <div className="system-top">
                  <span
                    className="system-symbol"
                    aria-hidden="true"
                  >
                    {system.symbol}
                  </span>

                  <span className="module-status">
                    {system.status}
                  </span>
                </div>

                <h3>{system.title}</h3>
                <p>{system.description}</p>
              </article>
            ))}
          </div>
        </section>
            
      <WorldControls />
        <WorldEventPanel />
    </main>

      {/* 網站底部 */}
      <footer className="site-footer">
        <span>
          INTERDIMENSIONAL ECOLOGY OBSERVATORY
        </span>

        <span>
          初期開發版本 · 介面展示
        </span>
      </footer>
      </div>
    </WorldProvider>
  )
}

export default App
