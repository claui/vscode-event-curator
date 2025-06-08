import {
  DocumentSelector,
  Event,
  languages,
  TextDocument,
  TextDocumentChangeEvent,
  Uri,
} from "vscode";
import { EventStreamFunction } from "./stream";

const schemesToExclude: string[] = ["git", "gitfs", "output", "vscode"];

/**
 * Determines if a DocumentSelector specifies a language constraint.
 *
 * A DocumentSelector can specify a language in several ways:
 * - As a string (which represents a language ID)
 * - As an array containing language IDs or DocumentFilters with
 *    language properties
 * - As a DocumentFilter object with a language property
 *
 * @param selector The DocumentSelector to check
 * @returns true if the selector specifies a language constraint,
 *    false otherwise
 */
export function selectorSpecifiesLanguage(selector: DocumentSelector): boolean {
  if (typeof selector === "string") {
    return !!selector;
  }
  if (Array.isArray(selector)) {
    return selector.some(selectorSpecifiesLanguage);
  }
  if (
    typeof selector === "object" &&
    selector !== null &&
    "language" in selector &&
    selector.language
  ) {
    return true;
  }
  return false;
}

export function relevantChangeEventsByLanguage(
  selector: DocumentSelector,
): EventStreamFunction<TextDocumentChangeEvent, TextDocumentChangeEvent, []> {
  return (event) => {
    return select((e) => !!languages.match(selector, e.document), event);
  }
}

export function relevantTextDocumentsByLanguage(
  selector: DocumentSelector,
): EventStreamFunction<TextDocument, TextDocument, []> {
  return (event) => {
    return select(
      (document) => !!languages.match(selector, document),
      event,
    );
  }
}

export function relevantChangeEventsByScheme(
  event: Event<TextDocumentChangeEvent>,
) {
  return excludeUriSchemes(
    (e) => e.document.uri,
    event,
  );
}

export function relevantTextDocumentsByScheme(event: Event<TextDocument>) {
  return excludeUriSchemes(
    (document) => document.uri,
    event,
  );
}

export function excludeUriSchemes<T>(
  extractUri: (event: T) => Uri,
  upstreamEvent: Event<T>,
): Event<T> {
  const schemesToExcludeArray: string[] = Array.from(schemesToExclude);
  function isSchemeRelevant(uri: Uri) {
    return !schemesToExcludeArray.includes(uri.scheme);
  }
  return select((e: T) => isSchemeRelevant(extractUri(e)), upstreamEvent);
}

export function ignoreIfAlreadyClosed(upstreamEvent: Event<TextDocument>) {
  return select((document) => !document.isClosed, upstreamEvent);
}

/**
 * @this unknown passed through to the upstream event.
 */
export function select<T>(
  match: (e: T) => boolean,
  upstreamEvent: Event<T>,
): Event<T> {
  return (...[listener, listenerThisArgs, disposables]) => {
    const upstreamListener: (e: T) => unknown = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return match(e) ? listener.call(listenerThisArgs, e) : null;
    };
    return upstreamEvent(upstreamListener, this, disposables);
  };
}