# UnityInvoker [![npm version](https://img.shields.io/npm/v/@mitm/unityinvoker.svg?style=flat-square)](https://www.npmjs.com/package/@mitm/unityinvoker) ![license](https://img.shields.io/github/license/mitmadness/UnityInvoker.svg?style=flat-square) [![Travis Build](https://img.shields.io/travis/mitmadness/UnityInvoker.svg?style=flat-square)](https://travis-ci.org/mitmadness/UnityInvoker)

_Unity Invoker_ is a small library that lets you create Unity processes (in order to do batch processing, builds, etc) easily.

----------------

 - [Installation & Usage](#installation--usage)
 - [Simple, fluent API](#link-simple-fluent-api)
 - Notes:
   [Error handling](#error-handling), [Changing Unity's executable path](#changing-unitys-executable-path), [Unity activation](#unity-activation)

```typescript
import { invokeHeadlessUnity } from '@mitm/unityinvoker';

await invokeHeadlessUnity()
    .projectPath(path)
    .executeMethod('MyEditorScript.Run')
    .run(message => console.log(message)); // that's it
```

----------------

## :package: Installation & Usage

**Requirements:**

 - Node.js, version 7 preferred
 - :warning: **An _activated_ installation of Unity on the machine** :warning:
    - If Unity is not installed in the standard path, read [Changing Unity's executable path](#changing-unitys-executable-path)
    - You must activate Unity if not already done, even with a free plan, read [Unity activation](#unity-activation)

Install it via the npm registry:

```
yarn add @mitm/unityinvoker
```

## :link: Simple, fluent API

The API has (almost) an 1:1 mapping with Unity's [Command Line Interface options](https://docs.unity3d.com/Manual/CommandLineArguments.html), meaning that you can refer to these docs and translate the option names into methods... _except for a few cases where Unity's CLI really sucks (sorry)_:

 - The incoherently-named options with a dash like `-force-clamped` are obviously camelized: `forceClamped()` ;
 - Some options were merged into a simple method, ie. `-force-gles32` becomes `useRenderer(RendererType.OpenGLES, 32)` ;
 - Same as before, options like `-buildLinux32Player` and variants are merged in: `buildLinuxPlayer(LinuxPlayerArch.x86, '/path')` (same goes for the other OSes).
 - `-disable-assembly-updater` got two methods: `disableAssemblyUpdater()` and `disableAssemblyUpdaterFor('assembly1.dll', 'assembly2.dll')`.

If you are using an IDE that supports TypeScript declarations, you'll have intellisense and documentation on the methods.

### `invokeUnity()`

The API has two entry points, this one launches a normal Unity instance by default (ie. not in batch mode):

```typescript
import { invokeUnity } from '@mitm/unityinvoker';

// Use run() to launch Unity (breaks the fluent chain by returning a Promise)
await invokeUnity().run();

// You probably always want to tell Unity which project to open:
await invokeUnity().projectPath('/path/to/the/project').run();

// You can pass custom options too:
await invokeUnity({
    'my-custom-option': 'value'
}).withOptions({ 'or-using-withOptions': true }).run();

// You can watch Unity's log in real time, but you have to tell Unity to not use it's famous Editor.log file:
await invokeUnity().logFile(null).run(message => console.log(message));
```

### `invokeHeadlessUnity()`

This entry point is probably the one you're looking for, it provides an Unity instance with `.logFile(null).batchmode().noGraphics().quit()`.

```typescript
import {
    invokeHeadlessUnity,
    LinuxPlayerArch, OSXPlayerArch, WindowsPlayerArch,
    RendererType
} from '@mitm/unityinvoker';

// No need for logFile(null) to have realtime logs anymore:
await invokeHeadlessUnity().run(message => console.log(message));

// All methods (except batchmode, logFile, noGraphics, quit, that are enabled in headless mode)
await invokeHeadlessUnity()
    .withOptions({ 'my-option': true })
    .buildLinuxPlayer(LinuxPlayerArch.Universal, '/path/to/project')
    .buildOSXPlayer(OSXPlayerArch.Universal, '/path/to/project')
    .buildTarget('linux64')
    .buildWindowsPlayer(WindowsPlayerArch.x64, '/path/to/project')
    .cleanedLogFile()
    .createProject('/path/to/project')
    .editorTestsCategories(...categories)
    .editorTestsFilter(...filteredTestsNames)
    .editorTestsResultFile('/path/to/file')
    .executeMethod('MyEditorScript.Run')
    .exportPackage({
        folderPaths: ['Project/Folder1', 'Project/Folder2'],
        packageFilePath: '/path/to/my.unitypackage'
    })
    .useRenderer(RendererType.OpenGLES, 32)
    .forceClamped()
    .forceFree()
    .importPackage('/path/to/my.unitypackage')
    .password('pa$$w0rd')
    .projectPath('/path/to/the/project/to/open')
    .returnLicense()
    .runEditorTests()
    .serial('MY-SE-RI-AL')
    .silentCrashes()
    .username('me@me.me')
    .disableAssemblyUpdater()
    .disableAssemblyUpdaterFor('Some/Assembly.dll', 'Another/Assembly.dll')
    .run(message => console.log(message));
```

## :bulb: Notes

### Error handling

> What could possibly go wrong?

_UnityInvoker_ will catch abnormal Unity process termination and throw an error in that case.
The error is an instance of `UnityCrashError` (exported on the main module) and its prototype looks like:

```typescript
class UnityCrashError extends Error {
    public readonly message: string; // Exception message
    public readonly unityLog: string; // Unity Editor log (contains crash information)
}
```

The logs will also be dumped to you system temporary folder (ie. /tmp) in a file named `unity_crash.abcompiler.log` (the complete path will be reported in the error's message).

### Changing Unity's executable path

By default, _UnityInvoker_ will try to find Unity's executable on the expected locations. The library will look at the following paths:

 - `/opt/Unity/Editor/Unity` – Debian / Ubuntu [with the official .deb package](https://forum.unity3d.com/threads/unity-on-linux-release-notes-and-known-issues.350256/)
 - `/Applications/Unity/Unity.app/Contents/MacOS/Unity` – MacOS
 - `C:\Program Files (x86)\Unity\Editor\Unity.exe` – Windows, Unity x86
 - `C:\Program Files\Unity\Editor\Unity.exe` – Windows, Unity x64

If you have a custom installation of Unity on a "non-standard" path (ie. you have multiple versions installed), you can tell _UnityInvoker_ where to look:

```typescript
import { setUnityPath } from '@mitm/unityinvoker';

// given that you define the environment variable UNITY_EDITOR_PATH, to avoid hardcoded path:
setUnityPath(process.env.UNITY_EDITOR_PATH);
```

### Unity activation

Unity is a proprietary software that requires to be activated with a valid account, even if that's not necessary for building asset bundles. This library does not handle activation, meaning that you _must_ already have an activated version of Unity on the machine.

**Building asset bundles, does not requires a paid account.** You can log in with your free _Personal_ license.

Activation via Unity's CLI is possible too (for automating installation for example) but is somewhat broken from times to times, and **does not works with personal licenses**. So, given you have a paid accound, you can do:

```
~$ /path/to/Unity -quit -batchmode -serial SB-XXXX-XXXX-XXXX-XXXX-XXXX -username 'JoeBloggs@example.com' -password 'MyPassw0rd'
```
