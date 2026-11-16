import { useWorld } from '../context/WorldContext'
import { calculateIslandVisualState } from '../visualization/islandVisualState'
// ============================================================
// 露米亞 2.5D 島嶼場景
//
// 【AI 參與說明】
// ChatGPT 協助設計 SVG 場景、分層構圖與原創生物
// ============================================================

import './LumiaIsland.css'

type TreeProps = {
  x: number
  y: number
  scale?: number
}

function Tree({ x, y, scale = 1 }: TreeProps) {
  return (
    <g className="lumia-tree-grow" transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse
        cx="5" cy="9" rx="24" ry="8"
        fill="#254e43" opacity="0.18"
      />
      <path
        d="M-5 -8 L5 -8 L8 9 L-8 9 Z"
        fill="#947154"
      />
      <ellipse
        cx="0" cy="-30" rx="27" ry="30"
        fill="#3d9270"
      />
      <ellipse
        cx="-12" cy="-36" rx="18" ry="22"
        fill="#72b88c"
      />
      <ellipse
        cx="11" cy="-42" rx="17" ry="21"
        fill="#58a87f"
      />
      <ellipse
        cx="-10" cy="-45" rx="8" ry="6"
        fill="#b1d9a0" opacity="0.55"
      />
    </g>
  )
}

function Cottage({
  x,
  y,
  scale = 1,
}: {
  x: number
  y: number
  scale?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse
        cx="0" cy="15" rx="38" ry="13"
        fill="#35594a" opacity="0.25"
      />
      <path
        d="M-26 -13 L0 -30 L26 -13 L26 17 L-26 17 Z"
        fill="#e9c999"
      />
      <path
        d="M-33 -13 L0 -43 L33 -13 L22 -8 L0 -28 L-22 -8 Z"
        fill="#b56d60"
      />
      <rect
        x="-7" y="-3" width="14" height="20"
        rx="4" fill="#835c4b"
      />
      <rect
        x="13" y="-4" width="8" height="9"
        rx="2" fill="#b5e4d6"
      />
    </g>
  )
}

function Creature({
  x,
  y,
  color,
  scale = 1,
  animation = '',
}: {
  x: number
  y: number
  color: string
  scale?: number
  animation?: string
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={animation}>
      <ellipse
        cx="0" cy="11" rx="17" ry="6"
        fill="#244e44" opacity="0.2"
      />
      <ellipse
        cx="0" cy="-4" rx="15" ry="12"
        fill={color}
      />
      <circle cx="9" cy="-16" r="11" fill={color}/>
      <path
        d="M2 -23 L-1 -37 L10 -27"
        fill={color}
      />
      <path
        d="M15 -24 L22 -36 L23 -20"
        fill={color}
      />
      <circle cx="13" cy="-17" r="2" fill="#293c3b"/>
      <circle cx="21" cy="-15" r="2" fill="#293c3b"/>
      <circle cx="18" cy="-10" r="2" fill="#e9b8a9"/>
      </g>
    </g>
  )
}

const trees = [
  [290, 318, 1.1],
  [340, 285, 0.85],
  [388, 315, 1.2],
  [450, 270, 0.8],
  [520, 295, 1.0],
  [570, 340, 0.8],
  [260, 385, 0.9],
  [350, 410, 1.0],
  [630, 400, 1.1],
  [705, 360, 0.9],
  [760, 410, 0.85],
  [460, 455, 0.9],
  [225, 345, 0.72],
] as const


// 【AI 協助設計】五個物種的視覺設定
const speciesAppearance = [
  {
    color: '#f1d2a0',
    animation: 'lumia-creature-walk',
  },
  {
    color: '#d9b7d8',
    animation: 'lumia-creature-hop',
  },
  {
    color: '#b8d9d3',
    animation: 'lumia-creature-sway',
  },
  {
    color: '#e4b9a5',
    animation: 'lumia-creature-hop',
  },
  {
    color: '#a7c5e6',
    animation: 'lumia-creature-walk',
  },
] as const

// 生物位置：分布在島嶼的不同區域
const creaturePositions = [
  [265, 420],
  [310, 455],
  [355, 435],
  [395, 470],
  [445, 420],
  [605, 455],
  [645, 475],
  [685, 445],
  [735, 470],
  [370, 340],
  [420, 365],
  [465, 330],
  [595, 345],
  [645, 365],
  [705, 345],
  [300, 375],
  [520, 460],
  [565, 425],
  [760, 405],
  [430, 490],
  [610, 395],
  [340, 480],
  [675, 405],
  [475, 390],
  [720, 425],
  [390, 400],
  [550, 350],
  [750, 365],
  [285, 465],
  [625, 420],
] as const


// 【AI 協助設計】文明聚落建築位置
const cottagePositions = [
  [690, 335, 1.1],
  [750, 375, 0.85],
  [655, 425, 0.75],
  [795, 405, 0.65],
  [710, 450, 0.7],
  [625, 365, 0.65],
  [775, 325, 0.6],
  [670, 290, 0.65],
  [740, 295, 0.55],
  [810, 365, 0.55],
  [615, 415, 0.55],
  [735, 490, 0.55],
] as const

export default function LumiaIsland() {
  const { world } = useWorld()

  // 【AI 協助設計】由共享世界資料計算視覺狀態
  const visual = calculateIslandVisualState(world)

  // 植物健康度轉換為草地色彩
  const healthy = visual.vegetationHealth / 100

  const grassHue = 38 + healthy * 105
  const grassColor = `hsl(${grassHue}, 38%, 55%)`

  // 讓河流保留最低可見寬度
  const riverOuterWidth = 12 + visual.waterLevel * 80
  const riverInnerWidth = 5 + visual.waterLevel * 58

  return (
    <section className="lumia-scene">
      {/* 【AI 協助設計】共享世界時間顯示 */}
      <div className="lumia-world-day">
        露米亞世界 · 第 {world.info.time} 天
      </div>

      <div className="lumia-scene-heading">
        <div className="lumia-civilization-status">
          🏠 聚落：{visual.cottageCount} 棟 ·
          文明人口：{world.civilizations[0]?.population ?? 0}
        </div>
        <span>WORLD 001 · LUMIA</span>
        <h2>露米亞｜初生之島</h2>
        <p>一座正在等待觀測的微型異界。</p>
      </div>

      <div className="lumia-scene-frame">
        <svg
          viewBox="0 0 1000 680"
          role="img"
          aria-label="露米亞微型島嶼，包含森林、河流、聚落與奇幻生物"
        >
          <defs>
            <linearGradient id="lumiaSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cce8ed"/>
              <stop offset="100%" stopColor="#f4e7c9"/>
            </linearGradient>

            <linearGradient id="lumiaGround" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8bc5a0"/>
              <stop offset="100%" stopColor="#4f977c"/>
            </linearGradient>

            <linearGradient id="lumiaCliff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b9a83"/>
              <stop offset="100%" stopColor="#5d706c"/>
            </linearGradient>

            <clipPath id="lumiaIslandClip">
              <path d="
                M 125 360
                Q 165 260 335 210
                Q 500 140 690 220
                Q 850 275 885 370
                Q 875 470 710 520
                Q 520 590 330 530
                Q 160 490 125 360 Z
              "/>
            </clipPath>
          </defs>

          {/* 天空 */}
          <rect
            width="1000"
            height="680"
            fill="url(#lumiaSky)"
          />

          {/* 遠景雲朵 */}
          <g fill="#ffffff" opacity="0.65">
            <ellipse cx="170" cy="140" rx="72" ry="20"/>
            <ellipse cx="205" cy="126" rx="48" ry="27"/>
            <ellipse cx="785" cy="120" rx="82" ry="21"/>
            <ellipse cx="815" cy="106" rx="43" ry="27"/>
          </g>

          {/* 島嶼投影 */}
          <ellipse
            cx="505" cy="555" rx="335" ry="55"
            fill="#678d87" opacity="0.17"
          />

          {/* 島嶼側面，形成浮島厚度 */}
          <path
            d="
              M125 360
              Q165 260 335 210
              Q500 140 690 220
              Q850 275 885 370
              L840 470
              Q730 575 540 620
              Q330 605 185 495
              Z
            "
            fill="url(#lumiaCliff)"
          />

          {/* 島嶼草地 */}
          <path
            d="
              M125 360
              Q165 260 335 210
              Q500 140 690 220
              Q850 275 885 370
              Q875 470 710 520
              Q520 590 330 530
              Q160 490 125 360 Z
            "
            fill={grassColor}
            stroke="#b9d8a1"
            strokeWidth="9"
          />

          {/* 島嶼上的水域與草地細節 */}
          <g clipPath="url(#lumiaIslandClip)">

            {/* 河流 */}
            <path
              d="
                M520 175
                C450 260 620 295 555 360
                S400 425 495 490
                S610 550 560 600
              "
              fill="none"
              stroke="#5ba9ba"
              strokeWidth={riverOuterWidth}
              strokeLinecap="round"
            />

            <path
              d="
                M520 175
                C450 260 620 295 555 360
                S400 425 495 490
                S610 550 560 600
              "
              fill="none"
              stroke="#9cdee0"
              strokeWidth={riverInnerWidth}
              strokeLinecap="round"
            />

            {/* 草地斑塊 */}
            <ellipse
              cx="350" cy="360" rx="120" ry="60"
              fill="#a8d2a0" opacity="0.4"
            />
            <ellipse
              cx="710" cy="390" rx="105" ry="65"
              fill="#b3d49a" opacity="0.4"
            />

            {/* 小徑 */}
            <path
              d="M630 350 Q690 390 745 465"
              fill="none"
              stroke="#e5cf9d"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="16 6"
            />

            {/* 森林 */}
            {trees.slice(0, visual.treeCount).map(([x, y, scale], index) => (
              <Tree
                key={index}
                x={x}
                y={y}
                scale={scale}
              />
            ))}

            {/* 森林健康度狀態 */}
            <g className="lumia-forest-status">
              <rect
                x="35" y="535"
                width="225" height="52"
                rx="12"
                fill="#173f35"
                opacity="0.82"
              />
              <text
                x="49" y="556"
                fill="#ffffff"
                fontSize="15"
              >
                {`森林健康度：${Math.round(visual.vegetationHealth)}%`}
              </text>
              <text
                x="49" y="576"
                fill="#d5f0dc"
                fontSize="13"
              >
                {`目前樹木：${Math.min(visual.treeCount, trees.length)} 棵`}
              </text>
            </g>

            {/* 聚落：依文明人口動態顯示 */}
            <g className="lumia-cottage-group">
              {cottagePositions
                .slice(0, visual.cottageCount)
                .map(([x, y, scale], index) => (
                  <g
                    key={index}
                    className="lumia-cottage-appear"
                  >
                    <Cottage
                      x={x}
                      y={y}
                      scale={scale}
                    />
                  </g>
                ))}
            </g>

            {/* 原創異界生物：依世界族群數量動態顯示 */}
            <g className="lumia-species-group">
              {world.species.flatMap((species, speciesIndex) => {
                const appearance =
                  speciesAppearance[
                    speciesIndex % speciesAppearance.length
                  ]

                const count =
                  visual.speciesCounts[species.id] ?? 0

                // 每個物種使用不同位置，避免全部重疊
                return Array.from(
                  { length: count },
                  (_, individualIndex) => {
                    const positionIndex =
                      speciesIndex * 6 + individualIndex

                    const [x, y] =
                      creaturePositions[
                        positionIndex % creaturePositions.length
                      ]

                    return (
                      <Creature
                        key={`${species.id}-${individualIndex}`}
                        x={x}
                        y={y}
                        color={appearance.color}
                        animation={appearance.animation}
                        scale={0.55 + (individualIndex % 3) * 0.08}
                      />
                    )
                  }
                )
              })}
            </g>

            {/* 發光植物 */}
            <g fill="#f8edb0" opacity="0.9">
              <circle cx="290" cy="470" r="5"/>
              <circle cx="375" cy="340" r="4"/>
              <circle cx="605" cy="310" r="5"/>
              <circle cx="790" cy="450" r="4"/>
            </g>

          </g>

          {/* 前景光點 */}
          <g fill="#ffffff" opacity="0.55">
            <circle cx="185" cy="270" r="3"/>
            <circle cx="830" cy="255" r="4"/>
            <circle cx="470" cy="130" r="3"/>
          </g>

        </svg>
      </div>

      <p className="lumia-scene-note">
        露米亞世界場景 · 第一版靜態插畫
      </p>
    </section>
  )
}
