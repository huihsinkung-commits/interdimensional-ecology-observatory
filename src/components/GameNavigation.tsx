
import { useEffect, useState } from 'react'
import { useWorld } from '../context/WorldContext'
import './GameNavigation.css'

// 【AI 參與】遊戲首頁與五大區域導覽

type Area =
  | 'home'
  | 'micro'
  | 'creatures'
  | 'civilization'
  | 'exploration'
  | 'research'

const AREAS: {
  id: Area
  icon: string
  title: string
  description: string
}[] = [
  {
    id: 'micro',
    icon: '🌍',
    title: '微型世界',
    description: '探索浮島、觀察環境並調整世界條件。',
  },
  {
    id: 'creatures',
    icon: '🦌',
    title: '異界生物圖鑑',
    description: '認識異界物種與族群變化。',
  },
  {
    id: 'civilization',
    icon: '🏛️',
    title: '文明觀測所',
    description: '觀察文明發展與政策實驗。',
  },
  {
    id: 'exploration',
    icon: '🧭',
    title: '探索與異常事件',
    description: '發現異常、做出選擇並影響世界。',
  },
  {
    id: 'research',
    icon: '📜',
    title: '研究與歷史檔案',
    description: '回顧研究成果與世界演化歷程。',
  },
]

export default function GameNavigation() {
  const { world, branches, activeBranchId } = useWorld()

  const [area, setArea] = useState<Area>('home')

  const activeBranch = branches.find(
    item => item.id === activeBranchId
  )

  // 使用頁面狀態控制五大區域的顯示。
  // 不卸載原有元件，避免影響其既有狀態。
  useEffect(() => {
    document.body.dataset.gameArea = area

    return () => {
      delete document.body.dataset.gameArea
    }
  }, [area])

  function goTo(next: Area) {
    setArea(next)

    window.requestAnimationFrame(() => {
      document.getElementById(
        'game-navigation'
      )?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <section
      id="game-navigation"
      className="game-navigation"
    >
      <header className="game-hero">
        <div className="game-hero-mark">✦</div>

        <p className="game-hero-eyebrow">
          INTERDIMENSIONAL ECOLOGY OBSERVATORY
        </p>

        <h1>異界生態觀測局</h1>

        <p className="game-hero-motto">
          玩家掌握條件，世界決定反應。
        </p>

        <p className="game-hero-description">
          觀察未知世界的生態與文明，
          探索異常現象，並透過每一次選擇，
          見證世界產生不同的變化。
        </p>

        <div className="game-world-status">
          <span>
            🌐 {activeBranch?.name ?? world.info.name}
          </span>
          <span>📅 第 {world.info.time} 天</span>
          <span>
            {world.info.status === 'running'
              ? '▶ 世界運行中'
              : '⏸ 世界暫停中'}
          </span>
        </div>
      </header>

      <nav
        className="game-area-nav"
        aria-label="主要遊戲區域"
      >
        <button
          type="button"
          className={
            area === 'home' ? 'selected' : ''
          }
          onClick={() => goTo('home')}
        >
          🏠 首頁
        </button>

        {AREAS.map(item => (
          <button
            type="button"
            key={item.id}
            className={
              area === item.id ? 'selected' : ''
            }
            onClick={() => goTo(item.id)}
          >
            {item.icon} {item.title}
          </button>
        ))}
      </nav>

      {area === 'home' ? (
        <div className="game-home">
          <div className="game-home-intro">
            <h2>歡迎來到異界觀測站</h2>
            <p>
              這裡的生物、文明與環境會隨時間演化。
              你可以探索、觀測、干預，
              也可以建立平行世界比較不同結果。
            </p>

            <button
              type="button"
              className="game-start-button"
              onClick={() => goTo('micro')}
            >
              開始探索世界
            </button>
          </div>

          <h3>選擇你的研究方向</h3>

          <div className="game-home-grid">
            {AREAS.map(item => (
              <button
                type="button"
                key={item.id}
                className="game-home-card"
                onClick={() => goTo(item.id)}
              >
                <span className="game-card-icon">
                  {item.icon}
                </span>

                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="game-area-intro">
          <span>
            {AREAS.find(item =>
              item.id === area
            )?.icon}
          </span>

          <div>
            <h2>
              {AREAS.find(item =>
                item.id === area
              )?.title}
            </h2>
            <p>
              {AREAS.find(item =>
                item.id === area
              )?.description}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
