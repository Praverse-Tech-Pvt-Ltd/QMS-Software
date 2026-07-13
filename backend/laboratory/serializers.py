from rest_framework import serializers
from .models import Sample, TestRequest, TestResult, Instrument, CalibrationRecord


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


class CalibrationRecordSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    calibration_type_display = serializers.CharField(source='get_calibration_type_display', read_only=True)
    result_display = serializers.CharField(source='get_result_display', read_only=True)

    class Meta:
        model = CalibrationRecord
        fields = [
            'id', 'instrument', 'calibration_date', 'performed_by', 'performed_by_name',
            'calibration_type', 'calibration_type_display', 'result', 'result_display',
            'certificate_number', 'next_due_date', 'created_at',
        ]
        read_only_fields = ['id', 'instrument', 'performed_by', 'created_at']


class InstrumentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    calibration_records = CalibrationRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Instrument
        fields = [
            'id', 'instrument_id', 'name', 'model', 'manufacturer', 'location', 'department',
            'calibration_frequency_days', 'last_calibration_date', 'next_calibration_date',
            'status', 'status_display', 'created_at', 'updated_at', 'calibration_records',
        ]
        read_only_fields = ['id', 'instrument_id', 'next_calibration_date', 'created_at', 'updated_at']
