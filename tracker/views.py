from django.shortcuts import render, redirect, get_object_or_404
from .models import Player

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
