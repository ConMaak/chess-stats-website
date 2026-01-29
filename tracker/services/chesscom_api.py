import time
import requests
from datetime import datetime, timezone

DEFAULT_HEADERS = {"User-Agent": "ConnorChessTracker (Personal project; contact: ronnnoc715@yahoo.com)"}

def fetch_player_data(username_normalized, headers=None):
    if headers == None:
        headers = DEFAULT_HEADERS

    profile_response = requests.get(f"https://api.chess.com/pub/player/{username_normalized}", headers=headers)

    time.sleep(1)

    if profile_response.status_code != 200:
        return None
    
    profile = profile_response.json()

    joined_ts = profile.get('joined')
    if joined_ts is None:
        return None
    
    player_data = {
        "player_id": profile['player_id'],
        'username_normalized': username_normalized,
        'username_display': None,
        'display_name': profile.get('name'),
        'date_joined': datetime.fromtimestamp(joined_ts, tz=timezone.utc),
        'profile_image': profile.get('avatar'),
        'current_rating_blitz': None,
        'current_rating_rapid': None,
        'current_rating_bullet': None
    }

    stats_response = requests.get(f"https://api.chess.com/pub/player/{username_normalized}/stats", headers=headers)
   
    time.sleep(1)

    if stats_response.status_code == 200:
        stats = stats_response.json()
        player_data['current_rating_blitz'] = stats.get('chess_blitz', {}).get('last', {}).get('rating')
        player_data['current_rating_rapid'] = stats.get('chess_rapid', {}).get('last', {}).get('rating')
        player_data['current_rating_bullet'] = stats.get('chess_bullet', {}).get('last', {}).get('rating')

    return player_data

def iterate_monthly_archives(username_normalized, start_year, start_month, end_year, end_month, headers=None):
    
    if headers == None:
        headers = DEFAULT_HEADERS

    year = start_year
    month = start_month

    while (year, month) <= (end_year, end_month):
        url = f"https://api.chess.com/pub/player/{username_normalized}/games/{year}/{month:02d}"
        
        response = requests.get(url, headers=headers)
        time.sleep(.2)

        if response.status_code == 200:
            yield response.json()
        
        if month == 12:
            year += 1
            month = 1
        else:
            month += 1
