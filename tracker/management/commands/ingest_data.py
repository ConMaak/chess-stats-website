from django.core.management.base import BaseCommand, CommandError

from tracker.services.ingestion import ingest_player_games_data


class Command(BaseCommand):
    help = "Ingest Chess.com player profile + games into the database."

    def add_arguments(self, parser):
        parser.add_argument("username", type=str)

    def handle(self, *args, **options):
        username = options["username"]

        try:
            stats = ingest_player_games_data(username)
        except ValueError as e:
            raise CommandError(str(e))

        self.stdout.write(self.style.SUCCESS("Ingestion complete"))
        self.stdout.write(str(stats))