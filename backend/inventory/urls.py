from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Per spec: only categories/items/lots are top-level routes. Usage-log listing/
# creation is exposed exclusively via the nested lots/:id/usage/ action — there is
# no separate top-level route for InventoryUsageLogViewSet.
router = DefaultRouter()
router.register('categories', views.InventoryCategoryViewSet, basename='inventory-category')
router.register('items', views.InventoryItemViewSet, basename='inventory-item')
router.register('lots', views.InventoryLotViewSet, basename='inventory-lot')

urlpatterns = [
    path('', include(router.urls)),
]
