
import { useState } from 'react'
import { useWorld } from '../context/WorldContext'
import './HistoryManager.css'

// 【AI 參與】ChatGPT 協助建立歷史節點操作介面

export default function HistoryManager() {
  const {
    historyNodes,
    branches,
    activeBranchId,
    createHistoryNode,
    restoreHistoryNode,
    deleteHistoryNode,
    toggleNodeProtection,
    restoreTrashNode,
    permanentlyDeleteTrashNode,
  } = useWorld()

  const [name, setName] = useState('')
  const [showTrash, setShowTrash] = useState(false)

  const activeBranch = branches.find(
    branch => branch.id === activeBranchId
  )

  const trash = activeBranch?.trash ?? []

  function createNode() {
    createHistoryNode(name.trim())
    setName('')
  }

  function restoreNode(id: string, nodeName: string) {
    if (window.confirm(
      `確定回溯至「${nodeName}」？目前世界將先建立安全備份。`
    )) {
      restoreHistoryNode(id)
    }
  }

  function deleteNode(id: string, nodeName: string) {
    if (window.confirm(
      `確定將「${nodeName}」移入回收站？`
    )) {
      deleteHistoryNode(id)
    }
  }

  return (
    <section className="history-manager">
      <h2>歷史節點管理</h2>

      <p>
        建立世界存檔、回溯時間線，
        並保護重要的研究成果。
      </p>

      <div className="history-create">
        <input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="輸入歷史節點名稱"
          aria-label="歷史節點名稱"
        />

        <button type="button" onClick={createNode}>
          建立歷史節點
        </button>
      </div>

      <h3>目前世界的歷史節點</h3>

      {historyNodes.length === 0 ? (
        <p>目前沒有歷史節點。</p>
      ) : (
        <div className="history-node-list">
          {[...historyNodes].reverse().map(node => (
            <article className="history-node" key={node.id}>
              <div>
                <strong>
                  {node.protected ? '🔒 ' : '🔓 '}
                  {node.name}
                </strong>
                <small>
                  第 {node.day} 天 · {node.kind}
                </small>
              </div>

              <div className="history-buttons">
                <button
                  type="button"
                  onClick={() =>
                    restoreNode(node.id, node.name)
                  }
                >
                  回溯
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleNodeProtection(node.id)
                  }
                >
                  {node.protected ? '解除保護' : '保護'}
                </button>

                <button
                  type="button"
                  disabled={node.protected}
                  onClick={() =>
                    deleteNode(node.id, node.name)
                  }
                >
                  刪除
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="history-trash">
        <button
          type="button"
          onClick={() => setShowTrash(!showTrash)}
        >
          {showTrash ? '收起回收站' : '查看回收站'}
          （{trash.length}）
        </button>

        {showTrash && (
          <div className="history-node-list">
            {trash.length === 0 ? (
              <p>回收站目前沒有歷史節點。</p>
            ) : (
              trash.map(node => (
                <article className="history-node" key={node.id}>
                  <div>
                    <strong>{node.name}</strong>
                    <small>第 {node.day} 天</small>
                  </div>

                  <div className="history-buttons">
                    <button
                      type="button"
                      onClick={() =>
                        restoreTrashNode(node.id)
                      }
                    >
                      還原
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(
                          `永久刪除「${node.name}」？此操作無法復原。`
                        )) {
                          permanentlyDeleteTrashNode(node.id)
                        }
                      }}
                    >
                      永久刪除
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  )
}
