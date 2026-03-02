import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import {
  RouterContextProvider,
  unstable_matchRSCServerRequest as matchRSCServerRequest,
} from "react-router";
import basename from "virtual:react-router/unstable_rsc/basename";
import routes from "virtual:react-router/unstable_rsc/routes";

export function fetchServer(request: Request, requestContext?: RouterContextProvider) {
  return matchRSCServerRequest({
    basename,
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    request,
    requestContext,
    routes: routes as any,
    generateResponse(match, options) {
      return new Response(renderToReadableStream(match.payload, options), {
        status: match.statusCode,
        headers: match.headers,
      });
    },
  });
}

export async function fetchRsc(
  request: Request,
  requestContext?: RouterContextProvider,
): Promise<Response> {
  if (requestContext && !(requestContext instanceof RouterContextProvider)) {
    requestContext = undefined;
  }

  const ssr = await import.meta.viteRsc.loadModule<{
    generateHTML(request: Request, rscResponse: Response): Promise<Response>;
  }>("ssr", "index");
  return ssr.generateHTML(request, await fetchServer(request, requestContext));
}
