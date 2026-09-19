import { useTranslation } from 'react-i18next'

/** Full-page takeover shown while the agent reads the spread — the hero's own instrument dial, at work. */
export default function ReadingLoader() {
  const { t } = useTranslation()

  return (
    <div className="reading-loader">
      <div className="dial-wrap reading-loader-dial" aria-hidden="true">
        <svg viewBox="0 0 400 400">
          <g className="dial-ring-outer">
            <circle cx="200" cy="200" r="188" stroke="var(--line-bright)" strokeWidth="1" fill="none" />
            <g fontFamily="Space Mono" fontSize="10" fill="var(--paper-dim)" letterSpacing="2">
              <text x="200" y="20" textAnchor="middle">0</text>
              <text x="380" y="204" textAnchor="middle">VI</text>
              <text x="200" y="390" textAnchor="middle">XII</text>
              <text x="20" y="204" textAnchor="middle">XVIII</text>
            </g>
            <g stroke="var(--paper-dim)" strokeWidth="1">
              <line x1="200" y1="12" x2="200" y2="28" />
              <line x1="200" y1="372" x2="200" y2="388" />
              <line x1="12" y1="200" x2="28" y2="200" />
              <line x1="372" y1="200" x2="388" y2="200" />
            </g>
          </g>
          <circle cx="200" cy="200" r="150" stroke="var(--line)" strokeWidth="1" fill="none" strokeDasharray="1 7" />
          <g className="dial-ring-inner">
            <circle cx="200" cy="200" r="112" stroke="var(--brass)" strokeWidth="1" fill="none" />
            <path d="M200 88 L212 130 L200 172 L188 130 Z" fill="var(--brass-bright)" />
          </g>
          <circle cx="200" cy="200" r="70" fill="var(--ink-2)" stroke="var(--line-bright)" strokeWidth="1" />
          <g stroke="var(--paper)" strokeWidth="1.1" fill="none">
            <path d="M200 154 V246 M154 200 H246" stroke="var(--line-bright)" />
            <circle cx="200" cy="200" r="26" />
            <path d="M200 174 v-14 M200 226 v14 M174 200 h-14 M226 200 h14" />
          </g>
        </svg>
      </div>
      <p className="reading-loader-text mono">{t('gameBoard.reading.loading')}</p>
      <p className="reading-loader-caption mono">{t('gameBoard.reading.loadingCaption')}</p>
    </div>
  )
}
