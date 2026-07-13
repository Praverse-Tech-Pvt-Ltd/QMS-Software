"""
Phase 6 Block 7 — Multi-site UI.

Every BaseModel subclass already has a `site` FK (shared/models.py). This mixin
applies it: non-admin users are restricted to their own assigned `request.user.site`
regardless of query params; Admin users see all sites by default, or a single
site when `?site=<id>` is passed.
"""


class SiteScopedQuerysetMixin:
    def scope_by_site(self, qs):
        user = self.request.user
        is_admin = getattr(user, 'role', '') == 'Admin'
        user_site_id = getattr(user, 'site_id', None)

        if not is_admin and user_site_id:
            return qs.filter(site_id=user_site_id)

        site_param = self.request.query_params.get('site')
        if site_param:
            return qs.filter(site_id=site_param)

        return qs
