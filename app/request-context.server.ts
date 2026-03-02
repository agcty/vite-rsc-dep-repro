import { AsyncLocalStorage } from "node:async_hooks";

type ReproRequestContext = {
  requestId: string;
};

declare global {
  var __reproRequestContextStorage: AsyncLocalStorage<ReproRequestContext> | undefined;
}

const requestContextStorage =
  globalThis.__reproRequestContextStorage ??= new AsyncLocalStorage<ReproRequestContext>();

export function runWithRequestContext<T>(
  requestId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return requestContextStorage.run({ requestId }, fn);
}

export function getRequestId(): string | undefined {
  return requestContextStorage.getStore()?.requestId;
}

type DeferredRecord = {
  ownerRequestId: string;
  resolve: () => void;
};

let pendingCrossRequestDeferred: DeferredRecord | null = null;

export function armCrossRequestDeferred(): { ownerRequestId: string } {
  const ownerRequestId = getRequestId() ?? "unknown";
  const deferred = new Promise<void>(resolve => {
    pendingCrossRequestDeferred = { ownerRequestId, resolve };
  });

  void deferred.then(() => {
    console.info("[repro] cross-request continuation", {
      ownerRequestId,
      resumedRequestId: getRequestId() ?? "none",
    });
  });

  return { ownerRequestId };
}

export function fireCrossRequestDeferred():
  | { fired: false }
  | { fired: true; ownerRequestId: string; firedByRequestId: string } {
  if (!pendingCrossRequestDeferred) {
    return { fired: false };
  }

  const { ownerRequestId, resolve } = pendingCrossRequestDeferred;
  pendingCrossRequestDeferred = null;
  resolve();

  return {
    fired: true,
    ownerRequestId,
    firedByRequestId: getRequestId() ?? "unknown",
  };
}
