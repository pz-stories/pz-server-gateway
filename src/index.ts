import express, { Application, Request, Response } from "express";
import cors from 'cors';
import compression from "compression";
import { Server, Socket } from "socket.io";
import { ChildProcess, fork } from 'child_process';
import http from 'http';
import { PlayerDBHelper } from "./PlayerDBHelper";
import { Command, IPCMessage, PZInfo, PZPlayer, PZServerData, RCONCommand, RCONResponse } from "./Interfaces";
import { handleAuth } from "./Auth";
import { RCONHelper } from "./RCONHelper";
import { Log } from "./Log";

let inpipeThread: ChildProcess | undefined;
let outpipeThread: ChildProcess | undefined;
let serverData: PZServerData;
let lastUpdated: Date;
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
    if(inppipeThreadPID && inppipeThreadPID > 0) {
        try {
            process.kill(inppipeThreadPID, 'SIGHUP');
        } catch (error: any) {
            if(error.code !== 'ESRCH') {
                Log.error(error);
            }
        }
    }
};

const killOutpipeThread = () => {
    outpipeThread?.send({ type: 'STOP' });
    outpipeThread?.kill('SIGINT');
    const outpipeThreadPID = outpipeThread?.pid;
    if(outpipeThreadPID && outpipeThreadPID > 0) {
        
        try {
            process.kill(outpipeThreadPID, 'SIGHUP');
        } catch (error: any) {
            if(error.code !== 'ESRCH') {
                Log.error(error);
            }
        }
    }
};

const startInpipeHandler = () => {
    inpipeThread = fork(__dirname + '/InpipeHandler');

    inpipeThread.on('message', (message: IPCMessage) => {
        switch(message.type) {
            case 'pipeError':
                clearTimeout(refreshInfoTimeOut);
                Log.warn('Reopening inpipe');
                break;
            default:
                break;
        }
    });

    inpipeThread.on('exit', () => {
        if(shutdown) return;
        Log.warn('Restarting InpipeHandler');
        setTimeout(() => {
            startInpipeHandler();
        }, 2500)
    });

    inpipeThread.on('error', (error) => {
        Log.error(`InpipeHandler error: ${error}`);
    });
    
    inpipeThread.on('spawn', () => {
        sendMessage({ type: 'START' });
        Log.info('Pinging PZ Server');
        sendMessage({ type: 'COMMAND', payload: { command: 'ping' } });
    });
};

const refreshInfo = () => {
    clearTimeout(refreshInfoTimeOut);
    sendMessage({ type: 'COMMAND', payload: { command: 'info' } });
    refreshInfoTimeOut = setTimeout(refreshInfo, 1000);
};

const startOutpipeHandler = () => {
    outpipeThread = fork(__dirname + '/OutpipeHandler');

    outpipeThread.on('message', async (message: IPCMessage) => {
        switch(message.type) {
            case 'data':
                let payload;
                try {
                    payload = JSON.parse(message.payload);
                } catch (error) {
                    Log.error(error);
                    return;
                }
                const newServerData = payload.data as PZServerData;

                switch(payload.type) {
                    case 'info': 
                        if(!serverData) {
                            serverData = newServerData;
                        } else {
                            serverData.players = newServerData.players;
                            serverData.safeHouses = newServerData.safeHouses;
                            serverData.game = {
                                ...serverData.game,
                                ...newServerData.game
                            };
                        }
                        if(serverData?.players) {
                            PlayerDBHelper.upsertPlayers(serverData.players);
                            lastUpdated = new Date();
                        }
                        break;
                    case 'pong':
                        if(!serverData) {
                            serverData = newServerData;
                        } else {
                            serverData.server = {
                                ...serverData.server,
                                ...newServerData.server
                            };
                            serverData.game = {
                                ...serverData.game,
                                ...newServerData.game
                            };
                        }
                        Log.info('PZ Server connected');
                        refreshInfo();                    
                        break;
                    case 'zombieDied':
                        Log.info('Zombie died');
                        break;
                    case 'playerDied':
                        Log.info(`Player ${payload.data.username} died`);
                        break;
                    case 'playerConnected':
                        Log.info(`Player ${payload.data.username} connected`);
                        break;
                    case 'playerDisconnected':
                        Log.info(`Player ${payload.data.username} disconnected`);
                        break;
                    case 'log':
                        Log.info(payload.data);
                        break;
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
        if(shutdown) return;
        Log.warn('Restarting OutpipeHandler');
        setTimeout(() => {
            startOutpipeHandler();
        }, 2500)
    });

    outpipeThread.on('spawn', () => {
        outpipeThread?.send({ type: 'START' });
    });
};

const makeInfo = async (): Promise<PZInfo> => {
    if(!serverData) return {} as PZInfo;

    const cachedPlayers = new Array<PZPlayer>();
    const finalPlayers = new Array<PZPlayer>();
    const savedPlayers = await PlayerDBHelper.getPlayers();

    for(let savedPlayer of savedPlayers) {
        let onlinePlayer = serverData.players?.find((onlinePlayer: any) => onlinePlayer.username === savedPlayer.username);
        let cachedPlayer;
        if(onlinePlayer) {
            cachedPlayer = {
                ...onlinePlayer,
                online: true,
                lastSeen: new Date()
            } as PZPlayer;
        } else {
            cachedPlayer = {
                ...savedPlayer,
                online: false
            } as PZPlayer;
        }
        cachedPlayers.push(cachedPlayer);
    }

    const pzSavedPlayers = await PlayerDBHelper.getPZPlayers();

    for(const cachedPlayer of cachedPlayers) {
        let finalPlayer = {
            id: -1,
            ...cachedPlayer,
            isDead: false
        } as PZPlayer;

        const pzSavedPlayer = pzSavedPlayers.find((pzSavedPlayer: any) => pzSavedPlayer.username === cachedPlayer.username);

        if(pzSavedPlayer) {
            finalPlayer.id = pzSavedPlayer.id;
            finalPlayer.isDead = pzSavedPlayer.isDead !== 0;
        }

        finalPlayers.push(finalPlayer);
    }

    return {
        data: { 
            ...serverData,
            players: finalPlayers
        } as PZServerData,
        lastUpdated
    } as PZInfo;
}

const startExpress = () => {
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(compression());
    app.use(cors({ origin: '*' }));
    app.use(handleAuth);

    app.get("/info", async (req: Request, res: Response): Promise<Response> => {
        try {
            const info = await makeInfo();
            return res.status(200).send(info);
        } catch (error) {
            Log.error(error)
            return res.status(500).send(error);
        }
    });

    app.post("/command", async (req: Request, res: Response): Promise<Response> => {
        const { command, payload } = req.body  as Command;
        try {
            Log.debug(`executing command ${command} params:\n${JSON.stringify(payload, null, 2)}`);
            sendMessage({ type: 'COMMAND', payload: { command, payload } });
            // Just post back command for verification
            return res.status(200).send({ type: 'COMMAND', payload: { command, payload } as Command });
        } catch (error) {
            return res.status(500).send({ type: 'COMMAND', payload: { command, payload } as Command, error });
        }
    });

    app.post("/rcon", async (req: Request, res: Response): Promise<Response> => {
        const { command, args } = req.body as RCONCommand;
        try {
            Log.debug(`executing rcon command ${command} params:\n${JSON.stringify(args, null, 2)}`);
            const response = await RCONHelper.send(command, args);
            return res.status(200).send({ response } as RCONResponse);
        } catch (error) {
            return res.status(500).send({ command, args } as RCONCommand);
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

        socket.on("command", (data) => {
            const { command, payload } = data;
            try {
                Log.debug(`executing websocket command ${command} params:\n${JSON.stringify(payload, null, 2)}`);
                sendMessage({ type: 'COMMAND', payload: { command, payload } });
            } catch (error) {
                socket.send('command-error', error);
            }
        });

        socket.on("rcon", async (data) => {
            const { command, args } = data;
            try {
                Log.debug(`executing websocket rcon command ${command} params:\n${JSON.stringify(args, null, 2)}`);
                const response = await RCONHelper.send(command, args);
                socket.send('rcon-response', { response } as RCONResponse);
            } catch (error) {
                socket.send('rcon-error', error);
            }
        });

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
    Log.info('\nSchutting down BrainSlug Server');
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
        Log.info('Booting BrainSlug Command and Control Server');

        if(process.env.DEBUG) {
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
