from rest_framework import serializers
from .models import InventoryCategory, InventoryItem, InventoryLot, InventoryUsageLog


class InventoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCategory
        fields = ['id', 'name']


class InventoryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'item_code', 'name', 'category', 'category_name', 'manufacturer',
            'catalog_no', 'storage_condition', 'unit', 'minimum_stock',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InventoryLotSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_code = serializers.CharField(source='item.item_code', read_only=True)
    # current_quantity defaults to initial_quantity on creation (a fresh lot starts
    # fully stocked) but is not writable afterward — it only moves via
    # InventoryUsageLog.save()'s deduction logic or the quarantine/expire action.
    current_quantity = serializers.DecimalField(
        max_digits=10, decimal_places=3, required=False,
    )

    class Meta:
        model = InventoryLot
        fields = [
            'id', 'item', 'item_name', 'item_code', 'lot_number', 'received_date',
            'expiry_date', 'initial_quantity', 'current_quantity', 'purity_percent',
            'status', 'status_display', 'linked_coa', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        if validated_data.get('current_quantity') is None:
            validated_data['current_quantity'] = validated_data.get('initial_quantity')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # current_quantity is only ever mutated by usage-log deduction or the
        # quarantine/expire action, never by a direct PATCH.
        validated_data.pop('current_quantity', None)
        return super().update(instance, validated_data)


class InventoryUsageLogSerializer(serializers.ModelSerializer):
    used_by_name = serializers.CharField(source='used_by.get_full_name', read_only=True)
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)

    class Meta:
        model = InventoryUsageLog
        fields = [
            'id', 'lot', 'lot_number', 'quantity_used', 'used_by', 'used_by_name',
            'used_date', 'purpose', 'linked_sample', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'used_by', 'created_at', 'updated_at']
