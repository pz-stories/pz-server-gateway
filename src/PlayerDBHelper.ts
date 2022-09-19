import knex, { Knex } from 'knex';
import { PZDBPlayer, PZPlayer } from './Interfaces';

export const PLAYERS_DB = 'player';
export const PZ_PLAYERS_DB = 'networkPlayers';

if(!process.env.PZ_PLAYERS_DB && !process.env.DEBUG) {
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

        console.log('Database connection established');
    }

    public static async createTables() {
        if(!(await PlayerDBHelper.knex.schema.hasTable(PLAYERS_DB))) {
                await PlayerDBHelper.knex.schema.createTable(PLAYERS_DB, (table) => {
                table.string('username', 100).primary();
                table.text('dataJSONString').notNullable();
                table.timestamps({
                    defaultToNow: true,
                    useCamelCase: true
                });
            });
        }
    }

    public static async getPZPlayers(): Promise<Array<PZDBPlayer>>  {
        return PlayerDBHelper.pzKnex.select().from(PZ_PLAYERS_DB);
    }

    public static async getPlayers(): Promise<Array<PZPlayer>> {
        const dbRecords = await PlayerDBHelper.knex.select('dataJSONString', 'updatedAt').from(PLAYERS_DB);
        const players = dbRecords.map(dbRecord => {
            return {
                ...JSON.parse(dbRecord.dataJSONString),
                lastSeen: dbRecord.updatedAt
            } as PZPlayer
        });

        return players;
    }

    public static async getPlayer(username: string): Promise<PZPlayer | undefined> {
        const dbRecord = (await PlayerDBHelper.knex.select('dataJSONString', 'updatedAt').from(PLAYERS_DB).where({ username }).limit(1))[0];
        if(!dbRecord) {
            return undefined;
        }

        return {
            ...JSON.parse(dbRecord.dataJSONString),
            lastSeen: dbRecord.updatedAt
        }
    }

    public static async upsertPlayer(isoPlayer: PZPlayer) {
        return PlayerDBHelper.knex.insert({
            username: isoPlayer.username,
            dataJSONString: JSON.stringify(isoPlayer)
        }).into(PLAYERS_DB).onConflict('username').merge(['dataJSONString']);
    }

    public static async upsertPlayers(isoPlayers: Array<PZPlayer>) {
        return Promise.all(isoPlayers.map(isoPlayer => PlayerDBHelper.upsertPlayer(isoPlayer)));
    }
}
