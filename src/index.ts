import * as logger from './logger';
import { IUnityOptions } from './unity_cli_options';
import { UnityProcess } from './unity_process';

export { IUnityOptions } from './unity_cli_options';
export * from './unity_finder';
export { LinuxPlayerArch, OSXPlayerArch, WindowsPlayerArch, RendererType } from './unity_process';
export { UnityCrashError } from './unity_invoker';
export { logger };

export function invokeUnity(options: IUnityOptions = {}): UnityProcess {
    return new UnityProcess().withOptions(options);
}

export function invokeHeadlessUnity(options: IUnityOptions = {}): UnityProcess {
    return invokeUnity(options).logFile(null).batchmode().noGraphics().quit();
}
