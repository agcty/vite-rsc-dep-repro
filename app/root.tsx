import type { MiddlewareFunction } from "react-router";
import { Outlet } from "react-router";
import { runWithRequestContext } from "./request-context.server";

export const middleware: MiddlewareFunction[] = [
  async (_args, next) => {
    const requestId = crypto.randomUUID();
    return runWithRequestContext(requestId, async () => {
      const response = await next();
      // Simulate post-next async work common in production middleware stacks.
      await new Promise(resolve => setTimeout(resolve, 5));
      return response;
    });
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}

export function ServerComponent() {
  return <Outlet />;
}
