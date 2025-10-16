import { GraphQLClient, gql } from 'graphql-request';
import { DateTime } from 'luxon';
import { PlayerMatch, PlayerData, Match, WinLossResult, HeroStats } from './types';
import dotenv from 'dotenv';

dotenv.config({ path: "../../.env" });

const STRATZ_URL = 'https://api.stratz.com/graphql';
const headers: any = {};

if (process.env.STRATZ_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.STRATZ_API_KEY}`;
    headers['Content-Type'] = 'application/json';
    headers['User-Agent'] = 'STRATZ_API';
}

const client = new GraphQLClient(STRATZ_URL, { headers });

function getBrtTimeStamp(days: number): number {
    return Math.floor(
        DateTime.now()
            .setZone('America/Sao_Paulo')
            .minus({ days })
            .startOf('day')
            .toSeconds()
    );
}

async function fetchMatches(steamId: string, isVictory: boolean, startDateTime: number, gameMode = 'ALL_PICK_RANKED') : Promise<number> {
    const query = gql`
        query {
            player(steamAccountId: ${steamId}) {
                matches(request: { isVictory: ${isVictory}, startDateTime: ${startDateTime} take: 100 }) {
                    gameMode
                    startDateTime
                }
            }
        }
    `;

    const data = await client.request<{ player: { matches: Match[] } }>(query);
    const matches = data.player?.matches ?? [];

    return matches.filter(match => match.startDateTime >= startDateTime && match.gameMode === gameMode).length;
}

function calculateWinRate(wins: number, losses: number): number {
    const totalGames = wins + losses;
    if (totalGames === 0) return 0.0;

    const winRate = (wins / totalGames) * 100;
    return parseFloat(winRate.toFixed(2));
}

export async function getPlayerWinLoss(steamId: string, days = 0): Promise<WinLossResult> {
    const startDateTime = getBrtTimeStamp(days);
    const wins = await fetchMatches(steamId, true, startDateTime);
    const losses = await fetchMatches(steamId, false, startDateTime);
    const winRate = calculateWinRate(wins, losses);

    return { wins, losses, winRate };
}

async function fetchHeroesMatches(steamId: string, isVictory: boolean, startDateTime: number, gameMode = 'ALL_PICK_RANKED') : Promise<PlayerMatch[]> {
    const query = gql`
        query {
            player(steamAccountId: ${steamId}) {
                matches(request: { isVictory: ${isVictory}, startDateTime: ${startDateTime}, take: 100 }) {
                    gameMode,
                    startDateTime,
                    players(steamAccountId: ${steamId}) {
                        hero {
                            id
                            displayName
                        }    
                    }
                }
            }
        }`
    ;
    
    const data = await client.request<PlayerData>(query);
    
    const matches = data.player?.matches ?? [];

    return matches.filter(match => match.startDateTime >= startDateTime && match.gameMode === gameMode);
}

export async function getPlayerWinLossByHero(steamId: string, days = 0) : Promise<Record<string, HeroStats>> {
    const startDateTime = getBrtTimeStamp(days);
    const heroesWins = await fetchHeroesMatches(steamId, true, startDateTime);
    const heroesLosses = await fetchHeroesMatches(steamId, false, startDateTime);

    const winCount = new Map<string, number>();
    const lossCount = new Map<string, number>();

    for (const match of heroesWins) {
        for (const player of match.players) {
            const heroName = player.hero.displayName;
            winCount.set(heroName, (winCount.get(heroName) ?? 0) + 1);
        }
    }

    for (const match of heroesLosses) {
        for (const player of match.players) {
            const heroName = player.hero.displayName;
            lossCount.set(heroName, (lossCount.get(heroName) ?? 0) + 1);
        }
    }

    const heroesSummary: Record<string, HeroStats> = {};
    const allHeroes = new Set([
        ...winCount.keys(),
        ...lossCount.keys(),
    ]);

    for (const hero of allHeroes) {
        const wins = winCount.get(hero) ?? 0;
        const losses = lossCount.get(hero) ?? 0;
        const totalMatches = wins + losses;
        const winrate = totalMatches > 0 ? parseFloat(((wins / totalMatches) * 100).toFixed(2)) : 0;

        heroesSummary[hero] = {
            totalMatches,
            wins,
            losses,
            winrate,
        };
    }

    return heroesSummary;
}