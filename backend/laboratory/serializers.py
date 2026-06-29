from rest_framework import serializers
from .models import Sample, TestRequest, TestResult


class TestResultSerializer(serializers.ModelSerializer):
    pass_fail = serializers.CharField(read_only=True)

    class Meta:
        model = TestResult
        fields = [
            'id', 'result_value', 'unit',
            'specification_lower', 'specification_upper',
            'pass_fail', 'entered_by', 'entered_at',
        ]
        read_only_fields = ['id', 'pass_fail', 'entered_at']


class TestRequestSerializer(serializers.ModelSerializer):
    result = TestResultSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = TestRequest
        fields = [
            'id', 'sample', 'test_name', 'method',
            'assigned_analyst', 'due_date', 'status', 'status_display', 'result',
        ]
        read_only_fields = ['id']


class SampleSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    sample_type_display = serializers.CharField(source='get_sample_type_display', read_only=True)
    test_requests = TestRequestSerializer(many=True, read_only=True)

    class Meta:
        model = Sample
        fields = [
            'id', 'sample_number', 'product', 'batch_lot',
            'sample_type', 'sample_type_display', 'received_date',
            'received_by', 'status', 'status_display',
            'created_at', 'updated_at', 'test_requests',
        ]
        read_only_fields = ['id', 'sample_number', 'created_at', 'updated_at']
