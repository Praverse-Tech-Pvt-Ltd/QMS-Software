from django.contrib import admin
from .models import MasterBatchRecord, MBRStep, BatchProductionRecord, BPRStep, IPQCCheck, BatchRelease

admin.site.register(MasterBatchRecord)
admin.site.register(MBRStep)
admin.site.register(BatchProductionRecord)
admin.site.register(BPRStep)
admin.site.register(IPQCCheck)
admin.site.register(BatchRelease)
