from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Site


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'country', 'is_active']
    list_filter = ['country', 'is_active']
    search_fields = ['code', 'name']


# Register your custom user model
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    # Add your custom fields to the list view
    list_display = ['username', 'email', 'role', 'department', 'site', 'is_staff']
    # Add filters for quick searching
    list_filter = ['role', 'department', 'site', 'is_staff']

    # Add custom fields to the "Edit User" page
    fieldsets = UserAdmin.fieldsets + (
        ('Professional Info', {'fields': ('role', 'department', 'employee_id', 'site')}),
    )