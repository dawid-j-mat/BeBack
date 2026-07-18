import { useEffect, useState } from 'react';
import { Stamp, type Verdict } from '../components/Stamp';
import { t } from '../i18n';

interface PrzybicieProps {
  verdict: Verdict;
  wow: boolean;
  place: string;
  date: string;
  onDone: () => void;
}

// Full-screen stamp-thud: the stamp slams in (scale 2.6 -> 1 with a spring
// curve), an ink wave ripples out, a handwritten confirmation appears, then
// we return to the map. prefers-reduced-motion collapses the animations via
// the global rule in base.css.
export function Przybicie({ verdict, wow, place, date, onDone }: PrzybicieProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimate(true));
    const timer = setTimeout(onDone, 1900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className={`przybicie${animate ? ' animuj' : ''}`}>
      <div className="fala" />
      <div className="stempel">
        <Stamp verdict={verdict} wow={wow} place={place} date={date} />
      </div>
      <p>{t('zapisano')}</p>
    </div>
  );
}
