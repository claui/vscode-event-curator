# vscode-event-curator

This library provides alternative text document events for your
VS Code extension to consume.

## Motivation

While Microsoft’s original VS Code API is a well-engineered piece of
tech, its event model for text documents has a few rough edges.

This library sits on top of the VS Code API, emitting curated events.
Depending on your use case, those curated events can be more practical
than the text document events the original VS Code API emits.

The following table explains the differences in a nutshell:

| When a document is | Original VS Code API notifies you |    This API notifies you    |
|:------------------:|:---------------------------------:|:---------------------------:|
| **opened**         | All the time                      | If it matches your selector |
| **changed**        | All the time, on every change, risk of infinite loops | If it matches your selector, coalescing the changes |
| **closed**         | All the time                      | If it matches your selector |
| **already open at activation time** |        —         | If it matches your selector |

## Target audience

This library is for developers of VS Code extensions.  
If you’re not an extension developer, this library won’t be useful
to you.

## How to install

Using the npm CLI:

```shell
npm install vscode-event-curator
```

Using Yarn:

```shell
yarn add vscode-event-curator
```

## Usage

In your VS Code extension:

```typescript
import { EventCurator } from "./event-curator";

const curator = new EventCurator({
  language: "my-lang", // ID of your contributed language
  changeEventThrottleMillis: 1000, // to coalesce change events
});

/*
 * Use this instead of `workspace.onDidOpenTextDocument`.
 * Filters out unwanted schemes and respects your language selector,
 * too.
 */
curator.onDidOpenRelevantTextDocument((document) => {
  // …
});

/*
 * Use this instead of `workspace.onDidCloseTextDocument`, similarly.
 */
curator.onDidCloseRelevantTextDocument((document) => {
  // …
});

/*
 * Use this instead of `workspace.onDidChangeTextDocument`.
 * This one throttles (coalesces) events for you, which means that
 * for each relevant text document, you get no more than one event
 * per `changeEventThrottleMillis` ms window.
 */
curator.onDidChangeRelevantTextDocument((document) => {
  /*
   * Note: unlike `workspace.onDidChangeTextDocument`, this event
   * hands you just the `TextDocument`, i.e. not the itemized
   * changes.
   */
});

/*
 * Get notified of already-opened documents as your extension
 * wakes up.
 */
curator.onDidInitiallyFindRelevantTextDocument((document) => {
  // …
});
```

## Detailed explanation

This library introduces new event registration endpoints:

- `onDidOpenRelevantTextDocument`
  (replaces `workspace.onDidOpenTextDocument`)
- `onDidCloseRelevantTextDocument`
  (replaces `workspace.onDidCloseTextDocument`)
- `onDidChangeRelevantTextDocument`
  (replaces `workspace.onDidChangeTextDocument`)
- `onDidInitiallyFindRelevantTextDocument` (new feature)

Those new event registration endpoints filter out less-than-helpful
events by default. For example, the following events can be unwanted:

- events that originate from log output channels;

- events that belong to a language in which your extension is not
  interested.

While events that belong to an irrelevant language can be a nuisance,
events that originate from log output channels can even trigger
infinite loops in the extension host. For example, if your extension
responds to a `workspace.onDidChangeTextDocument` event by logging
something to an output channel, VS Code registers that as a text
document change, too. This in turn causes another
`workspace.onDidChangeTextDocument` event to fire, possibly
triggering an endless feedback loop in your extension.

Another pitfall for `workspace.onDidChangeTextDocument` is that it’s
not rate limited. This can cause issues if an extension wants to
update diagnostics in real time as the user types.  
To mitigate that, the new `onDidChangeRelevantTextDocument` event
will buffer and throttle the original events. That allows for
practical rate limiting (e.g. 1000 milliseconds) while the user is
actively editing a text document.

In addition to the events mentioned, a VS Code extension may also be
interested in all text documents that are already open at extension
activation time, because it wants to give those already-open
text documents the same treatment, UX-wise, as the text documents
which the end user may be opening later. That would make for a more
consistent UX. To that end, this library provides an endpoint called
`onDidInitiallyFindRelevantTextDocument`.

## License

Copyright (c) 2023 Claudia Pellegrino

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
For a copy of the License, see [LICENSE.txt](LICENSE.txt).
