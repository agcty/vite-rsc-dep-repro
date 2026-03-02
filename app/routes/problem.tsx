import { load as loadProblem } from "./problem-loader.server";

type LoaderData = {
  domExports: number;
  zodExports: number;
  at: string;
};

export async function loader(): Promise<LoaderData> {
  return loadProblem();
}

export function ServerComponent({ loaderData }: { loaderData: LoaderData }) {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.8, padding: 24 }}>
      <h1>Problem Route</h1>
      <p>
        First navigation here should trigger late dep optimization in SSR/RSC.
      </p>
      <p>
        Watch dev logs for:
        <code>new dependencies optimized</code> and{" "}
        <code>optimized dependencies changed. reloading</code>.
      </p>
      <ul>
        <li>dom exports: {loaderData.domExports}</li>
        <li>zod exports: {loaderData.zodExports}</li>
        <li>loaded at: {loaderData.at}</li>
      </ul>
    </main>
  );
}
