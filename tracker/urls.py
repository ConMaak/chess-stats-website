from django.urls import path
from . import views

urlpatterns = [
    path("", views.home_view, name="home"),
    path("player/<str:username>/", views.player_dashboard_view, name="player_dashboard"),

    path("api/player/<str:username>/", views.player_summary_api_view, name="player_summary_api"),
    path("api/player/<str:username>/recent-games/", views.player_recent_games_api_view, name="player_recent_games_api"),
    path("api/player/<str:username>/refresh/", views.refresh_player_data_api_view, name="refresh_player_data_api"),
    path("api/player/<str:username>/sync-profile/", views.sync_player_profile_api_view, name = "sync_player_profile_api"),
]