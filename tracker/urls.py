from django.urls import path
from . import views

urlpatterns = [
    path("", views.home_view, name="home"),
    path("player/<str:username>/", views.player_dashboard_view, name="player_dashboard"),
]