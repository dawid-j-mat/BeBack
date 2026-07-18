// Verdict semantics shared by the stamp, the map pins and the journal:
// ink colours from DESIGN §2 plus the darker rim the prototype paints
// around a pin head.

export type Verdict = 'wroce' | 'mozna' | 'odradzam';

export const VERDICT_COLOR: Record<Verdict, string> = {
  wroce: '#3A6B4A',
  mozna: '#8A7E66',
  odradzam: '#B0342C',
};

export const VERDICT_RIM: Record<Verdict, string> = {
  wroce: '#2A4F37',
  mozna: '#665D48',
  odradzam: '#7E251F',
};
