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

interface BasePlayer {
    username: string;
    forename: string;
    surname: string;
    display_name: string;
    access_level: string;
    is_female: boolean;
    updated_at: Date;
}

export interface PZLivingPlayer extends BasePlayer {
    traits: Array<string>;
    stats: PZPlayerStats;
    faction?: PZFaction;
    profession: string;

    status: "alive";
}

export interface PZDeadPlayer extends BasePlayer {
    dead_at: Date;

    status: "dead"
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

