
import { useState } from 'react'
import { useWorld } from '../context/WorldContext'
import type { WorldBranch } from '../storage/worldSave'
import './ParallelWorldManager.css'

function population(branch: WorldBranch) {
  return branch.world.species.reduce(
    (sum, species) => sum + species.population, 0
  )
}

function civilizationPopulation(branch: WorldBranch) {
  return branch.world.civilizations.reduce(
    (sum, civ) => sum + civ.population, 0
  )
}

export default function ParallelWorldManager() {
  const {
    branches, activeBranchId,
    createBranch, switchBranch,
    renameBranch, setBranchSpeed, advanceBranch,
  } = useWorld()

  const [name, setName] = useState('')
  const [leftId, setLeftId] = useState('main')
  const [rightId, setRightId] = useState('')

  const left = branches.find(branch => branch.id === leftId) ?? branches[0]
  const right = branches.find(branch => branch.id === rightId)
    ?? branches.find(branch => branch.id !== left.id)
    ?? branches[0]

  function rename(branch: WorldBranch) {
    const next = window.prompt('新的世界名稱', branch.name)
    if (next?.trim()) renameBranch(branch.id, next)
  }

  const metrics = left && right ? [
    ['世界日期', left.world.info.time, right.world.info.time],
    ['水資源', left.world.environment.water, right.world.environment.water],
    ['土壤肥沃度', left.world.environment.soilFertility, right.world.environment.soilFertility],
    ['食物', left.world.resources.food, right.world.resources.food],
    ['木材', left.world.resources.wood, right.world.resources.wood],
    ['生物總數', population(left), population(right)],
    ['文明總人口', civilizationPopulation(left), civilizationPopulation(right)],
    ['事件數量', left.history.length, right.history.length],
    ['歷史節點', left.historyNodes.length, right.historyNodes.length],
  ] as const : []

  return (
    <section className="parallel-manager">
      <header className="parallel-heading">
        <div>
          <h2>平行世界研究中心</h2>
          <p>從相同起點出發，探索不同的演化可能。</p>
        </div>
        <span>{branches.length} / 8 個世界</span>
      </header>

      <div className="parallel-create">
        <input
          aria-label="平行世界名稱"
          maxLength={60}
          value={name}
          placeholder="輸入新分支名稱"
          onChange={event => setName(event.target.value)}
        />
        <button
          type="button"
          disabled={branches.length >= 8}
          onClick={() => {
            createBranch(name)
            setName('')
          }}
        >
          從目前世界建立分支
        </button>
      </div>

      <div className="parallel-branch-list">
        {branches.map(branch => (
          <article
            key={branch.id}
            className={
              branch.id === activeBranchId
                ? 'parallel-branch active'
                : 'parallel-branch'
            }
          >
            <div className="parallel-branch-details">
              <strong>{branch.name}</strong>
              <small>
                第 {branch.world.info.time} 天 ·
                生物 {Math.round(population(branch))} ·
                文明人口 {Math.round(civilizationPopulation(branch))}
              </small>
              {branch.id === activeBranchId && (
                <span className="parallel-active-label">
                  目前觀測世界
                </span>
              )}
            </div>

            <div className="parallel-branch-actions">
              <button
                type="button"
                disabled={branch.id === activeBranchId}
                onClick={() => switchBranch(branch.id)}
              >
                切換
              </button>
              <button
                type="button"
                onClick={() => rename(branch)}
              >
                命名
              </button>
              <label>
                批次推進倍率
                <select
                  aria-label={`${branch.name} 批次倍率`}
                  value={branch.speed}
                  onChange={event =>
                    setBranchSpeed(
                      branch.id, Number(event.target.value)
                    )
                  }
                >
                  <option value={1}>1 天</option>
                  <option value={5}>5 天</option>
                  <option value={10}>10 天</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => advanceBranch(branch.id)}
              >
                推進 {branch.speed} 天
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="parallel-comparison">
        <h3>雙世界數據比較</h3>
        <div className="parallel-comparison-controls">
          <label>
            觀測世界一
            <select value={left.id}
              onChange={event => setLeftId(event.target.value)}>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            觀測世界二
            <select value={right.id}
              onChange={event => setRightId(event.target.value)}>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select> 
          </label>
        </div>
        <table className="parallel-comparison-table">
          <thead>
            <tr>
              <th>數據指標</th>
              <th>{left.name}</th>
              <th>{right.name}</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(([label, lVal, rVal]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{typeof lVal === 'number' ? lVal.toFixed(1) : lVal}</td>
                <td>{typeof rVal === 'number' ? rVal.toFixed(1) : rVal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
