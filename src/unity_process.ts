import { noopLogger, SimpleLogger } from './logger';
import { BuildTarget, IUnityOptions } from './unity_cli_options';
import { runUnityProcess } from './unity_invoker';

export enum LinuxPlayerArch { x86, x64, Universal }

export enum OSXPlayerArch { x86, x64, Universal }

export enum WindowsPlayerArch { x86, x64 }

export enum RendererType {
    /**
     * Make the Editor use Direct3D 9 or 11 for rendering.
     * Normally the graphics API depends on player settings (typically defaults to D3D11).
     */
    Direct3D,

    /**
     * Make the Editor use OpenGL 3/4 core profile for rendering.
     * If the platform isn’t supported, Direct3D is used.
     */
    OpenGLCore,

    /**
     * Make the Editor use OpenGL for Embedded Systems for rendering.
     */
    OpenGLES
}

export type RendererVersion = number;

export class UnityProcess {
    private processOptions: IUnityOptions = {};

    /**
     * Set Unity CLI options by hand, without using the fluent methods.
     */
    public withOptions(options: IUnityOptions): this {
        Object.assign(this.processOptions, options);

        return this;
    }

    /**
     * Run Unity in batch mode.
     * This should always be used in conjunction with the other command line arguments, because it ensures no pop-up
     * windows appear and eliminates the need for any human intervention. When an exception occurs during execution of
     * the script code, the Asset server updates fail, or other operations that fail, Unity immediately exits with
     * return code 1.
     * Note that in batch mode, Unity sends a minimal version of its log output to the console.
     * However, the Log Files still contain the full log information. Opening a project in batch mode while the Editor
     * has the same project open is not supported; only a single instance of Unity can run at a time.
     */
    public batchmode(enabled: boolean = true): this {
        this.processOptions.batchmode = enabled;

        return this;
    }

    /**
     * Build a standalone Linux player.
     */
    public buildLinuxPlayer(arch: LinuxPlayerArch, path: string): this {
        let prop: keyof IUnityOptions;
        switch (arch) {
            case LinuxPlayerArch.x86: prop = 'buildLinux32Player'; break;
            case LinuxPlayerArch.x64: prop = 'buildLinux64Player'; break;
            case LinuxPlayerArch.Universal: prop = 'buildLinuxUniversalPlayer'; break;
            default: throw new Error(`Invalid Linux architecture: ${arch}.`);
        }

        this.processOptions[prop] = path;

        return this;
    }

    /**
     * Build a standalone Mac OSX player.
     */
    public buildOSXPlayer(arch: OSXPlayerArch, path: string): this {
        let prop: keyof IUnityOptions;
        switch (arch) {
            case OSXPlayerArch.x86: prop = 'buildOSXPlayer'; break;
            case OSXPlayerArch.x64: prop = 'buildOSX64Player'; break;
            case OSXPlayerArch.Universal: prop = 'buildOSXUniversalPlayer'; break;
            default: throw new Error(`Invalid OSX architecture: ${arch}.`);
        }

        this.processOptions[prop] = path;

        return this;
    }

    /**
     * Allows the selection of an active build target before a project is loaded.
     * Possible options are: win32, win64, osx, linux, linux64, ios, android, web, webstreamed, webgl, xboxone, ps4,
     * psp2, wsaplayer, tizen, samsungtv.
     */
    public buildTarget(name: BuildTarget): this {
        this.processOptions.buildTarget = name;

        return this;
    }

    /**
     * Build a standalone Windows player.
     */
    public buildWindowsPlayer(arch: WindowsPlayerArch, path: string): this {
        let prop: keyof IUnityOptions;
        switch (arch) {
            case WindowsPlayerArch.x86: prop = 'buildWindowsPlayer'; break;
            case WindowsPlayerArch.x64: prop = 'buildWindows64Player'; break;
            default: throw new Error(`Invalid Windows architecture: ${arch}.`);
        }

        this.processOptions[prop] = path;

        return this;
    }

    /**
     * Detailed debugging feature. StackTraceLogging allows features to be controlled to allow detailed logging.
     * All settings allow None, Script Only and Full to be selected.
     */
    public cleanedLogFile(enabled: boolean = true): this {
        this.processOptions.cleanedLogFile = enabled;

        return this;
    }

    /**
     * Create an empty project at the given path.
     */
    public createProject(projectPath: string): this {
        this.processOptions.createProject = projectPath;

        return this;
    }

    /**
     * Filter editor tests by categories.
     */
    public editorTestsCategories(...categories: string[]): this {
        this.processOptions.editorTestsCategories = categories.join(',');

        return this;
    }

    /**
     * Filter editor tests by names.
     */
    public editorTestsFilter(...filteredTestsNames: string[]): this {
        this.processOptions.editorTestsFilter = filteredTestsNames.join(',');

        return this;
    }

    /**
     * Path where the result file should be placed. If the path is a folder, a default file name is used.
     * If not specified, the results are placed in the project’s root folder.
     */
    public editorTestsResultFile(filePath: string): this {
        this.processOptions.editorTestsResultFile = filePath;

        return this;
    }

    /**
     * Execute the static method as soon as Unity is started, the project is open and after the optional Asset server
     * update has been performed. This can be used to do tasks such as continous integration, performing Unit Tests,
     * making builds or preparing data.
     * To return an error from the command line process, either throw an exception which causes Unity to exit with
     * return code 1, or call EditorApplication.Exit with a non-zero return code.
     * To pass parameters, add them to the command line and retrieve them inside the function using
     * System.Environment.GetCommandLineArgs.
     * To use -executeMethod, you need to place the enclosing script in an Editor folder. The method to be executed
     * must be defined as static.
     */
    public executeMethod(staticMethodPath: string): this {
        this.processOptions.executeMethod = staticMethodPath;

        return this;
    }

    /**
     * Export a package, given a path (or set of given paths).
     * In this example exportAssetPath is a folder (relative to to the Unity project root) to export from the Unity
     * project, and exportFileName is the package name.
     * Currently, this option only exports whole folders at a time.
     * This command normally needs to be used with the -projectPath argument.
     */
    public exportPackage(
        { folderPaths, packageFilePath }: { folderPaths: string[], packageFilePath: string }
    ): this {
        this.processOptions.exportPackage = folderPaths.concat([packageFilePath]).join(' ');

        return this;
    }

    /**
     * Sets the renderer used by the Editor for rendering.
     */
    public useRenderer(type: RendererType, version?: RendererVersion): this {
        let prop: keyof IUnityOptions;
        switch (type) {
            case RendererType.Direct3D: prop = 'force-d3d'; break;
            case RendererType.OpenGLCore: prop = 'force-glcore'; break;
            case RendererType.OpenGLES: prop = 'force-gles'; break;
            default: throw new Error(`Invalid renderer type: ${type}.`);
        }

        this.processOptions[`${prop}${version || ''}`] = true;

        return this;
    }

    /**
     * Used with useRenderer(Renderer.OpenGLCore, version) to prevent checking for additional OpenGL extensions,
     * allowing it to run between platforms with the same code paths.
     */
    public forceClamped(enabled: boolean): this {
        this.processOptions['force-clamped'] = enabled;

        return this;
    }

    /**
     * Make the Editor run as if there is a free Unity license on the machine, even if a Unity Pro license is installed.
     */
    public forceFree(enabled: boolean): this {
        this.processOptions['force-free'] = enabled;

        return this;
    }

    /**
     * Import the given package. No import dialog is shown.
     */
    public importPackage(packageFilePath: string): this {
        this.processOptions.importPackage = packageFilePath;

        return this;
    }

    /**
     * Specify where the Editor or Windows/Linux/OSX standalone log file are written.
     * Pass null to make UnityInvoker catch Unity's logs.
     */
    public logFile(logFilePath: string | null): this {
        this.processOptions.logFile = logFilePath === null ? true : logFilePath;

        return this;
    }

    /**
     * When running in batch mode, do not initialize the graphics device at all.
     * This makes it possible to run your automated workflows on machines that don’t even have a GPU (automated
     * workflows only work when you have a window in focus, otherwise you can’t send simulated input commands).
     * lease note that noGraphics() does not allow you to bake GI on OSX, since Enlighten requires GPU acceleration.
     */
    public noGraphics(enabled: boolean = true): this {
        this.processOptions.nographics = enabled;

        return this;
    }

    /**
     * The password of the user.
     */
    public password(password: string): this {
        this.processOptions.password = password;

        return this;
    }

    /**
     * Open the project at the given path.
     */
    public projectPath(projectPath: string): this {
        this.processOptions.projectPath = projectPath;

        return this;
    }

    /**
     * Quit the Unity Editor after other commands have finished executing.
     * Note that this can cause error messages to be hidden (however, they still appear in the editor logs).
     */
    public quit(enabled: boolean = true): this {
        this.processOptions.quit = enabled;

        return this;
    }

    /**
     * Return the currently active license to the license server.
     * Please allow a few seconds before the license file is removed, because Unity needs to communicate with the
     * license server.
     */
    public returnLicense(enabled: boolean = true): this {
        this.processOptions.quit = enabled;

        return this;
    }

    /**
     * Run Editor tests from the project.
     * This argument requires the projectPath(), and it’s good practice to run it with batchmode().
     * quit() is not required, because the Editor automatically closes down after the run is finished.
     */
    public runEditorTests(): this {
        this.processOptions.runEditorTests = true;

        return this;
    }

    /**
     * Activate Unity with the specified serial key.
     * It is good practice to pass the batchmode() and quit() as well, in order to quit Unity when done, if using this
     * for automated activation of Unity.
     * Please allow a few seconds before the license file is created, because Unity needs to communicate with the
     * license server.
     * Make sure that license file folder exists, and has appropriate permissions before running Unity with this
     * argument.
     * If activation fails, see the editor's log for info.
     */
    public serial(serial: string): this {
        this.processOptions.serial = serial;

        return this;
    }

    /**
     * Don’t display a crash dialog.
     */
    public silentCrashes(enabled: boolean = true): this {
        this.processOptions['silent-crashes'] = enabled;

        return this;
    }

    /**
     * Enter a username into the log-in form during activation of the Unity Editor.
     */
    public username(username: string): this {
        this.processOptions.username = username;

        return this;
    }

    /**
     * Pass all assemblies updates.
     * See also disableAssemblyUpdaterFor() to ignore only specific assemblies.
     */
    public disableAssemblyUpdater(enabled: boolean = true): this {
        this.processOptions['disable-assembly-updater'] = enabled;

        return this;
    }

    /**
     * Specify a list of assembly names as parameters for Unity to ignore on automatic updates.
     */
    public disableAssemblyUpdaterFor(...assemblyPaths: string[]): this {
        this.processOptions['disable-assembly-updater'] = assemblyPaths;

        return this;
    }

    /**
     * Launch Unity with given options, terminates the fluent calls chain by returning a Promise.
     * Resolves with Unity's stdout log (only if logFile(null) has been called).
     */
    public run(logger: SimpleLogger = noopLogger): Promise<string> {
        return runUnityProcess(this.processOptions, logger);
    }
}
