from django.dispatch import Signal

user_registered = Signal()
user_made_funder = Signal()
user_made_member = Signal()
user_made_hybrid = Signal()
user_deleted     = Signal()