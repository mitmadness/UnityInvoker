import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as pify from 'pify';
import { SimpleLogger } from './logger';
import { IUnityOptions } from './unity_cli_options';
import { getUnityPath } from './unity_finder';

export async function runUnityProcess(options: IUnityOptions, logger: SimpleLogger): Promise<string> {

    //=> Check if the project path exists.
    if (!!options.projectPath)
    {
        await fs.promises.readdir(options.projectPath);
    }

    //=> Check if unity executable exists.
    const unityPath = await getUnityPath();
    await fs.promises.access(unityPath);

    //=> Generating an argv array from the arguments object
    const argv = toArgv(options);

    //=> Spawn Unity process
    const unityProcess = spawn(unityPath, argv);

    //=> Watch process' stdout to log in real time, and keep the complete output in case of crash
    let stdoutAggregator = '';
    function stdoutHandler(buffer: Buffer) {
        const message = buffer.toString();
        stdoutAggregator += message;
        logger(message.trim());
    }

    unityProcess.stdout.on('data', stdoutHandler);
    unityProcess.stderr.on('data', stdoutHandler);

    //=> Watch for the process to terminate, check return code
    return new Promise<string>((resolve, reject) => {
        unityProcess.once('close', async (close) => {
            if (close === 0) {
                resolve(stdoutAggregator);
            } else {
                const crashPath = await logUnityCrash(stdoutAggregator);
                reject(new UnityCrashError(
                    `Unity process crashed! Editor log has been written to ${crashPath}`,
                    stdoutAggregator
                ));
            }
        });
    });
}

export function toArgv(options: IUnityOptions): string[] {
    const argv: string[] = [];

    Object.keys(options).forEach((key) => {
        const value = options[key];

        //=> Pass on false, null, undefined, etc (disabled flags).
        if (!value) { return; }

        //=> Enabled flags + options with value(s)
        argv.push(`-${key}`);

        //=> Options with value(s)
        if (Array.isArray(value)) {
            const values = value as string[];
            values.forEach(v => argv.push(v));
        } else if (typeof value !== 'boolean') {
            argv.push(value);
        }
    });

    return argv;
}

async function logUnityCrash(unityLog: string): Promise<string> {
    const crashPath = path.join(os.tmpdir(), 'unity_crash.abcompiler.log');

    await pify(fs.writeFile)(crashPath, unityLog);

    return crashPath;
}

export class UnityCrashError extends Error {
    constructor(message: string, public readonly unityLog: string) {
        super(message);
        Object.setPrototypeOf(this, UnityCrashError.prototype);
    }
}
