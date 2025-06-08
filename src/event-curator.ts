import {
  Disposable,
  DocumentSelector,
  Event,
  TextDocument,
  workspace,
} from "vscode";

import {
  ignoreIfAlreadyClosed,
  relevantChangeEventsByLanguage,
  relevantChangeEventsByScheme,
  relevantTextDocumentsByLanguage,
  relevantTextDocumentsByScheme,
  selectorSpecifiesLanguage,
} from "./event-curator/filters";
import { stream } from "./event-curator/stream";
import { throttleEvent } from "./event-curator/throttle";

export class EventCurator {
  #config;

  constructor(config: DocumentSelector & {
    changeEventThrottleMillis: number,
  }) {
    this.#config = config;
  }

  static #onDidInitiallyFindTextDocument(
    ...[listener, thisArgs]: Parameters<Event<TextDocument>>
  ) {
    for (const document of workspace.textDocuments) {
      listener.call(thisArgs, document);
    }
    return Disposable.from();
  }

  onDidInitiallyFindRelevantTextDocument(
    ...args: Parameters<Event<TextDocument>>
  ) {
    const _stream = stream(EventCurator.#onDidInitiallyFindTextDocument)
    _stream.select(relevantTextDocumentsByScheme)

    if(selectorSpecifiesLanguage(this.#config)) {
      _stream.select(relevantTextDocumentsByLanguage(this.#config))
    }

    return _stream(...args)
  }

  onDidChangeRelevantTextDocument(
    ...args: Parameters<Event<TextDocument>>
  ) {
    const _stream = stream(workspace.onDidChangeTextDocument)
    _stream.select(relevantChangeEventsByScheme)

    if(selectorSpecifiesLanguage(this.#config)) {
      _stream.select(relevantChangeEventsByLanguage(this.#config))
    }

    const throttledStream = _stream.map(throttleEvent(
      this.#config.changeEventThrottleMillis, (e) => e.document))
    throttledStream.select(ignoreIfAlreadyClosed)

    return throttledStream(...args)
  }

  onDidOpenRelevantTextDocument(
    ...args: Parameters<Event<TextDocument>>
  ) {
    const _stream = stream(workspace.onDidOpenTextDocument)
    _stream.select(relevantTextDocumentsByScheme)

    if(selectorSpecifiesLanguage(this.#config)) {
      _stream.select(relevantTextDocumentsByLanguage(this.#config))
    }

    return _stream(...args)
  }

  onDidCloseRelevantTextDocument(
    ...args: Parameters<Event<TextDocument>>
  ) {
    const _stream = stream(workspace.onDidCloseTextDocument)
    _stream.select(relevantTextDocumentsByScheme)
    if(selectorSpecifiesLanguage(this.#config)) {
      _stream.select(relevantTextDocumentsByLanguage(this.#config))
    }
    return _stream(...args)
  }
}
