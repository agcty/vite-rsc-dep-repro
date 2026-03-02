import * as conformDomFuture from "@conform-to/dom/future";
import * as conformZodFuture from "@conform-to/zod/v4/future";
import { armCrossRequestDeferred, fireCrossRequestDeferred } from "../request-context.server";

export async function load() {
  // Resolve any deferred promise armed by a previous request, then arm a new one.
  // This creates cross-request continuation pressure similar to production warnings.
  const fired = fireCrossRequestDeferred();
  const armed = armCrossRequestDeferred();
  if (fired.fired) {
    console.info("[repro] fired deferred from another request", {
      ownerRequestId: fired.ownerRequestId,
      firedByRequestId: fired.firedByRequestId,
      armedOwnerRequestId: armed.ownerRequestId,
    });
  }

  // Keep this request open briefly so reload interruption is easier to observe.
  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.info(
    "[repro] loaded conform futures",
    Object.keys(conformDomFuture).length,
    Object.keys(conformZodFuture).length,
  );

  return {
    domExports: Object.keys(conformDomFuture).length,
    zodExports: Object.keys(conformZodFuture).length,
    at: new Date().toISOString(),
  };
}
