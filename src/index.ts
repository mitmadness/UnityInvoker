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
    // Unity 2019 and Unity 2020 docs specify that "-" should be use as a value
    // to log directly into stdout and not into a file.
    // Unity 2018 doesn't mention it, but we tested it and it behaves the same way.
    // FIXME: "-" as logFile argument value wasn't tested on Linux and older versions of Unity.
    return invokeUnity(options).logFile('-').batchmode().noGraphics().quit();
}
