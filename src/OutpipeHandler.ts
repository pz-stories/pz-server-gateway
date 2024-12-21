// import { readFileSync } from "fs";
import {IPCMessage} from "./Interfaces";
import os from 'os';
import {Log} from "./Log";
import * as fs from "node:fs";

if (!process.env.OUTPIPE_FILE_NAME && !process.env.DEBUG) {
    throw 'MISSING OUTPIPE_FILE_NAME ENV VAR';
}

const outpipeFilePath = process.env.OUTPIPE_FILE_NAME ? process.env.OUTPIPE_FILE_NAME : `${os.homedir()}/Zomboid/mods/BrainSlug/outpipe`;
let running = true;
let watcher: fs.FSWatcher;

const delay = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const readLine = () => {
    // try {
    Log.info("start fs watch");
    watcher = fs.watch(outpipeFilePath, (eventType, filename) => {
        if (filename) {
            try {
                const data = fs.readFileSync(outpipeFilePath, 'utf-8');
                if (data) {
                    (process as any).send({type: 'data', payload: data} as IPCMessage);
                }
            } catch (error) {
                Log.error(`Outpipe.readLine: ${error}`);
                delay(1000);
                (process as any).send('Reopening outpipe');
            }
        }
    })
};

process.on('message', (message: IPCMessage) => {
    const {type} = message;
    switch (type) {
        case 'START':
            (process as any).send({type: 'log', payload: `OUTPIPE: Reading lines`} as IPCMessage);
            readLine();
            break;
        case 'STOP':
            running = false;
            watcher.close()
            break;
        default:
            break
    }
});
