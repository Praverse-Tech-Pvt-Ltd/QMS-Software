from django.contrib import admin
from .models import InventoryCategory, InventoryItem, InventoryLot, InventoryUsageLog


@admin.register(InventoryCategory)
class InventoryCategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['item_code', 'name', 'category', 'unit', 'minimum_stock']
    list_filter = ['category']
    search_fields = ['item_code', 'name', 'catalog_no']


@admin.register(InventoryLot)
class InventoryLotAdmin(admin.ModelAdmin):
    list_display = ['item', 'lot_number', 'received_date', 'expiry_date', 'current_quantity', 'status']
    list_filter = ['status']
    search_fields = ['lot_number', 'item__item_code', 'item__name']


@admin.register(InventoryUsageLog)
class InventoryUsageLogAdmin(admin.ModelAdmin):
    list_display = ['lot', 'quantity_used', 'used_by', 'used_date', 'purpose']
    list_filter = ['used_date']
    search_fields = ['purpose', 'lot__lot_number']
