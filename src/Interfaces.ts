export interface Command {
    command: string;
    payload: any;
}

export interface RCONCommand {
    command: string;
    args: Array<string>;
}

export interface RCONResponse {
    response: string;
}

export interface IPCMessage {
    type: string;
    payload?: any;
}


export interface PZPerk {
    name: string;
    level: number;
}

export type PZTrait = string;

export interface PZFaction {
    name: string;
    owner: string;
    tag: string;
}

export interface PZPlayerStats {
    weight: number;
    health: number;
    zombie_kills: number;
    players_kills: number;
    hours_survived: number;
    perks: Array<PZPerk>
}

export interface PZLivingPlayer {
    username: string;
    full_name: string;
    display_name: string;
    access_level: string;
    last_connection?: Date;
    traits: Array<PZTrait>;
    stats: PZPlayerStats;
    faction?: PZFaction;
    updated_at: Date;


}

export interface PZDeadPlayer {
    username: string;
    full_name: string;
    display_name: string;
    access_level: string;
    last_connection?: Date;
    dead_at: Date;
    updated_at: Date;
}

export type PZPlayer = PZLivingPlayer | PZDeadPlayer

export interface PZDBPlayer {
    username: string;
    id: number;
    isDead: number;
}


export enum ServerStatus {
    UP = "up",
    DOWN = "down",
}

export interface PZServerData {
    players: Array<string>;
    game_time: Date;
}

export interface PZInfo {
    data?: PZServerData;
    status: ServerStatus;
    lastUpdated: Date;
}

