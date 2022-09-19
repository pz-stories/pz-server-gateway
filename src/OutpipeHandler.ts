import { readFileSync } from "fs";
import { IPCMessage } from "./Interfaces";
import os from 'os';

if(!process.env.OUTPIPE_FILE_NAME && !process.env.DEBUG) {
    throw 'MISSING OUTPIPE_FILE_NAME ENV VAR';
}

const outpipeFilePath = process.env.OUTPIPE_FILE_NAME ? process.env.OUTPIPE_FILE_NAME : `${os.homedir()}/Zomboid/mods/BrainSlug/outpipe`;
let running = true;

const delay = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const readLine = () => {
    try {
        const data = readFileSync(outpipeFilePath, 'utf-8');
        if(data) {
            (process as any).send({ type: 'data', payload: data } as IPCMessage);
        }
    } catch (error) {
        console.log(error);
        delay(1000);
        (process as any).send('Reopening outpipe');
    }
};

process.on('message', (message: IPCMessage) => {
    const { type } = message;
    switch(type) {
        case 'START':
            (process as any).send({ type: 'log', payload: `Reading lines` } as IPCMessage);
            while(running) {
                readLine();
            }
            break;
        case 'STOP':
            running = false;
            break;
        default:
            break
    }
});
