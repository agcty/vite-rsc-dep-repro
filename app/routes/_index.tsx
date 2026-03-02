import { Link, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
};

export function ServerComponent() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: 24 }}>
      <h1>Welcome to React Router</h1>
      <p>
        This repro intentionally triggers late SSR dependency discovery with RSC.
      </p>
      <p>
        <Link to="/problem">Open /problem</Link>
      </p>
    </div>
  );
}
