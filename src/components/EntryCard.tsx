import { useEffect, useState } from 'react';
import './EntryCard.css';
import type { Entry, PlaceGroup } from '../lib/entries';
import type { Category } from '../add/StepCategory';
import { Stamp } from './Stamp';
import { t, formatVisitDate } from '../i18n';

const CATEGORY_KEY: Record<Category, 'kat_nocleg' | 'kat_jedzenie' | 'kat_atrakcja'> = {
  nocleg: 'kat_nocleg',
  jedzenie: 'kat_jedzenie',
  atrakcja: 'kat_atrakcja',
};

interface EntryCardProps {
  group: PlaceGroup;
  currentUserId: string;
  onEdit: (entry: Entry) => void;
  onClose: () => void;
  initialEntryId?: string;
}

// A journal page sliding up from the bottom (prototype: .karta): sticky tape,
// the verdict stamp in the corner, the 200-char note and - only for the
// author - the private note. Several entries at one place share the pin and
// flip here like pages (D-27). The journal passes initialEntryId to open the
// card straight at the tapped entry.
export function EntryCard({ group, currentUserId, onEdit, onClose, initialEntryId }: EntryCardProps) {
  const [pageIndex, setPageIndex] = useState(() =>
    Math.max(0, group.entries.findIndex((e) => e.id === initialEntryId)),
  );
  useEffect(() => {
    setPageIndex(Math.max(0, group.entries.findIndex((e) => e.id === initialEntryId)));
  }, [group, initialEntryId]);

  const count = group.entries.length;
  const entry = group.entries[Math.min(pageIndex, count - 1)];
  const visited = new Date(`${entry.visitedOn}T12:00:00`);

  return (
    <>
      <button type="button" className="zaslona" aria-label={t('zamknij')} onClick={onClose} />
      <article className="karta">
        <div className="tasma" aria-hidden="true" />
        <div className="karta-wnetrze">
          <div className="stempel maly" aria-hidden="true">
            <Stamp
              verdict={entry.verdict}
              wow={entry.wow}
              place={group.place.city ?? group.place.name}
              date={formatVisitDate(visited)}
            />
          </div>
          <h2>{group.place.name}</h2>
          <div className="kat-linia">
            {t(CATEGORY_KEY[entry.category])}
            {group.place.city ? ` · ${group.place.city}` : ''}
          </div>
          {entry.verdictChanged && <div className="zmiana-reka">{t('werdykt_zmieniony')}</div>}
          {count > 1 && (
            <div className="kartki">
              <button
                type="button"
                aria-label={t('wstecz')}
                onClick={() => setPageIndex((i) => (i - 1 + count) % count)}
              >
                ‹
              </button>
              <span>
                {pageIndex + 1}/{count}
              </span>
              <button
                type="button"
                aria-label={t('dalej_aria')}
                onClick={() => setPageIndex((i) => (i + 1) % count)}
              >
                ›
              </button>
            </div>
          )}
          {entry.note && <p className="opis">{entry.note}</p>}
          {entry.privateNote && (
            <div className="prywatna">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <div>
                <b>{t('pryw_naglowek')}</b>
                <p>{entry.privateNote}</p>
              </div>
            </div>
          )}
          <div className="meta-linia">
            <span className="data-reka">{formatVisitDate(visited)}</span>
            <span className="meta-prawa">
              <span className="podpis-reka">{entry.authorName}</span>
              {entry.userId === currentUserId && (
                <button type="button" className="btn-maly" onClick={() => onEdit(entry)}>
                  {t('edytuj')}
                </button>
              )}
            </span>
          </div>
        </div>
      </article>
    </>
  );
}
