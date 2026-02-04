from dataclasses import dataclass
from django.db import transaction
from django.utils import timezone
from tracker.models import Player, Game
from tracker.services.chesscom_api import fetch_player_data, iterate_monthly_archives
from tracker.services.pgn import get_duration_seconds_from_pgn
from datetime import date, datetime, timezone as py_timezone, timedelta

TIME_CLASSES_ALLOWED = {'blitz', 'bullet', 'rapid'}
DEFAULT_HEADERS = {'User-Agent': 'ConnorChessTracker (Personal project; contact: ronnnoc715@yahoo.com)'}

def iterate_year_months(start, end):

    year = start.year
    month = start.month
    
    while (year, month) <= (end.year, end.month):
        yield year, month

        if month == 12:
            month = 1
            year += 1
        else:
            month += 1

def get_ingest_start_date(player):

    if player.last_game_time:
        return player.last_game_time.date()
    
    if player.date_joined:
        return player.date_joined.date()
    
    return timezone.now().date()

@dataclass
class IngestStats:
    months_processed: int = 0
    games_seen: int = 0
    games_inserted: int = 0
    games_skipped_no_pgn: int = 0
    games_skipped_timeclass: int = 0
    games_skipped_bad_id: int = 0

@transaction.atomic
def ingest_player_games_data(username_normalized, headers=None):
    
    if headers == None:
        headers = DEFAULT_HEADERS

    username_normalized = username_normalized.strip().lower()
    stats = IngestStats()

    player_data = fetch_player_data(username_normalized, headers)
    if player_data is None:
        raise ValueError(f'Could not fetch profile for {username_normalized}.')
    
    player, created = Player.objects.update_or_create(
        player_id = player_data['player_id'],
        defaults={
            'username_normalized': username_normalized,
            'username_display': player_data.get('username_display'),
            'display_name': player_data.get('display_name'),
            'date_joined': player_data.get('date_joined'),
            'profile_image': player_data.get('profile_image'),
            'current_rating_blitz': player_data.get('current_rating_blitz'),
            'current_rating_rapid': player_data.get('current_rating_rapid'),
            'current_rating_bullet': player_data.get('current_rating_bullet'),
        },
    )

    start_date = get_ingest_start_date(player)
    end_date = timezone.now().date()

    username_display = player.username_display

    for year, month in iterate_year_months(start_date, end_date):
        stats.months_processed += 1

        for month_games in iterate_monthly_archives(
            username_normalized, start_year=year, 
            start_month=month, 
            end_year=year, 
            end_month=month, 
            headers=headers):

            games = month_games.get('games', [])
            for game in games:
                stats.games_seen += 1

                time_class = game.get('time_class')
                if time_class not in TIME_CLASSES_ALLOWED:
                    stats.games_skipped_timeclass += 1
                    continue
                
                pgn = game.get('pgn')
                if not pgn:
                    stats.games_skipped_no_pgn += 1
                    continue

                end_ts = game.get('end_time')
                if end_ts is None:
                    continue

                end_time = datetime.fromtimestamp(end_ts, tz=py_timezone.utc)

                duration_seconds = get_duration_seconds_from_pgn(pgn)

                if duration_seconds is not None:
                    start_time = end_time - timedelta(seconds=duration_seconds)
                else:
                    start_time = None

                white = game.get('white', {})
                black = game.get('black', {})
                white_user = (white.get('username') or '')
                black_user = (black.get('username') or '')

                if white_user.lower() == username_normalized:
                    played_as_color = 'white'
                    opponent_username = (black.get('username') or '').lower() or None
                    opponent_rating = black.get('rating')
                    result = (white.get('result') or None)
                    rating_after_game = white.get('rating')
                    if username_display is None and white_user:
                        username_display = white_user

                elif black_user.lower() == username_normalized:
                    played_as_color = 'black'
                    opponent_username = (white.get('username') or '').lower() or None
                    opponent_rating = white.get('rating')
                    result = (black.get('result') or None)
                    rating_after_game = black.get('rating')
                    if username_display is None and black_user:
                        username_display = black_user

                else:
                    continue

                url = game.get('url') or ''
                try:
                    game_id = int(url.rstrip("/").split("/")[-1])
                except Exception:
                    stats.games_skipped_bad_id += 1
                    continue

                obj, created = Game.objects.get_or_create(
                    game_id=game_id,
                    defaults={
                        "player": player,
                        "opponent_username": opponent_username,
                        "opponent_rating": opponent_rating,
                        "played_as_color": played_as_color,
                        "result": result,
                        "rating_after_game": rating_after_game,
                        "time_class": time_class,
                        "start_time": start_time,
                        "end_time": end_time,
                        "duration_seconds": duration_seconds,
                        "pgn": pgn,
                    },
                )

                if created:
                    stats.games_inserted += 1

                if username_display and username_display != player.username_display:
                    player.username_display = username_display

    last_game_time = (
        Game.objects.filter(player=player)
        .order_by("-end_time")
        .values_list("end_time", flat=True)
        .first()
    )

    player.last_game_time = last_game_time
    player.save(update_fields=["username_display", "last_game_time", "last_updated"])

    return stats


