export interface Dataset {
    teams: TeamsInfo[];
}

export interface TeamsInfo {
    name: string;
    city: string;
    league: string;
    year: string;
    sport: string;
}