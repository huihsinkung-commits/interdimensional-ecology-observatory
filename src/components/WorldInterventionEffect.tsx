import { useEffect, useState } from 'react'
import './WorldInterventionEffect.css'

type EffectKind = 'rain' | 'restore' | 'aid'

type EffectState = {
  kind: EffectKind
  id: number
}

const labels: Record<EffectKind, string> = {
  rain: '🌧️ 人工降雨啟動',
  restore: '🌱 生態復育啟動',
  aid: '🏛️ 文明援助啟動',
}

export default function WorldInterventionEffect() {
  const [effect, setEffect] = useState<EffectState | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    function handle(event: Event) {
      const custom = event as CustomEvent<EffectKind>
      const kind = custom.detail

      if (!['rain', 'restore', 'aid'].includes(kind)) {
        return
      }

      if (timer) clearTimeout(timer)

      setEffect({
        kind,
        id: Date.now(),
      })

      timer = setTimeout(() => {
        setEffect(null)
      }, 4200)
    }

    window.addEventListener('lumia-intervention', handle)

    return () => {
      window.removeEventListener('lumia-intervention', handle)
      if (timer) clearTimeout(timer)
    }
  }, [])

  if (!effect) return null

  return (
    <div
      key={effect.id}
      className={`lumia-intervention lumia-effect-${effect.kind}`}
      aria-live="polite"
    >
      <div className="lumia-effect-sky" />

      {effect.kind === 'rain' && (
        <>
          <div className="lumia-effect-cloud cloud-one">☁️</div>
          <div className="lumia-effect-cloud cloud-two">☁️</div>
          <div className="lumia-rain-field">
            {Array.from({ length: 64 }, (_, index) => (
              <span
                key={index}
                className="lumia-raindrop"
                style={{
                  left: `${(index * 37) % 100}%`,
                  animationDelay: `${(index % 13) * -0.19}s`,
                  animationDuration: `${0.7 + (index % 5) * 0.12}s`,
                }}
              />
            ))}
          </div>
          <div className="lumia-rain-ripple ripple-one" />
          <div className="lumia-rain-ripple ripple-two" />
        </>
      )}

      {effect.kind === 'restore' && (
        <>
          <div className="lumia-nature-glow" />
          {Array.from({ length: 18 }, (_, index) => (
            <span
              key={index}
              className="lumia-nature-particle"
              style={{
                left: `${8 + ((index * 29) % 84)}%`,
                bottom: `${10 + ((index * 17) % 35)}%`,
                animationDelay: `${(index % 9) * 0.16}s`,
              }}
            >
              {index % 3 === 0 ? '🌿' : '✦'}
            </span>
          ))}
          <div className="lumia-nature-sprout sprout-one">🌱</div>
          <div className="lumia-nature-sprout sprout-two">🌳</div>
          <div className="lumia-nature-sprout sprout-three">🌱</div>
        </>
      )}

      {effect.kind === 'aid' && (
        <>
          <div className="lumia-tech-beam" />
          <div className="lumia-tech-ring ring-one" />
          <div className="lumia-tech-ring ring-two" />
          {Array.from({ length: 14 }, (_, index) => (
            <span
              key={index}
              className="lumia-tech-symbol"
              style={{
                left: `${12 + ((index * 23) % 76)}%`,
                top: `${15 + ((index * 19) % 60)}%`,
                animationDelay: `${(index % 7) * 0.2}s`,
              }}
            >
              {index % 2 === 0 ? '✧' : '⌘'}
            </span>
          ))}
          <div className="lumia-tech-building">🏛️</div>
        </>
      )}

      <div className="lumia-effect-label">
        {labels[effect.kind]}
      </div>
    </div>
  )
}
