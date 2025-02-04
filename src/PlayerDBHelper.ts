import knex, {Knex} from 'knex';
import {PlayerStatus, PZDBPlayer, PZPlayer, PZPlayerData} from './Interfaces';
import {Log} from './Log';

export const PLAYERS_DB = 'player';
export const PZ_PLAYERS_DB = 'networkPlayers';
export const PZ_WHITELIST_DB = 'whitelist';

if (!process.env.PZ_PLAYERS_DB && !process.env.DEBUG) {
    throw 'MISSING PZ_PLAYERS_DB ENV VAR';
}

if (!process.env.PZ_WHITELIST_DB && !process.env.DEBUG) {
    throw 'MISSING PZ_WHITELIST_DB ENV VAR';
}

export class PlayerDBHelper {
    public static knex: Knex;
    public static pzKnex: Knex;
    public static whiteList: Knex;

    public static async init() {
        PlayerDBHelper.knex = knex({
            client: 'sqlite3',
            useNullAsDefault: true,
            connection: {
                filename: process.env.EXPORTED_PLAYERS_DB ? process.env.EXPORTED_PLAYERS_DB : './exportedPlayers.db'
            }
        });

        PlayerDBHelper.pzKnex = knex({
            client: 'sqlite3',
            useNullAsDefault: true,
            connection: {
                filename: process.env.PZ_PLAYERS_DB ? process.env.PZ_PLAYERS_DB : "" // e.g. ~/Zomboid/Saves/Multiplayer/SERVERNAME/players.db
            }
        });

        PlayerDBHelper.whiteList = knex({
            client: 'sqlite3',
            useNullAsDefault: true,
            connection: {
                filename: process.env.PZ_WHITELIST_DB ? process.env.PZ_WHITELIST_DB : ""
            }
        })

        await PlayerDBHelper.createTables();

        Log.info('Database connection established');
    }

    public static async createTables() {
        if (!(await PlayerDBHelper.knex.schema.hasTable(PLAYERS_DB))) {
            await PlayerDBHelper.knex.schema.createTable(PLAYERS_DB, (table) => {
                table.string('username', 100).primary();
                table.text('dataJSONString').notNullable();
                table.datetime("dead_at").nullable();
                table.timestamps({
                    defaultToNow: true,
                    useCamelCase: true
                });
            });
        }
    }

    private static async getPlayerData(where: object): Promise<DBRecord | undefined> {
        return (
            await PlayerDBHelper.knex.
            select('dataJSONString', 'updatedAt', 'dead_at').
            from(PLAYERS_DB).
            where(where).
            limit(1)
        )[0];
    }

    private static async getDbPlayer(where: object): Promise<PZDBPlayer | undefined> {
        return (
            await PlayerDBHelper.pzKnex.
            select('username', 'isDead').
            from<PZDBPlayer>(PZ_PLAYERS_DB).
            where(where).
            limit(1)
        )[0];
    }

    private static async getWhiteList(where: object): Promise<WhiteListRecord | undefined> {
        return (
            await PlayerDBHelper.whiteList.
            select('username','steamId','banned').
            from<WhiteListRecord>(PZ_WHITELIST_DB).
            where(where).
            limit(1)
        )[0];
    }


    public static async getPlayer(username: string): Promise<PZPlayer | undefined> {
        const dbRecord = await PlayerDBHelper.getPlayerData({username});
        if (!dbRecord) {
            return undefined;
        }

        const pzPlayer = await PlayerDBHelper.getDbPlayer({username});

        if (pzPlayer) {
            if (!!pzPlayer.isDead && !dbRecord.dead_at) {
                dbRecord.dead_at = new Date(1)
            }

            // If player again alive in main game db,
            // we will follow this changes.
            if (pzPlayer.isDead == 0) {
                dbRecord.dead_at = undefined;
            }
        }

        const whiteListData = await PlayerDBHelper.getWhiteList({username});

        dbRecord.banned = !!(whiteListData?.banned);
        dbRecord.steamId = whiteListData?.steamId;


        return PlayerDBHelper.convertPlayer(dbRecord)
    }

    public static async upsertPlayer(isoPlayer: PZPlayerData) {
        isoPlayer = PlayerDBHelper.preparePlayer(isoPlayer)

        return PlayerDBHelper.knex.insert({
            username: isoPlayer.username,
            dataJSONString: JSON.stringify(isoPlayer)
        }).into(PLAYERS_DB).onConflict('username').merge(['dataJSONString', 'updatedAt']);
    }

    public static async upsertPlayers(isoPlayers: Array<PZPlayer>) {
        return Promise.all(isoPlayers.map(isoPlayer => PlayerDBHelper.upsertPlayer(isoPlayer)));
    }

    public static async markDead(player: PZPlayerData) {
        player = PlayerDBHelper.preparePlayer(player)

        return PlayerDBHelper.knex.insert({
            username: player.username,
            dead_at: new Date(),
            dataJSONString: JSON.stringify(player)
        }).into(PLAYERS_DB).onConflict('username').merge(['dataJSONString', 'dead_at', 'updatedAt']);
    }


    private static preparePlayer(player: PZPlayerData) {
        player.access_level = player.access_level.toLowerCase()

        if (player.access_level === "none") {
            player.access_level = "player";
        }

        return player;
    }


    private static convertPlayer(dbRecord: DBRecord): PZPlayer {
        const data = JSON.parse(dbRecord.dataJSONString)
        if (typeof dbRecord.dead_at === "number") {
            dbRecord.dead_at = new Date(dbRecord.dead_at)
        }

        return {
            ...data,
            updated_at: new Date(dbRecord.updatedAt),
            dead_at: dbRecord.dead_at,
            banned: dbRecord.banned,
            steam_id: dbRecord.steamId,
        }
    }

    public static async getStatus(username: string): Promise<PlayerStatus> {
        const whiteList = await PlayerDBHelper.getWhiteList({username})
        if (!whiteList) {
            return PlayerStatus.NONE
        }

        if (whiteList?.banned) {
            return PlayerStatus.BANNED;
        }

        const dbPlayer = await PlayerDBHelper.getDbPlayer({username});
        if (!dbPlayer) {
            return PlayerStatus.NONE;
        }

        if (dbPlayer?.isDead) {
            return PlayerStatus.DEAD
        }

        const data = await PlayerDBHelper.getPlayerData({username})
        if (data) {
            return PlayerStatus.ALIVE;
        }

        return PlayerStatus.NONE;
    }
}

interface DBRecord {
    dataJSONString: string,
    updatedAt: Date,
    dead_at?: Date | number,
    banned: boolean;
    steamId?: string;
}

interface WhiteListRecord {
    username: string;
    steamId?: string;
    banned?: boolean;
}