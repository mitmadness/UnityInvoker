export type Flag = boolean;

export type BuildTarget =
    'win32' | 'win64' | 'osx' | 'linux' | 'linux64' | 'ios' | 'android' | 'web' | 'webstreamed' |
    'webgl' | 'xboxone' | 'ps4' | 'psp2' | 'wsaplayer' | 'tizen' | 'samsungtv' | string;

export interface IUnityOptions {
    [customOption: string]: Flag | string | string[] | undefined;

    batchmode?: Flag;

    buildLinux32Player?: string;

    buildLinux64Player?: string;

    buildLinuxUniversalPlayer?: string;

    buildOSXPlayer?: string;

    buildOSX64Player?: string;

    buildOSXUniversalPlayer?: string;

    buildTarget?: BuildTarget | string;

    buildWindowsPlayer?: string;

    buildWindows64Player?: string;

    cleanedLogFile?: Flag;

    createProject?: string;

    editorTestsCategories?: string;

    editorTestsFilter?: string;

    editorTestsResultFile?: string;

    executeMethod?: string;

    exportPackage?: string;

    'force-d3d9'?: Flag;

    'force-d3d11'?: Flag;

    'force-glcore'?: Flag;

    'force-glcore32'?: Flag;

    'force-glcore33'?: Flag;

    'force-glcore40'?: Flag;

    'force-glcore41'?: Flag;

    'force-glcore42'?: Flag;

    'force-glcore43'?: Flag;

    'force-glcore44'?: Flag;

    'force-glcore45'?: Flag;

    'force-gles'?: Flag;

    'force-gles30'?: Flag;

    'force-gles31'?: Flag;

    'force-gles32'?: Flag;

    'force-clamped'?: Flag;

    'force-free'?: Flag;

    importPackage?: string;

    logFile?: string | Flag;

    nographics?: Flag;

    password?: string;

    projectPath?: string;

    quit?: Flag;

    returnlicense?: Flag;

    runEditorTests?: Flag;

    serial?: string;

    'silent-crashes'?: Flag;

    username?: string;

    'disable-assembly-updater'?: Flag | string[];
}
