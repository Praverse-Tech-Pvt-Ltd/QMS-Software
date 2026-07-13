from django.contrib import admin
from .models import Sample, Specification, TestRequest, TestResult, COATemplate, Instrument, CalibrationRecord

admin.site.register(Sample)
admin.site.register(Specification)
admin.site.register(TestRequest)
admin.site.register(TestResult)
admin.site.register(COATemplate)
admin.site.register(Instrument)
admin.site.register(CalibrationRecord)
