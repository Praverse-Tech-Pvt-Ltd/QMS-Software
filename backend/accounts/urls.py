from django.urls import path
from .views import (
    ChangePasswordView, CustomLoginView, CookieTokenRefreshView, RegisterView, list_employees,
)

urlpatterns = [
    path("login/", CustomLoginView.as_view(), name="token_obtain_pair"),
    path("token/", CustomLoginView.as_view(), name="token_obtain_pair_alt"),
    path("register/", RegisterView.as_view(), name="register"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("employees/", list_employees, name="employee-list"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
