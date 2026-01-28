import re
from datetime import datetime, timedelta, timezone  

START_TIME_RE = re.compile(r'\[StartTime "(\d{2}:\d{2}:\d{2})"\]')
END_TIME_RE = re.compile(r'\[EndTime "(\d{2}:\d{2}:\d{2})"\]')

def get_duration_seconds_from_pgn(pgn):
    if not pgn:
        return None
    
    start_time_match = START_TIME_RE.search(pgn)
    end_time_match = END_TIME_RE.search(pgn)

    if not start_time_match or not end_time_match:
        return None
    
    start = start_time_match.group(1)
    end = end_time_match.group(1)

    try:
        h1, m1, s1 = map(int, start.split(":"))
        h2, m2, s2 = map(int, end.split(":"))
    except ValueError:
        return None
    
    start_duration = timedelta(hours=h1, minutes=m1, seconds=s1)
    end_duration = timedelta(hours=h2, minutes=m2, seconds=s2)

    if end_duration < start_duration:
        end_duration += timedelta(days=1)

    duration = end_duration - start_duration
    return int(duration.total_seconds())