from django.urls import path
from .views import Clone

urlpatterns = [
    path('clone/', Clone.as_view(), name="Voice clone API"),
]