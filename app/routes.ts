import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("problem", "routes/problem.tsx"),
] satisfies RouteConfig;
