import time
import requests
from datetime import datetime, timedelta, timezone

def fetch_player_data(username_normalized, headers): 
    response = requests.get(f"https://api.chess.com/pub/player/{username_normalized}", headers=headers)
    time.sleep(1)

    player_data = {}

    if response.status_code == 200:
        data = response.json()

        player_data['player_id'] = data['player_id']

        joined_ts = data.get('joined')
        if joined_ts is None:
             return None
        
        player_data['display_name'] = data.get('name')
        player_data['date_joined'] = datetime.fromtimestamp(joined_ts, tz=timezone.utc)
        player_data['profile_image'] = data.get('avatar')

    else:
            print("Failed to fetch data:", response.status_code)
            return None

    response = requests.get(f"https://api.chess.com/pub/player/{username_normalized}/stats", headers=headers)
    time.sleep(1)

    if response.status_code == 200:
        data = response.json()
        player_data['current_rating_blitz'] = data.get('chess_blitz', {}).get('last', {}).get('rating')
        player_data['current_rating_rapid'] = data.get('chess_rapid', {}).get('last', {}).get('rating')
        player_data['current_rating_bullet'] = data.get('chess_bullet', {}).get('last', {}).get('rating')

    else:
            print("Failed to fetch data:", response.status_code)

    return player_data

def insert_player_data(cur, player_id, username_normalized, username_display, display_name=None, current_rating_blitz=None, current_rating_rapid=None, current_rating_bullet=None, date_joined=None, profile_image=None):
    cur.execute("""
        INSERT INTO players (player_id, username_normalized, username_display, display_name, current_rating_blitz, current_rating_rapid, current_rating_bullet, date_joined, profile_image, last_updated)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT (player_id) DO UPDATE
        SET username_normalized = EXCLUDED.username_normalized,
            current_rating_blitz = EXCLUDED.current_rating_blitz,
            current_rating_rapid = EXCLUDED.current_rating_rapid,
            current_rating_bullet = EXCLUDED.current_rating_bullet,
            profile_image = EXCLUDED.profile_image,
            username_display = EXCLUDED.username_display,
            last_updated = NOW();
    """, (player_id, username_normalized, username_display, display_name, current_rating_blitz, current_rating_rapid, current_rating_bullet, date_joined, profile_image))

def update_player_username(cur, username_display, player_id):
    cur.execute("""
        UPDATE players
        SET username_display = %s
        WHERE player_id = %s;
                
    """, (username_display, player_id))

def insert_game_data(cur, game_id, player_username, opponent_username, opponent_rating, played_as_color, result, rating_after_game, time_class, start_time, end_time, duration_seconds, pgn):
    cur.execute("""
        INSERT INTO games (game_id, player_username, opponent_username, opponent_rating, played_as_color, result, rating_after_game, time_class, start_time, end_time, duration_seconds, pgn)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (game_id) DO NOTHING;
    """, (game_id, player_username, opponent_username, opponent_rating, played_as_color, result, rating_after_game, time_class, start_time, end_time, duration_seconds, pgn))

def get_last_game_time(cur, player_username):
    cur.execute("""
        SELECT MAX(end_time)
        FROM games
        WHERE player_username = %s;
    """, (player_username,))

    result = cur.fetchone()[0]
    return result

def update_last_game_time(cur, last_game_time, player_id):
    cur.execute("""
        UPDATE players
        SET last_game_time = %s,
            last_updated = NOW()
        WHERE player_id = %s;
    """, (last_game_time, player_id))

def extract_years_months(start, end):
    year = start.year
    month = start.month

    while (year, month) <= (end.year, end.month):

        yield year, month
    
        if month == 12:
            year += 1
            month = 1
        else:
            month += 1
