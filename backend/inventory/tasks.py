from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(name='inventory.tasks.alert_inventory_expiring')
def alert_inventory_expiring():
    """
    Daily task: email inventory owners (created_by) about lots expiring within
    30 days that are still in use. Non-Negotiable #5 — alerts never block, so
    every send_mail call is fail_silently and the whole task is best-effort.
    """
    from datetime import date, timedelta
    from inventory.models import InventoryLot

    threshold = date.today() + timedelta(days=30)
    expiring = InventoryLot.objects.filter(
        expiry_date__lte=threshold, status='in_use', is_active=True,
    ).select_related('item', 'created_by')

    notified = 0
    for lot in expiring:
        owner = lot.created_by
        owner_email = owner.email if owner else None
        if owner_email:
            send_mail(
                subject=f'[NexGen QMS] Inventory Lot Expiring — {lot.item.item_code} / {lot.lot_number}',
                message=(
                    f'The following inventory lot is expiring within 30 days.\n\n'
                    f'Item: {lot.item.item_code} — {lot.item.name}\n'
                    f'Lot Number: {lot.lot_number}\n'
                    f'Expiry Date: {lot.expiry_date}\n'
                    f'Current Quantity: {lot.current_quantity} {lot.item.unit}\n\n'
                    'Please arrange disposition or reorder as needed.'
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nexgenqms.com'),
                recipient_list=[owner_email],
                fail_silently=True,
            )
            notified += 1

    return f'Found {expiring.count()} inventory lots expiring within 30 days, {notified} notified'


@shared_task(name='inventory.tasks.alert_low_stock')
def alert_low_stock():
    """
    Daily task: email item owners (created_by) when the total in-use quantity
    across an item's active lots drops below its minimum_stock threshold.
    """
    from inventory.models import InventoryItem, InventoryLot
    from django.db.models import Sum

    notified = 0
    checked = 0
    for item in InventoryItem.objects.filter(minimum_stock__isnull=False, is_active=True).select_related('created_by'):
        checked += 1
        total = InventoryLot.objects.filter(
            item=item, status='in_use', is_active=True,
        ).aggregate(t=Sum('current_quantity'))['t'] or 0
        if total < item.minimum_stock:
            owner = item.created_by
            owner_email = owner.email if owner else None
            if owner_email:
                send_mail(
                    subject=f'[NexGen QMS] Low Stock Alert — {item.item_code}',
                    message=(
                        f'Inventory item {item.item_code} — {item.name} has fallen below its '
                        f'minimum stock threshold.\n\n'
                        f'Current Stock: {total} {item.unit}\n'
                        f'Minimum Stock: {item.minimum_stock} {item.unit}\n\n'
                        'Please initiate reorder.'
                    ),
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nexgenqms.com'),
                    recipient_list=[owner_email],
                    fail_silently=True,
                )
                notified += 1

    return f'Checked {checked} items with minimum_stock set, {notified} low-stock notifications sent'
