from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .models import Player
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from tracker.services.ingestion import ingest_player_games_data, sync_player_profile

def home_view(request): 
    if request.method == "POST":
        username = request.POST.get("username", "").strip().lower()

        if username:
            return redirect("player_dashboard", username=username)

    return render(request, "tracker/home.html")

def player_dashboard_view(request, username):
    player = get_object_or_404(Player, username_normalized=username)
    total_games = player.games.count()
    recent_games = player.games.order_by("-end_time")[:10]
    context = {
        "player":player,
        "total_games": total_games,
        "recent_games": recent_games,
    }
    return render(request, "tracker/player_dashboard.html", context)

def player_summary_api_view(request, username):
    player = get_object_or_404(Player, username_normalized=username)
    total_games = player.games.count()

    data = {
        "username_normalized": player.username_normalized,
        "username_display": player.username_display,
        "display_name": player.display_name,
        "profile_image": player.profile_image,
        "date_joined": player.date_joined.isoformat() if player.date_joined else None,
        "last_game_time": player.last_game_time.isoformat() if player.last_game_time else None,
        "current_rating_blitz": player.current_rating_blitz,
        "current_rating_rapid": player.current_rating_rapid,
        "current_rating_bullet": player.current_rating_bullet,
        "total_games": total_games,
    }

    return JsonResponse(data)


def player_recent_games_api_view(request, username):
    player = get_object_or_404(Player, username_normalized=username)
    recent_games = player.games.order_by("-end_time")[:10]

    data = {
        "username_normalized": player.username_normalized,
        "recent_games": [
            {
                "game_id": game.game_id,
                "opponent_username": game.opponent_username,
                "opponent_rating": game.opponent_rating,
                "played_as_color": game.played_as_color,
                "result": game.result,
                "rating_after_game": game.rating_after_game,
                "time_class": game.time_class,
                "start_time": game.start_time.isoformat() if game.start_time else None,
                "end_time": game.end_time.isoformat() if game.end_time else None,
                "duration_seconds": game.duration_seconds,
            }
            for game in recent_games
        ],
    }

    return JsonResponse(data)

@csrf_exempt
@require_POST
def refresh_player_data_api_view(request, username):
    username = username.strip().lower()

    try:
        stats = ingest_player_games_data(username)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({
        "message": "Refresh complete",
        "stats": {
            "months_processed": stats.months_processed,
            "games_seen": stats.games_seen,
            "games_inserted": stats.games_inserted,
            "games_skipped_no_pgn": stats.games_skipped_no_pgn,
            "games_skipped_timeclass": stats.games_skipped_timeclass,
            "games_skipped_bad_id": stats.games_skipped_bad_id,
        }
    })

@csrf_exempt
@require_POST
def sync_player_profile_api_view(request, username):
    username = username.strip().lower()

    try:
        player = sync_player_profile(username)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)

    data = {
        "username_normalized": player.username_normalized,
        "username_display": player.username_display,
        "display_name": player.display_name,
        "profile_image": player.profile_image,
        "date_joined": player.date_joined.isoformat() if player.date_joined else None,
        "last_game_time": player.last_game_time.isoformat() if player.last_game_time else None,
        "current_rating_blitz": player.current_rating_blitz,
        "current_rating_rapid": player.current_rating_rapid,
        "current_rating_bullet": player.current_rating_bullet,
        "total_games": player.games.count(),
    }

    return JsonResponse(data)
