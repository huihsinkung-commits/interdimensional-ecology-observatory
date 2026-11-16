import { useState } from 'react'
import { useWorld } from '../context/WorldContext'
import {
  createResearchReport,
} from '../fusion/worldFusion'
import './FusionResearchManager.css'

export default function FusionResearchManager() {
  const {
    branches, activeBranchId,
    createFusionBranch,
  } = useWorld()

  const [idA, setIdA] = useState('main')
  const [idB, setIdB] = useState('')
  const [weight, setWeight] = useState(0.5)
  const [name, setName] = useState('')
  const [report, setReport] = useState('')

  const active = branches.find(b => b.id === activeBranchId) ?? branches[0]
  const otherBranches = branches.filter(b => b.id !== idA)

  function handleFuse() {
    const branchA = branches.find(b => b.id === idA)
    const branchB = branches.find(b => b.id === idB)
    if (!branchA || !branchB) return
    createFusionBranch(idA, idB, weight, name)
    setName('')
  }

  function generateReport() {
    const rep = createResearchReport(active, branches)
    setReport(rep)
  }

  return (
    <section className="fusion-manager">
      <h2>世界融合研究實驗室</h2>
      <div className="fusion-panel">
        <h3>融合控制台</h3>
        <label>
          來源世界 A
          <select value={idA} onChange={e => setIdA(e.target.value)}>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </label>
        <label>
          來源世界 B
          <select value={idB} onChange={e => setIdB(e.target.value)}>
            <option value="">請選擇世界 B</option>
            {otherBranches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </label>
        <label>
          融合比例 (世界 A): {Math.round(weight * 100)}%
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weight}
            onChange={e => setWeight(parseFloat(e.target.value))}
          />
        </label>
        <input
          placeholder="自訂融合世界名稱 (選填)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button onClick={handleFuse} disabled={!idA || !idB}>
          進行世界加權融合
        </button>
      </div>
      <div className="fusion-panel">
        <h3>研究報告匯出</h3>
        <button onClick={generateReport}>產生目前觀測世界研究報告</button>
        {report && (
          <textarea
            readOnly
            value={report}
            rows={15}
            style={{ width: '100%', marginTop: '10px', background: '#1c1c1c', color: '#fff' }}
          />
        )}
      </div>
    </section>
  )
}
