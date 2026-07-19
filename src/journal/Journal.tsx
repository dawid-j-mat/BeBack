import { useMemo, useState } from 'react';
import './Journal.css';
import { groupByPlace, type Entry, type PlaceGroup } from '../lib/entries';
import { EntryCard } from '../components/EntryCard';
import { VERDICT_COLOR } from '../lib/verdicts';
import type { Category } from '../add/StepCategory';
import type { Verdict } from '../lib/verdicts';
import { t, formatEntryCount, formatMonthTitle, formatShortDate } from '../i18n';

const CATEGORY_KEY: Record<Category, 'kat_nocleg' | 'kat_jedzenie' | 'kat_atrakcja'> = {
  nocleg: 'kat_nocleg',
  jedzenie: 'kat_jedzenie',
  atrakcja: 'kat_atrakcja',
};

const MINI_KEY: Record<Verdict, 'mini_wroce' | 'mini_mozna' | 'mini_odradzam'> = {
  wroce: 'mini_wroce',
  mozna: 'mini_mozna',
  odradzam: 'mini_odradzam',
};

interface MonthSection {
  title: string;
  page: number;
  entries: Entry[];
}

// Entries arrive sorted newest-first (fetch order), so months come out in
// reverse chronology; pages count the other way - the oldest month is p. 1,
// like a real journal filling up.
function sliceIntoMonths(entries: Entry[]): MonthSection[] {
  const sections: MonthSection[] = [];
  let currentKey = '';
  for (const entry of entries) {
    const visited = new Date(`${entry.visitedOn}T12:00:00`);
    const key = `${visited.getFullYear()}-${visited.getMonth()}`;
    if (key !== currentKey) {
      currentKey = key;
      sections.push({
        title: formatMonthTitle(visited.getFullYear(), visited.getMonth()),
        page: 0,
        entries: [],
      });
    }
    sections[sections.length - 1].entries.push(entry);
  }
  sections.forEach((section, i) => {
    section.page = sections.length - i;
  });
  return sections;
}

interface JournalProps {
  entries: Entry[];
  currentUserId: string;
  onEdit: (entry: Entry) => void;
}

// The journal screen (SPEC §3.4): a chronological list grouped by month with
// mini verdict stamps. It layers over the map so MapLibre keeps running
// underneath. Tapping a row slides up the same entry card as on the map,
// opened at the tapped entry (D-30).
export function Journal({ entries, currentUserId, onEdit }: JournalProps) {
  const [selected, setSelected] = useState<{ group: PlaceGroup; entryId: string } | null>(null);
  const sections = useMemo(() => sliceIntoMonths(entries), [entries]);
  const groups = useMemo(() => groupByPlace(entries), [entries]);

  function openEntry(entry: Entry) {
    const group = groups.find((g) => g.place.id === entry.place.id);
    if (group) setSelected({ group, entryId: entry.id });
  }

  // The card renders as a sibling of the journal layer: .dziennik carries a
  // z-index, so a card nested inside would be trapped in its stacking
  // context and slide under the bottom nav.
  return (
    <>
      <div className="dziennik">
        <div className="dziennik-cialo">
          {entries.length > 0 && (
            <div className="dziennik-licznik">{formatEntryCount(entries.length)}</div>
          )}
          {sections.map((section) => (
            <section key={section.title}>
              <div className="miesiac">
                <b>{section.title}</b>
                <i />
                <span>
                  {t('strona')} {section.page}
                </span>
              </div>
              {section.entries.map((entry) => {
                const visited = new Date(`${entry.visitedOn}T12:00:00`);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className="wpis-rzad"
                    onClick={() => openEntry(entry)}
                  >
                    <span
                      className="mini-stempel"
                      style={{ color: VERDICT_COLOR[entry.verdict] }}
                      aria-hidden="true"
                    >
                      {t(MINI_KEY[entry.verdict])}
                      {entry.wow && (
                        <span className="wow-znak">
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2.5 14.6 9l6.9.3-5.4 4.3 1.9 6.6L12 16.4l-6 3.8 1.9-6.6L2.5 9.3 9.4 9Z" />
                          </svg>
                        </span>
                      )}
                    </span>
                    <span className="info">
                      <b>{entry.place.name}</b>
                      <small>
                        {entry.place.city ? `${entry.place.city} · ` : ''}
                        {t(CATEGORY_KEY[entry.category])}
                      </small>
                      {entry.pending && (
                        <span className="chip-sync">
                          <i aria-hidden="true" />
                          {t('sync_czeka')}
                        </span>
                      )}
                    </span>
                    <span className="data">{formatShortDate(visited)}</span>
                  </button>
                );
              })}
            </section>
          ))}
        </div>
      </div>
      {selected && (
        <EntryCard
          group={selected.group}
          initialEntryId={selected.entryId}
          currentUserId={currentUserId}
          onEdit={(entry) => {
            setSelected(null);
            onEdit(entry);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
