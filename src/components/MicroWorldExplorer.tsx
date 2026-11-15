
import { useWorld } from '../context/WorldContext'
import './MicroWorldExplorer.css'

// 【AI 參與】ChatGPT 協助建立微型世界觀測介面

export default function MicroWorldExplorer() {
  const { world, setWorld } = useWorld()

  const environment = world.environment
  const resources = world.resources

  function improveEnvironment() {
    setWorld(previous => ({
      ...previous,
      environment: {
        ...previous.environment,
        stability: Math.min(
          100,
          previous.environment.stability + 5
        ),
      },
      resources: {
        ...previous.resources,
        energy: Math.max(
          0,
          previous.resources.energy - 20
        ),
      },
    }))
  }

  return (
    <section className="micro-world">
      <h2>🌍 微型世界</h2>

      <p>
        觀察露米亞的環境、生態與文明，
        並嘗試改變世界的發展條件。
      </p>

      <div className="micro-grid">
        <article>
          <h3>🌿 世界環境</h3>
          <p>溫度：{environment.temperature}</p>
          <p>降雨：{environment.rainfall}</p>
          <p>水資源：{environment.water}</p>
          <p>土壤肥沃度：{environment.soilFertility}</p>
          <p>環境穩定度：{environment.stability}</p>
        </article>

        <article>
          <h3>💎 世界資源</h3>
          <p>食物：{resources.food}</p>
          <p>木材：{resources.wood}</p>
          <p>礦物：{resources.minerals}</p>
          <p>能源：{resources.energy}</p>
        </article>

        <article>
          <h3>🦌 生物觀測</h3>
          <p>物種數量：{world.species.length}</p>
          <p>
            生物總數：
            {world.species.reduce(
              (sum, item) => sum + item.population,
              0
            )}
          </p>
        </article>

        <article>
          <h3>🏛️ 文明觀測</h3>
          <p>
            文明數量：
            {world.civilizations.length}
          </p>
          <p>
            文明總人口：
            {world.civilizations.reduce(
              (sum, item) => sum + item.population,
              0
            )}
          </p>
        </article>
      </div>

      <div className="micro-action">
        <h3>🌱 環境改善實驗</h3>
        <p>
          消耗 20 點能源，
          嘗試提升 5 點環境穩定度。
        </p>

        <button
          type="button"
          disabled={
            resources.energy < 20 ||
            environment.stability >= 100
          }
          onClick={improveEnvironment}
        >
          執行環境改善
        </button>
      </div>
    </section>
  )
}
