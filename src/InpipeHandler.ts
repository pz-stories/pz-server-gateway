import { closeSync, openSync, writeFileSync } from "fs";
import { Command, IPCMessage } from "./Interfaces";
import os from 'os';

if(!process.env.INPIPE_FILE_NAME && !process.env.DEBUG) {
    throw 'MISSING INPIPE_FILE_NAME ENV VAR';
}

const inpipeFilePath = process.env.INPIPE_FILE_NAME ? process.env.INPIPE_FILE_NAME : `${os.homedir()}/Zomboid/mods/BrainSlug/inpipe`;
let writeInpipeFd: number;

const openInpipe = () => {
    writeInpipeFd = openSync(inpipeFilePath, 'w');
};

const sendCommand = (message: Command) => {
    try {
        writeFileSync(writeInpipeFd, JSON.stringify(message) + '\n');
        closeSync(writeInpipeFd);
        openInpipe();
    } catch (error) {
        (process as any).send({ type: 'pipeError' } as IPCMessage);
        if(writeInpipeFd) {
            closeSync(writeInpipeFd);
        }
        openInpipe();
    }
};

process.on('message', (message: IPCMessage) => {
    const { type, payload } = message;
    switch(type) {
        case 'START':
            openInpipe();
            break;
        case 'COMMAND':
            sendCommand(payload);
            break;
        default:
            break;
    }
});
