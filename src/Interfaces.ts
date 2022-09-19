export interface Command {
    command: string;
    payload: any;
};

export interface RCONCommand {
    command: string;
    args: Array<string>;
};

export interface RCONResponse {
    response: string;
};

export interface IPCMessage {
    type: string;
    payload?: any;
};

export interface PZServerOption {
    name: string;
    value: any;
    defaultValue: any;
};

export interface PZServerInfo {
    options: PZServerOption;
};

export interface PZMoodle {
    name: string;
    level: number;
};

export interface PZPerk {
    name: string;
    level: number;
};

export type PZTrait = string;

export interface PZStats {
    numVeryCloseZombies: number;
    thirst: number;
    endurance: number;
    hunger: number;
    sanity: number;
    enduranceRecharging: boolean;
    tripping: boolean;
    sickness: number;
    fear: number;
    trippingRotAngle: number;
    enduranceDanger: number;
    stressFromCigarettes: number;
    fitness: number;
    numVisibleZombies: number;
    idleBoredom: number;
    fatigue: number;
    numChasingZombies: number;
    stress: number;
    enduranceLast: number;
    visibleZombies: number;
    anger: number;
    boredom: number;
    maxStressFromCigarettes: number;
    drunkenness: number;
    enduranceWarn: number;
    pain: number;
};

export interface PZNutrition {
    calories: number;
    carbohydrates: number;
    lipids: number;
    proteins: number;
    weight: number;
};

export interface PZInventoryItem {
    name: string;
    type: string;
    num: number;
};

export interface PZBodyPart {
    name: string;
    health: number;
    scratched: boolean;
    deepWounded: boolean;
    bitten: boolean;
    stitched: boolean;
    bleeding: boolean;
    isBurnt: boolean;
    bandaged: boolean;
    isCut: boolean
};

export interface PZBody {
    parts: PZBodyPart;
    infectionLevel: number;
    isSneezingCoughing: number;
    isInfected: boolean;
    isOnFire: boolean;
};

export interface PZPlayer {
    id?: number; // PZDB ID
    username: string;
    onlineId: number;
    steamId: number;
    accessLevel: "Admin" | "None" | any;
    zombieKills: number;
    foreName: string;
    surName: string;
    displayName: string;
    x: number;
    y: number;
    z: number;
    hoursSurvived: number;
    moodles: Array<PZMoodle>;
    perks: Array<PZPerk>;
    traits: Array<PZTrait>;
    stats: PZStats;
    nutrition: PZNutrition;
    inventory: Array<PZInventoryItem>;
    playerBody: PZBody;
    online?: boolean;
    lastSeen?: Date;
    isDead?: boolean;
};

export interface PZDBPlayer {
    username: string;
    id: number;
    isDead: number;
};

export type PZSafeHousePlayer = string;

export interface PZSafeHouse {
    id: number;
    title: string;
    owner: string;
    players: Array<PZSafeHousePlayer>;
    x: number;
    y: number;
    h: number;
    w: number;
    safeHouseItems: Array<PZInventoryItem>;
};

export type PZRecipe = string;
export type PZOutfit = string;

export interface PZGameInfo {
    paused: boolean;
    hourMinute: string;
    recipes: Array<PZRecipe>;
    femaleOutfits: Array<PZOutfit>;
    maleOutfits: Array<PZOutfit>;
    climate: PZClimate;
};

export interface PZColorRGBA {
    a: number;
    r: number;
    g: number;
    b: number;
};

export interface PZColorInfo {
    interior: PZColorRGBA;
    exterior: PZColorRGBA;
};

export interface PZClimate {
    desaturation: number;
    globalLightIntensity: number;
    nightStrength: number;
    precipitationIntensity: number;
    temperature: number;
    fogIntensity: number;
    windIntensity: number;
    windAngleIntensity: number;
    cloudIntensity: number;
    ambient: number;
    viewDistance: number;
    daylightStrength: number;
    humidity: number;
    snow: boolean;
    globalLightColor: PZColorInfo;
    newFogColor: PZColorInfo;
};

export interface PZServerData {
    server: PZServerInfo;
    players: Array<PZPlayer>;
    safeHouses: Array<PZSafeHouse>;
    game: PZGameInfo;
};

export interface PZInfo {
    data: PZServerData;
    lastUpdated: Date;
};

export interface SlapPayload {
    username?: string;
};

export interface ComeGetSomePayload {
    username?: string;
};

export interface HordePayload {
    username?: string;
};

export interface MessagePayload {
    to?: string;
    text: string;
};

export interface GiftPayload {
    username?: string;
    items: Array<string>;
};

export interface ZombieJumpScarePayload {
    username?: string;
};
