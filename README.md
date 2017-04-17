# UnityInvoker

_Unity Invoker_ is a small library that lets you create Unity processes (in order to do batch processing, builds, etc) easily and without the pain it usually brings.

----------------

 - [Installation & Usage](#installation--usage)
 - [API](#api)
 - Notes:
   [Error handling](#error-handling), [Changing Unity's executable path](#changing-unitys-executable-path), [Unity activation](#unity-activation)

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

## :link: API

To do.

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
