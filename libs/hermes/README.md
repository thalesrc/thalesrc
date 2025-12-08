# @thalesrc/hermes

[![npm](https://img.shields.io/npm/v/@thalesrc/hermes.svg)](https://www.npmjs.com/package/@thalesrc/hermes)
[![npm](https://img.shields.io/npm/dw/@thalesrc/hermes.svg)](https://www.npmjs.com/package/@thalesrc/hermes)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Javascript messaging library for cross-context communication

**Part of the [Thalesrc](https://github.com/thalesrc/thalesrc) monorepo**

## Installation

```bash
npm install @thalesrc/hermes
# or
yarn add @thalesrc/hermes
# or
pnpm add @thalesrc/hermes
```

## Overview

Hermes provides a unified, decorator-based API for cross-context messaging in JavaScript applications. Built on RxJS, it supports:

- 🖼️ **Iframe Communication** - Parent-child window messaging
- 🧩 **Chrome Extensions** - Background scripts, content scripts, and popups
- 👷 **Web Workers** - Main thread and worker communication
- 📡 **Broadcast Channel** - Tab-to-tab messaging

## Core Concepts

### MessageClient & MessageHost

The library uses two main abstractions:

- **`MessageClient`**: Sends requests and receives responses (uses `@Request` decorator)
- **`MessageHost`**: Listens for requests and sends responses (uses `@Listen` decorator)
- **`MessageService`**: Combines both client and host (bidirectional communication)

### Decorators

- **`@Request(path)`**: Marks a method as a message sender
- **`@Listen(path)`**: Marks a method as a message listener

## Usage

### Iframe Communication

Send and receive messages between iframes and parent windows.

#### Client-Only (Iframe)

```typescript
import { IframeMessageClient, Request } from '@thalesrc/hermes/iframe';
import { Observable } from 'rxjs';

class IframeClient extends IframeMessageClient {
  @Request('greeting')
  sayHello(name: string): Observable<string> {
    return null; // Implementation handled by decorator
  }
}

// Default: sends messages to parent window
const client = new IframeClient();

// Optional: specify channel name
const clientWithChannel = new IframeClient('my-channel');

// Optional: target specific iframe (from parent window)
const iframe = document.querySelector('iframe');
const clientToIframe = new IframeClient('my-channel', iframe);

// Optional: use a function to get iframe dynamically
const clientWithDynamicIframe = new IframeClient('my-channel', () => 
  document.querySelector('iframe#dynamic')
);

client.sayHello('John').subscribe(response => {
  console.log(response); // 'Hello John!'
});
```

#### Host-Only (Parent Window)

```typescript
import { IframeMessageHost, Listen, UpcomingMessage } from '@thalesrc/hermes/iframe';
import { of } from 'rxjs';

class ParentHost extends IframeMessageHost {
  @Listen('greeting')
  handleGreeting({ data }: UpcomingMessage<string>): Observable<string> {
    return of(`Hello ${data}!`);
  }
}

// Default: listens to all iframes
const host = new ParentHost();

// Optional: specify channel name
const hostWithChannel = new ParentHost('my-channel');

// Optional: listen only to specific iframe
const iframe = document.querySelector('iframe');
const hostForSpecificIframe = new ParentHost('my-channel', iframe);

// Optional: use a function to get iframe dynamically
const hostWithDynamicIframe = new ParentHost('my-channel', () => 
  document.querySelector('iframe#dynamic')
);
```

#### Bidirectional Communication (MessageService)

```typescript
import { IframeMessageService, Request, Listen } from '@thalesrc/hermes/iframe';
import { of, Observable } from 'rxjs';

class IframeBidirectional extends IframeMessageService {
  // Send messages
  @Request('getData')
  requestData(): Observable<any> {
    return null;
  }

  // Receive messages
  @Listen('update')
  handleUpdate(data: any): Observable<string> {
    console.log('Received update:', data);
    return of('Update processed');
  }
}

// Default: communicates with parent window
const service = new IframeBidirectional();

// Optional: specify channel name and target frame
const iframe = document.querySelector('iframe');
const serviceWithTarget = new IframeBidirectional('my-channel', iframe);

// From within iframe (communicates with parent)
const iframeService = new IframeBidirectional('my-channel');
```

---

### Chrome Extensions

Communicate across extension contexts (background, content scripts, popups).

#### Content Script

```typescript
import { ChromeMessageClient, Request } from '@thalesrc/hermes/chrome';
import { Observable } from 'rxjs';

class ContentScript extends ChromeMessageClient {
  @Request('fetchData')
  getData(query: string): Observable<any> {
    return null;
  }

  @Request('saveSettings')
  saveSettings(settings: object): Observable<boolean> {
    return null;
  }
}

const contentScript = new ContentScript();

contentScript.getData('user').subscribe(data => {
  console.log('Received:', data);
});
```

#### Background Script

```typescript
import { ChromeMessageHost, Listen } from '@thalesrc/hermes/chrome';
import { of, Observable } from 'rxjs';

class BackgroundScript extends ChromeMessageHost {
  @Listen('fetchData')
  handleFetchData(query: string): Observable<any> {
    // Fetch from API or storage
    return of({ name: 'John', age: 30 });
  }

  @Listen('saveSettings')
  handleSaveSettings(settings: object): Observable<boolean> {
    // Save to chrome.storage
    return of(true);
  }
}

const background = new BackgroundScript();
```

---

### Web Workers

Communicate between main thread and web workers.

#### Main Thread

```typescript
import { WorkerMessageService, Request, Listen } from '@thalesrc/hermes/worker';
import { of, Observable } from 'rxjs';

class MainThread extends WorkerMessageService {
  @Request('processData')
  sendDataToWorker(data: number[]): Observable<number> {
    return null;
  }

  @Listen('progress')
  handleProgress(percent: number): Observable<void> {
    console.log(`Progress: ${percent}%`);
    return of(void 0);
  }
}

// Must provide Worker instance in main thread
const worker = new Worker('./worker.js');
const mainService = new MainThread(worker);

mainService.sendDataToWorker([1, 2, 3, 4, 5]).subscribe(result => {
  console.log('Worker result:', result);
});
```

#### Worker Thread

```typescript
import { WorkerMessageService, Request, Listen } from '@thalesrc/hermes/worker';
import { of, Observable } from 'rxjs';

class WorkerThread extends WorkerMessageService {
  @Listen('processData')
  handleProcessData(data: number[]): Observable<number> {
    // Heavy computation
    const result = data.reduce((sum, n) => sum + n, 0);
    return of(result);
  }

  @Request('progress')
  reportProgress(percent: number): Observable<void> {
    return null;
  }
}

// Inside worker: no argument needed (uses self)
const workerService = new WorkerThread();
```

---

### Broadcast Channel

Communicate between different tabs/windows of the same origin.

#### Tab 1

```typescript
import { BroadcastMessageService, Request, Listen } from '@thalesrc/hermes/broadcast';
import { of, Observable } from 'rxjs';

class Tab1 extends BroadcastMessageService {
  @Request('sync')
  requestSync(data: any): Observable<string> {
    return null;
  }

  @Listen('notification')
  handleNotification(message: string): Observable<void> {
    console.log('Notification:', message);
    return of(void 0);
  }
}

const tab1 = new Tab1('my-app-channel');

tab1.requestSync({ user: 'John' }).subscribe(response => {
  console.log(response); // 'Sync completed'
});
```

#### Tab 2

```typescript
import { BroadcastMessageService, Request, Listen } from '@thalesrc/hermes/broadcast';
import { of, Observable } from 'rxjs';

class Tab2 extends BroadcastMessageService {
  @Listen('sync')
  handleSync(data: any): Observable<string> {
    console.log('Syncing data:', data);
    return of('Sync completed');
  }

  @Request('notification')
  sendNotification(message: string): Observable<void> {
    return null;
  }
}

const tab2 = new Tab2('my-app-channel');
```

---

## Advanced Features

### Streaming Responses

Return multiple values over time using RxJS operators:

```typescript
import { Listen } from '@thalesrc/hermes/iframe';
import { interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

class StreamingHost extends IframeMessageHost {
  @Listen('countdown')
  handleCountdown(start: number): Observable<number> {
    return interval(1000).pipe(
      map(i => start - i),
      take(start + 1)
    );
  }
}
```

The client receives each value as it's emitted:

```typescript
client.countdown(5).subscribe(
  value => console.log(value), // 5, 4, 3, 2, 1, 0
  error => console.error(error),
  () => console.log('Complete!')
);
```

### Error Handling

```typescript
import { Listen } from '@thalesrc/hermes/iframe';
import { throwError } from 'rxjs';

class ErrorHost extends IframeMessageHost {
  @Listen('riskyOperation')
  handleRiskyOperation(data: any): Observable<any> {
    if (!data.valid) {
      return throwError(() => new Error('Invalid data'));
    }
    return of({ success: true });
  }
}
```

### Constructor Parameters

#### Iframe

**`IframeMessageClient` / `IframeMessageHost` / `IframeMessageService`**

```typescript
constructor(channelName?: string, targetFrame?: HTMLIFrameElement | (() => HTMLIFrameElement))
```

- **`channelName`** (optional): Channel identifier for namespacing messages. Default: `'hermes-iframe-message'`
- **`targetFrame`** (optional): Specific iframe to communicate with. Can be:
  - `HTMLIFrameElement`: Direct reference to iframe element
  - `() => HTMLIFrameElement`: Function returning iframe (useful for dynamic iframes)
  - Omit to communicate with parent window (from iframe) or all iframes (from parent)

**Examples:**
```typescript
// From iframe: communicate with parent
const client = new IframeMessageClient();

// From parent: communicate with specific iframe
const iframe = document.querySelector('iframe');
const host = new IframeMessageHost('my-channel', iframe);

// Dynamic iframe reference
const service = new IframeMessageService('my-channel', () => 
  document.querySelector('iframe[data-active="true"]')
);
```

#### Worker

**`WorkerMessageClient` / `WorkerMessageHost` / `WorkerMessageService`**

```typescript
constructor(worker?: Worker)
```

- **`worker`** (optional): Worker instance for main thread communication
  - **In main thread**: Must provide `Worker` instance
  - **In worker thread**: Omit parameter (uses `self` automatically)

**Examples:**
```typescript
// Main thread: must provide worker
const worker = new Worker('./worker.js');
const service = new WorkerMessageService(worker);

// Inside worker: no parameter needed
const service = new WorkerMessageService();
```

#### Broadcast

**`BroadcastMessageClient` / `BroadcastMessageHost` / `BroadcastMessageService`**

```typescript
constructor(channelName?: string)
```

- **`channelName`** (optional): Broadcast channel name. Default: `'hermes-broadcast-message'`

**Example:**
```typescript
const service = new BroadcastMessageService('app-sync-channel');
```

#### Chrome

**`ChromeMessageClient` / `ChromeMessageHost`**

```typescript
constructor(connectionName?: string)
```

- **`connectionName`** (optional): Connection identifier. Default: `'hermes-chrome-message'`

**Example:**
```typescript
const client = new ChromeMessageClient('extension-port');
```

## API Reference

### Classes

- **`MessageClient`** - Base class for message senders
- **`MessageHost`** - Base class for message receivers
- **`IframeMessageClient`** - Iframe client implementation
- **`IframeMessageHost`** - Iframe host implementation
- **`IframeMessageService`** - Bidirectional iframe communication
- **`ChromeMessageClient`** - Chrome extension client
- **`ChromeMessageHost`** - Chrome extension host
- **`WorkerMessageService`** - Bidirectional worker communication
- **`BroadcastMessageClient`** - Broadcast channel client
- **`BroadcastMessageHost`** - Broadcast channel host
- **`BroadcastMessageService`** - Bidirectional broadcast communication

### Decorators

- **`@Request(path: string)`** - Decorator for sending messages
- **`@Listen(path: string)`** - Decorator for receiving messages

### Types

- **`Message`** - Message payload structure
- **`MessageResponse`** - Response payload structure
- **`UpcomingMessage<T>`** - Incoming message with sender info (iframe)

## Requirements

- RxJS 7.x or higher
- TypeScript 4.x or higher (for decorator support)
- Modern browser with ES2015+ support

## License

MIT © [Thalesrc](https://github.com/thalesrc)
