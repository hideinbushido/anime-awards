export type EventStatus =
  | 'draft'
  | 'preparation'
  | 'voting_open'
  | 'voting_closed'
  | 'results_published';

export interface AnimeEvent {
  id: string;
  name: string;
  year: number;
  status: EventStatus;
  voteOpenDate: string;
  voteCloseDate: string;
  liveDate: string;
  description: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  discordUrl?: string;
}

export interface Category {
  id: string;
  eventId: string;
  title: string;
  titleFr: string;
  titleEn: string;
  description: string;
  descriptionFr: string;
  descriptionEn: string;
  order: number;
  active: boolean;
  nomineeCount?: number;
}

export interface Nominee {
  id: string;
  categoryId: string;
  name: string;
  anime: string;
  imageUrl: string;
  audioUrl?: string;
  description: string;
  descriptionFr: string;
  descriptionEn: string;
  active: boolean;
}

export interface VoteAnswer {
  categoryId: string;
  nomineeId: string;
}

export interface Vote {
  id: string;
  eventId: string;
  voterName: string;
  voterEmail?: string;
  voterCountry?: string;
  votedAt: string;
  answers: VoteAnswer[];
  ipHash?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
}
