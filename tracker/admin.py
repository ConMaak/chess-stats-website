from django.contrib import admin
from .models import Player, Game

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = (
        'username_normalized',
        'username_display',
        'display_name',
        'current_rating_blitz',
        'current_rating_rapid',
        'current_rating_bullet',
        'last_game_time',
    )
    search_fields = ('username_normalized', 'username_display')
    ordering = ('username_normalized',)

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = (
        'game_id',
        'player',
        'time_class',
        'played_as_color',
        'rating_after_game',
        'end_time',
    )
    list_filter = ('time_class', 'played_as_color')
    search_fields = ('game_id', 'player__username_normalized')
    ordering = ('-end_time',)