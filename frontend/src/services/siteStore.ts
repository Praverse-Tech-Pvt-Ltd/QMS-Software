// Selected-site store for multi-site filtering (Phase 6 Block 7).
// Module-level (not React state) so the axios interceptor in api.ts can read it
// without importing React — mirrors the tokenStore.ts pattern used for the JWT.
let _siteId: string | null = sessionStorage.getItem("qms_site");

export const setSelectedSite = (siteId: string | null) => {
  _siteId = siteId;
  if (siteId) sessionStorage.setItem("qms_site", siteId);
  else sessionStorage.removeItem("qms_site");
};

export const getSelectedSite = () => _siteId;
