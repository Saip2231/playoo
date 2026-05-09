// types.ts
export interface PlayerMatch {
    player1: string;
    player2: string;
}

export interface MatchmakingResponse {
    message: string;
    matches: PlayerMatch[];
}