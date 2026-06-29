from django.urls import path
from . import views

urlpatterns = [
    path('questionnaire/', views.QuestionnaireView.as_view(), name='ai-questionnaire'),
    path('remark/', views.RemarkView.as_view(), name='ai-remark'),
    path('extract-actions/', views.ExtractActionsView.as_view(), name='ai-extract-actions'),
    path('action-items/', views.ActionItemListCreateView.as_view(), name='action-items-list'),
    path('action-items/<uuid:pk>/', views.ActionItemDetailView.as_view(), name='action-items-detail'),
    path('action-items/<uuid:pk>/close/', views.ActionItemCloseView.as_view(), name='action-items-close'),
    path('action-items/<uuid:pk>/extend/', views.ActionItemExtendView.as_view(), name='action-items-extend'),
]
