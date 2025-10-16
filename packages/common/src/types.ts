export interface Hero {
  id: number;
  displayName: string;
}

export interface PlayerMatch {
  gameMode: string;
  startDateTime: number;
  players: {
    hero: Hero;
  }[];
}

export interface PlayerData {
  player: {
    matches: PlayerMatch[];
  };
}

export interface Match {
  gameMode: string;
  startDateTime: number;
}

export interface WinLossResult {
  wins: number;
  losses: number;
  winRate: number;
}

export interface HeroStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winrate: number;
}

export interface LinkResponse {
  success: boolean;
  user: {
    discordId: string;
    dotaAccountId: string;
  };
}

export interface WLResponse {
  discordId: string;
  dotaAccountId: string;
  stats: WinLossResult
}

export interface HeroStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winrate: number;
}

export interface StatsResponse {
  stats: Record<string, HeroStats>;
  day: number;
}