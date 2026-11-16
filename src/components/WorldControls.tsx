// ============================================================
// 《異界生態觀測局》世界時間控制元件
//
// 【AI 參與說明】
// React 狀態管理、時間控制與顯示介面
// 由 ChatGPT 協助設計與產生
// 開發者負責執行及驗證
// ============================================================

import { useEffect, useState } from 'react'
import { createInitialWorld } from '../data/initialWorld'
import { advanceWorld } from '../simulation/worldEngine'
import { useWorld } from '../context/WorldContext'

import './WorldControls.css'

// 第一版每 1000 毫秒推進一個世界時間單位
const TICK_INTERVAL = 1000

export default function WorldControls() {

  // 世界狀態由 React 管理。
  // 【AI 協助修正】
  // 與露米亞島嶼共用同一份世界資料
  const { world, setWorld, activeBranchId } = useWorld()

  // 是否持續自動演化。
  const isRunning = world.info.status === 'running'

  // 【AI 協助設計】
  // 滑桿使用暫存數值
  // 玩家點擊套用後，才會更新世界資料
  const [draftRainfall, setDraftRainfall] = useState(
    world.environment.rainfall
  )

  const [draftTemperature, setDraftTemperature] = useState(
    world.environment.temperature
  )


  // 當切換世界或回復歷史狀態時，同步環境控制滑桿
  useEffect(() => {
    setDraftRainfall(world.environment.rainfall)
    setDraftTemperature(world.environment.temperature)
  }, [
    activeBranchId,
    world.environment.rainfall,
    world.environment.temperature,
  ])

  // ----------------------------------------------------------
  // 自動演化
  // ----------------------------------------------------------

  useEffect(() => {

    // 暫停時不建立計時器
    if (!isRunning) {
      return
    }

    // 每秒推進一次世界
    const timer = window.setInterval(() => {
      setWorld(previous => advanceWorld(previous))
    }, TICK_INTERVAL)

    // 清理計時器，避免重複執行
    return () => window.clearInterval(timer)

  }, [isRunning])

  // ----------------------------------------------------------
  // 操作函式
  // ----------------------------------------------------------

  function startWorld() {
    setWorld(previous => ({
      ...previous,
      info: { ...previous.info, status: 'running' },
    }))
  }

  function pauseWorld() {
    setWorld(previous => ({
      ...previous,
      info: { ...previous.info, status: 'paused' },
    }))
  }

  function advanceOneDay() {
    if (isRunning) return

    setWorld(previous => advanceWorld(previous))
  }


  // ----------------------------------------------------------
  // 玩家環境干預
  // ----------------------------------------------------------

  // 【AI 協助設計】
  // 僅修改環境條件，不直接改變物種或文明
  function applyEnvironment() {
    if (isRunning) return

    setWorld(previous => ({
      ...previous,
      environment: {
        ...previous.environment,
        rainfall: draftRainfall,
        temperature: draftTemperature,
      },
    }))
  }

  function resetWorld() {

    const initial = createInitialWorld()

    setWorld(initial)
    setDraftRainfall(initial.environment.rainfall)
    setDraftTemperature(initial.environment.temperature)
  }

  // ----------------------------------------------------------
  // 網站介面
  // ----------------------------------------------------------

  return (
    <section className="world-controls">

      <div className="world-controls-heading">
        <div>
          <p className="world-controls-kicker">
            WORLD SIMULATION
          </p>
          <h2>露米亞｜世界演化控制</h2>
          <p className="world-controls-description">
            玩家掌握條件，世界決定反應
          </p>
        </div>

        <span className={
          isRunning
            ? 'world-running-badge active'
            : 'world-running-badge'
        }>
          {isRunning ? '● 演化中' : '● 已暫停'}
        </span>
      </div>

      <div className="world-time-display">
        <span>世界時間</span>
        <strong>第 {world.info.time} 天</strong>
      </div>

      <div className="world-control-buttons">

        <button
          type="button"
          onClick={startWorld}
          disabled={isRunning}
        >
          ▶ 開始演化
        </button>

        <button
          type="button"
          onClick={pauseWorld}
          disabled={!isRunning}
        >
          ⏸ 暫停演化
        </button>

        <button
          type="button"
          onClick={advanceOneDay}
          disabled={isRunning}
        >
          → 推進一天
        </button>

        <button
          type="button"
          className="reset-button"
          onClick={resetWorld}
        >
          ↺ 重置世界
        </button>

      </div>


      {/* =====================================================
          玩家環境干預控制台

          【AI 參與說明】
          ChatGPT 協助設計介面與互動流程
         ===================================================== */}

      <div className="environment-intervention">

        <div className="environment-intervention-heading">
          <div>
            <p className="world-controls-kicker">
              ENVIRONMENT INTERVENTION
            </p>
            <h3>環境干預控制台</h3>
            <p>
              調整世界條件，觀察生態與文明如何回應
            </p>
          </div>
        </div>

        <div className="environment-slider-grid">

          <label className="environment-slider-item">
            <span>
              降雨量
              <strong>{draftRainfall} / 100</strong>
            </span>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={draftRainfall}
              disabled={isRunning}
              onChange={event =>
                setDraftRainfall(Number(event.target.value))
              }
            />
          </label>

          <label className="environment-slider-item">
            <span>
              環境溫度
              <strong>{draftTemperature} °C</strong>
            </span>

            <input
              type="range"
              min="-10"
              max="50"
              step="1"
              value={draftTemperature}
              disabled={isRunning}
              onChange={event =>
                setDraftTemperature(Number(event.target.value))
              }
            />
          </label>

        </div>

        <div className="environment-intervention-footer">

          <button
            type="button"
            onClick={applyEnvironment}
            disabled={isRunning}
          >
            套用環境條件
          </button>

          <p>
            目前世界：降雨量 {world.environment.rainfall}，
            溫度 {world.environment.temperature}°C。
            套用後推進時間，即可觀察演化結果
          </p>

        </div>

      </div>

      <div className="world-data-grid">

        <div className="world-data-card">
          <span>水資源</span>
          <strong>{world.environment.water.toFixed(1)}</strong>
          <small>環境指標 / 100</small>
        </div>

        <div className="world-data-card">
          <span>土壤肥沃度</span>
          <strong>
            {world.environment.soilFertility.toFixed(1)}
          </strong>
          <small>環境指標 / 100</small>
        </div>

        <div className="world-data-card">
          <span>食物資源</span>
          <strong>{world.resources.food.toFixed(1)}</strong>
          <small>抽象資源單位</small>
        </div>

        <div className="world-data-card">
          <span>文明人口</span>
          <strong>
            {world.civilizations[0]?.population ?? 0}
          </strong>
          <small>
            {world.civilizations[0]?.name ?? '尚無文明'}
          </small>
        </div>

      </div>

      <div className="world-population-section">
        <h3>異界生物族群觀測</h3>

        <div className="world-population-grid">
          {world.species.map(species => (
            <div
              className="world-population-card"
              key={species.id}
            >
              <span>{species.name}</span>
              <strong>{species.population}</strong>
              <small>
                {species.status === 'growing'
                  ? '↗ 成長中'
                  : species.status === 'declining'
                    ? '↘ 衰退中'
                    : species.status === 'extinct'
                      ? '已滅絕'
                      : '— 穩定'}
              </small>
            </div>
          ))}
        </div>
      </div>

      <p className="world-simulation-note">
        本系統使用虛構的簡化生態模擬規則，
        數值僅供遊戲觀測與互動學習使用。
      </p>

    </section>
  )
}
