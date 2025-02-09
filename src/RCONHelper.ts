import {Rcon} from "rcon-client"
import {Log} from "./Log"

export class RCONHelper {
    private static rcon = new Rcon({
        host: process.env.RCON_HOST ? process.env.RCON_HOST : "localhost",
        port: process.env.RCON_PORT ? parseInt(process.env.RCON_PORT) : 27015,
        password: process.env.RCON_PW ? process.env.RCON_PW : ""
    });
    private static isShuttingDown: boolean = false;

    private static reconnectInterval: NodeJS.Timeout;

    public static get shutdown(): boolean {
        return RCONHelper.isShuttingDown;
    }

    public static set shutdown(shutdown: boolean) {
        RCONHelper.isShuttingDown = shutdown;
    }

    public static tryToConnectToRcon = async () => {
        try {
            await RCONHelper.rcon.connect();
        } catch (error: any) {
            if (error.code !== 'ECONNREFUSED') {
                Log.error(`RCON Client connection error: ${error}`);
            }
            clearTimeout(RCONHelper.reconnectInterval);
            RCONHelper.reconnectInterval = setTimeout(RCONHelper.tryToConnectToRcon, 1000);
        }
    }

    public static startRCONClient = async () => {
        RCONHelper.rcon.on("connect", () => {
            Log.info('RCON Client connected');
        });

        RCONHelper.rcon.on("error", (error) => {
            Log.error(`RCON Client error: ${error}`);
            if (RCONHelper.isShuttingDown) return;
            clearTimeout(RCONHelper.reconnectInterval);
            RCONHelper.reconnectInterval = setTimeout(RCONHelper.tryToConnectToRcon, 1000);
        });

        RCONHelper.rcon.on('end', () => {
            Log.warn('RCON Client ended');
            if (RCONHelper.isShuttingDown) return;
            clearTimeout(RCONHelper.reconnectInterval);
            RCONHelper.reconnectInterval = setTimeout(RCONHelper.tryToConnectToRcon, 1000);
        });

        return RCONHelper.tryToConnectToRcon();
    }

    public static stopRCONClient = async () => {
        return RCONHelper.rcon.end();
    }

    public static send = async (command: string, args: Array<string> | undefined) => {
        let commandString = command;
        if (args && args?.length > 0) {
            commandString += ' ' + args.map(arg => `"${arg}"` ? arg.includes(" ") : arg).join(' ');
        }
        return RCONHelper.rcon.send(commandString);
    }
}
