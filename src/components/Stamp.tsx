import { useId } from 'react';
import { t } from '../i18n';
import { VERDICT_COLOR, type Verdict } from '../lib/verdicts';

const VERDICT_WORD: Record<Verdict, 'stamp_wroce' | 'stamp_mozna' | 'stamp_odradzam'> = {
  wroce: 'stamp_wroce',
  mozna: 'stamp_mozna',
  odradzam: 'stamp_odradzam',
};

interface StampProps {
  verdict: Verdict;
  wow: boolean;
  place: string;
  date: string;
}

// Round date stamp from the prototype (stampSVG): double ring, "BEBACK ·
// PLACE" running around, verdict word and date in the middle; WOW adds a
// dashed outer ring and the "★ WOW ★" line. Rotation and blend mode come
// from the .stempel CSS class.
export function Stamp({ verdict, wow, place, date }: StampProps) {
  const arcId = useId();
  const c = VERDICT_COLOR[verdict];
  const around = `BEBACK • ${place} • BEBACK • ${place} • `.toUpperCase();

  return (
    <svg viewBox="0 0 120 120">
      <defs>
        <path id={arcId} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      {wow && (
        <circle cx="60" cy="60" r="57" fill="none" stroke={c} strokeWidth="1.4" strokeDasharray="3 4" />
      )}
      <circle cx="60" cy="60" r="52" fill="none" stroke={c} strokeWidth="2.4" />
      <circle cx="60" cy="60" r="34" fill="none" stroke={c} strokeWidth="1.4" />
      <text fontFamily="Karla,sans-serif" fontWeight="700" fontSize="9.5" letterSpacing="2.5" fill={c}>
        <textPath href={`#${arcId}`}>{around}</textPath>
      </text>
      {wow && (
        <text
          x="60"
          y="45"
          textAnchor="middle"
          fontFamily="Karla,sans-serif"
          fontWeight="700"
          fontSize="8"
          letterSpacing="2"
          fill={c}
        >
          ★ WOW ★
        </text>
      )}
      <text
        x="60"
        y="57"
        textAnchor="middle"
        fontFamily="Domine,serif"
        fontWeight="700"
        fontSize="12.5"
        letterSpacing="1"
        fill={c}
      >
        {t(VERDICT_WORD[verdict])}
      </text>
      <text
        x="60"
        y="73"
        textAnchor="middle"
        fontFamily="Karla,sans-serif"
        fontWeight="700"
        fontSize="8.5"
        letterSpacing="1"
        fill={c}
      >
        {date.toUpperCase()}
      </text>
    </svg>
  );
}
