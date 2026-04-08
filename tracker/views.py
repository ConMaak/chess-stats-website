from django.shortcuts import render

def home_view(request):
    return render(request, "tracker/home.html")

def player_dashboard_view(request, username):
    context = {
        "username": username,
    }
    return render(request, "tracker/player_dashboard.html", context)
