export interface Command {
    command: string;
    payload: any;
}

export interface RCONCommand {
    command: string;
    args?: Array<string>;
}

export interface RCONResponse {
    response: string;
}

export interface IPCMessage {
    type: string;
    payload?: any;
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
    hours_survived: number;
    perks: Map<string, number>;
}


export interface PZPlayerData {
    username: string;
    forename: string;
    surname: string;
    display_name: string;
    access_level: string;
    is_female: boolean;


    traits: Array<string>;
    stats: PZPlayerStats;
    faction?: PZFaction;
    profession: string;
}

export interface PZPlayer extends PZPlayerData {
    updated_at: Date;
    dead_at?: Date;
    banned: boolean;
    steam_id?: string;
}

export interface PZDBPlayer {
    username: string;
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

export enum PlayerStatus {
    NONE = "none",
    ALIVE = "alive",
    DEAD = "dead",
    BANNED = "banned",
}

