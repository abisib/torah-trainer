export type Nusach = 'standard' | 'yemenite';

export interface VerseVersion {
  text_full: string;
  text_clean: string;
}

export interface Verse {
  verse_num: number;
  chapter?: number;
  verse?: number;
  text_full: string;
  text_clean: string;
  targum: string;
  versions?: {
    standard: VerseVersion;
    yemenite: VerseVersion;
  };
}

export interface Aliyah {
  num: number;
  range: string;
  verses: Verse[];
}

export interface VerseData {
  id: string;
  name: string;
  hebrew: string;
  ref: string;
  verses: Verse[];
  aliyot: Aliyah[];
  haftara?: Aliyah;
  aliyot_yemenite?: Aliyah[];
  haftara_yemenite?: Aliyah;
  ref_yemenite?: string;
  is_override?: boolean;
}

export interface Parasha {
  name: string;
  hebrew?: string;
  id: string;
  ref: string;
  aliyot?: string[];
}

export interface Book {
  book: string;
  hebrew: string;
  parashot: Parasha[];
}
