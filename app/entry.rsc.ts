import unstable_reactRouterServeConfig from "virtual:react-router/unstable_rsc/react-router-serve-config";

export { fetchServer } from "./rsc-handler";
export { unstable_reactRouterServeConfig };
export { default } from "../workers/app";

if (import.meta.hot) {
  import.meta.hot.accept();
}
