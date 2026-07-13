def get_erp_adapter():
    """
    Resolve the currently active ERP adapter. Falls back to the no-op
    StubERPAdapter when no IntegrationConfig is active (e.g. fresh install,
    or the active config's system_type isn't wired up yet).
    """
    from integrations.models import IntegrationConfig

    config = IntegrationConfig.objects.filter(
        is_active=True, system_type__in=['sap', 'oracle', 'generic_rest'],
    ).first()

    if not config:
        from integrations.adapters.stub import StubERPAdapter
        return StubERPAdapter()

    if config.system_type == 'sap':
        from integrations.adapters.sap import SAPAdapter
        return SAPAdapter(config.config)

    from integrations.adapters.stub import StubERPAdapter
    return StubERPAdapter()
