export default {
  async fetch(request: Request) {
    const { fetchRsc } = await import("../app/rsc-handler");
    return fetchRsc(request);
  },
};
