from rest_framework import serializers
from .models import APQRReport


class APQRReportSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = APQRReport
        fields = [
            'id', 'product', 'period_start', 'period_end',
            'status', 'status_display', 'generated_at', 'approved_by', 'content',
        ]
        read_only_fields = ['id', 'generated_at']
