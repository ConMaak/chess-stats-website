from django.db import models

class Player(models.Model):
    player_id = models.BigIntegerField(primary_key=True)

    username_normalized = models.TextField(unique=True)
    username_display = models.TextField(null=True, blank=True)
    display_name = models.TextField(null=True, blank=True)

    current_rating_blitz = models.IntegerField(null=True, blank=True)
    current_rating_rapid = models.IntegerField(null=True, blank=True)
    current_rating_bullet = models.IntegerField(null=True, blank=True)

    date_joined = models.DateTimeField(null=True, blank=True)
    last_game_time = models.DateTimeField(null=True, blank=True)
    profile_image = models.TextField(null=True, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True, auto_now=True)

    class Meta:
        db_table = 'players'

    def __str__(self):
        return self.username_display or self.username_normalized


class Game(models.Model):
    game_id = models.BigIntegerField(primary_key=True)

    player = models.ForeignKey(
        Player,
        to_field='username_normalized',
        db_column='player_username',
        on_delete=models.CASCADE,
        related_name='games',
    )

    opponent_username = models.TextField(null=True, blank=True)
    opponent_rating = models.IntegerField(null=True, blank=True)

    played_as_color = models.CharField(
        max_length=5,
        choices=[('white', 'white'), ('black', 'black')],
        null=True,
        blank=True,
    )

    result = models.TextField(null=True, blank=True)
    rating_after_game = models.IntegerField(null=True, blank=True)
    time_class = models.TextField(null=True, blank=True)

    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    duration_seconds = models.IntegerField(null=True, blank=True)
    pgn = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'games'

    def __str__(self):
        return str(self.game_id)
