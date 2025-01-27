import express, {Application, Request, Response} from "express";
import cors from 'cors';
import compression from "compression";
import {Server, Socket} from "socket.io";
import {ChildProcess, fork} from 'child_process';
import http from 'http';
import {PlayerDBHelper} from "./PlayerDBHelper";
import {IPCMessage, PZInfo, PZServerData, RCONCommand, RCONResponse, ServerStatus} from "./Interfaces";
import {handleAuth} from "./Auth";
import {RCONHelper} from "./RCONHelper";
import {Log} from "./Log";

let inpipeThread: ChildProcess | undefined;
let outpipeThread: ChildProcess | undefined;
let serverData: PZServerData;
let lastUpdated: Date;
let serverIsUp = false;
let refreshInfoTimeOut: NodeJS.Timeout;
let shutdown = false;

const app: Application = express();
const expressPort = process.env.EXPRESS_PORT ? process.env.EXPRESS_PORT : 8080;
const websocketPort = process.env.WEBSOCKET_PORT ? process.env.WEBSOCKET_PORT as any : 8088;

const sendMessage = (message: IPCMessage) => {
    inpipeThread?.send(message);
};

const killInpipeThread = () => {
    inpipeThread?.kill('SIGINT');
    const inppipeThreadPID = inpipeThread?.pid;
    if (inppipeThreadPID && inppipeThreadPID > 0) {
        try {
            process.kill(inppipeThreadPID, 'SIGHUP');
        } catch (error: any) {
            if (error.code !== 'ESRCH') {
                Log.error(`killInpipeThread: ${error}`);
            }
        }
    }
};

const killOutpipeThread = () => {
    outpipeThread?.send({type: 'STOP'});
    outpipeThread?.kill('SIGINT');
    const outpipeThreadPID = outpipeThread?.pid;
    if (outpipeThreadPID && outpipeThreadPID > 0) {

        try {
            process.kill(outpipeThreadPID, 'SIGHUP');
        } catch (error: any) {
            if (error.code !== 'ESRCH') {
                Log.error(`killOutpipeThread: ${error}`);
            }
        }
    }
};

const startInpipeHandler = () => {
    inpipeThread = fork(__dirname + '/InpipeHandler');

    inpipeThread.on('message', (message: IPCMessage) => {
        switch (message.type) {
            case 'pipeError':
                clearTimeout(refreshInfoTimeOut);
                Log.warn('Reopening inpipe');
                break;
            default:
                break;
        }
    });

    inpipeThread.on('exit', () => {
        if (shutdown) return;
        Log.warn('Restarting InpipeHandler');
        setTimeout(() => {
            startInpipeHandler();
        }, 2500)
    });

    inpipeThread.on('error', (error) => {
        Log.error(`InpipeHandler error: ${error}`);
    });

    inpipeThread.on('spawn', () => {
        sendMessage({type: 'START'});
        Log.info('Pinging PZ Server');
        sendMessage({type: 'COMMAND', payload: {command: 'ping'}});
    });
};

const refreshInfo = () => {
    clearTimeout(refreshInfoTimeOut);
    sendMessage({type: 'COMMAND', payload: {command: 'info'}});
    refreshInfoTimeOut = setTimeout(refreshInfo, 1000);
};

const startOutpipeHandler = () => {
    outpipeThread = fork(__dirname + '/OutpipeHandler');

    outpipeThread.on('message', async (message: IPCMessage) => {
        switch (message.type) {
            case 'data':
                let payload;
                try {
                    payload = JSON.parse(message.payload);
                } catch (error) {
                    Log.error(`outpipe.on.message: json: ${error}`);
                    return;
                }
                const newServerData = payload.data as PZServerData;

                switch (payload.type) {
                    case 'info':
                        if (!serverData) {
                            serverData = newServerData;
                        } else {
                            serverData.players = newServerData.players;
                            serverData.game_time = newServerData.game_time;
                        }
                        lastUpdated = new Date();
                        break;
                    case 'pong':
                        serverIsUp = true;
                        Log.info('PZ Server connected');
                        refreshInfo();
                        break;
                    case 'playerDied':
                        Log.info(`Player ${payload.data.username} died`);
                        await PlayerDBHelper.markDead(payload.data);
                        break
                    case 'players':
                        await PlayerDBHelper.upsertPlayers(payload.data);
                }
                break;
            default:
            case 'log':
                Log.info(message.payload);
                break;
        }
    });

    outpipeThread.on('error', (error) => {
        Log.error(`OutpipeHandler error: ${error}`);
    });

    outpipeThread.on('exit', () => {
        if (shutdown) return;
        Log.warn('Restarting OutpipeHandler');
        setTimeout(() => {
            startOutpipeHandler();
        }, 2500)
    });

    outpipeThread.on('spawn', () => {
        outpipeThread?.send({type: 'START'});
    });
};

const makeInfo = async (): Promise<PZInfo> => {
    return {
        data: serverData,
        lastUpdated,
        status: ServerStatus.UP ? serverIsUp : ServerStatus.DOWN,
    } as PZInfo
}

const startExpress = () => {
    app.use(express.json({limit: '50mb'}));
    app.use(express.urlencoded({extended: true}));
    app.use(compression());
    app.use(cors({origin: '*'}));
    app.use(handleAuth);

    app.get("/info", async (req: Request, res: Response): Promise<Response> => {
        try {
            const info = await makeInfo();
            return res.status(200).send(info);
        } catch (error) {
            Log.error(`POST /info: ${error}`)
            return res.status(500).send({error});
        }
    });

    app.get("/player/:username", async (req: Request, res: Response): Promise<Response> => {
        try {
            const player = await PlayerDBHelper.getPlayer(req.params.username)
            if (player === undefined) {
                return res.status(404).send({error: "NOT_FOUND"})
            }
            return res.status(200).send({player})
        } catch (error) {
            Log.error(`GET ${req.path}: ${error}`)
            return res.status(500).send({error})
        }
    })


    app.post("/rcon", async (req: Request, res: Response): Promise<Response> => {
        const {command, args} = req.body as RCONCommand;
        try {
            Log.debug(`executing rcon command ${command} params:\n${JSON.stringify(args, null, 2)}`);
            const response = await RCONHelper.send(command, args);
            return res.status(200).send({response} as RCONResponse);
        } catch (error) {
            Log.error(`POST /rcon (${command}): ${error}`);
            return res.status(500).send({command, error});
        }
    });

    app.listen(expressPort, () => {
        Log.info(`Express accepting connections on port ${expressPort}`);
    });
};

const startWebsocketServer = () => {
    const server = http.createServer(app);
    const io = new Server(server);

    io.on("connection", (socket: Socket) => {
        Log.info(`New websocket connection: ${socket?.handshake?.address}`);

        const timer = setInterval(async () => {
            const info = await makeInfo();
            socket.send('info', info);
        }, 1000);

        socket.on("disconnect", () => {
            Log.warn(`websocket connection lost: ${socket?.handshake?.address}`);
            clearInterval(timer);
        })
    });

    io.listen(websocketPort);
    Log.info(`Socket server started. Listing on port ${websocketPort}`);
};

const exitHandler = async () => {
    Log.info('\nShutting down PZ Stories Server');
    shutdown = true;
    RCONHelper.shutdown = true;
    await RCONHelper.stopRCONClient();
    killInpipeThread();
    killOutpipeThread();
    process.exit(0);
}

process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

(async () => {
    try {
        Log.info('Booting PZ Stories Command and Control Server');

        if (process.env.DEBUG) {
            Log.debug('Debug mode active');
        }

        Log.info('Initiating SQLite3 Database');
        await PlayerDBHelper.init();

        Log.info('Starting OutpipeHandler'); // messages comming out of PZ server
        startOutpipeHandler();

        Log.info('Starting InpipeHandler'); // messages going into PZ server
        startInpipeHandler();

        Log.info('Starting express server');
        startExpress();

        Log.info('Starting websocket server');
        startWebsocketServer();

        Log.info('Starting RCON Client');
        await RCONHelper.startRCONClient();
    } catch (error: any) {
        Log.error(`Error occured: ${error}`);
    }
})();
