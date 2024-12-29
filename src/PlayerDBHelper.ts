import knex, {Knex} from 'knex';
import {PZDBPlayer, PZDeadPlayer, PZLivingPlayer, PZPlayer} from './Interfaces';
import {Log} from './Log';

export const PLAYERS_DB = 'player';
export const PZ_PLAYERS_DB = 'networkPlayers';

if (!process.env.PZ_PLAYERS_DB && !process.env.DEBUG) {
    throw 'MISSING PZ_PLAYERS_DB ENV VAR';
}

export class PlayerDBHelper {
    public static knex: Knex;
    public static pzKnex: Knex;

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

    public static async getPlayer(username: string): Promise<PZPlayer | undefined> {
        const dbRecord = (
            await PlayerDBHelper.
            knex.
            select('dataJSONString', 'updatedAt', 'dead_at').
            from(PLAYERS_DB).where({username}).limit(1)
        )[0];
        if (!dbRecord) {
            return undefined;
        }

        const pzPlayer = (
            await PlayerDBHelper.pzKnex.select().
            from<PZDBPlayer>(PZ_PLAYERS_DB).where({username}).limit(1)
        )[0];

        if (pzPlayer.isDead !== 0 && !dbRecord.dead_at) {
            dbRecord.dead_at = new Date(1)
        }
        
        return PlayerDBHelper.convertPlayer(dbRecord)
    }

    public static async upsertPlayer(isoPlayer: PZPlayer) {
        isoPlayer.access_level = isoPlayer.access_level.toLowerCase()

        if (isoPlayer.access_level == "none") {
            isoPlayer.access_level = "player"
        }


        return PlayerDBHelper.knex.insert({
            username: isoPlayer.username,
            dataJSONString: JSON.stringify(isoPlayer)
        }).into(PLAYERS_DB).onConflict('username').merge(['dataJSONString']);
    }

    public static async upsertPlayers(isoPlayers: Array<PZPlayer>) {
        return Promise.all(isoPlayers.map(isoPlayer => PlayerDBHelper.upsertPlayer(isoPlayer)));
    }

    public static async markDead(username: string) {
        return PlayerDBHelper.knex.where({username}).update({
            dead_at: new Date(),
        }).into(PLAYERS_DB)
    }


    private static convertPlayer(dbRecord: DBRecord): PZPlayer {
        const data = JSON.parse(dbRecord.dataJSONString)
        if (dbRecord.dead_at === null) {
            return {
                ...data,
                updated_at: dbRecord.updatedAt,
                status: "alive"
            } as PZLivingPlayer
        }

        if (typeof dbRecord.dead_at === "number") {
            dbRecord.dead_at = new Date(dbRecord.dead_at)
        }

        return {
            username: data.username,
            forename: data.forename,
            surname: data.surname,
            display_name: data.display_name,
            access_level: data.access_level,
            is_female: data.is_female,
            dead_at: dbRecord.dead_at,
            updated_at: dbRecord.updatedAt,
            status: "dead",
        } as PZDeadPlayer
    }
}

interface DBRecord {
    dataJSONString: string,
    updatedAt: Date,
    dead_at?: Date,
}
