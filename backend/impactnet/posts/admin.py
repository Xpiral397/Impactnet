from django.contrib import admin
from .models import Post, Goal, GoalContribution, GoalContributionComment, Comment, PostLike, CommentLike, PostShare


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'post_type', 'created_at', 'likes_count', 'is_public']
    list_filter = ['post_type', 'is_public', 'is_approved', 'created_at']
    search_fields = ['content', 'author__username']
    date_hierarchy = 'created_at'


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'goal_type', 'raised_amount', 'target_amount', 'is_active']
    list_filter = ['goal_type', 'is_active']
    search_fields = ['post__content']


@admin.register(GoalContribution)
class GoalContributionAdmin(admin.ModelAdmin):
    list_display = ['id', 'goal', 'supporter', 'amount', 'payment_status', 'created_at']
    list_filter = ['payment_status', 'created_at']
    search_fields = ['supporter__username', 'message']


@admin.register(GoalContributionComment)
class GoalContributionCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'contribution', 'author', 'created_at']
    search_fields = ['content', 'author__username']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'author', 'created_at', 'likes_count']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username']


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'reaction_type', 'created_at']
    list_filter = ['reaction_type', 'created_at']


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'comment', 'user', 'created_at']


@admin.register(PostShare)
class PostShareAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'shared_at']
    list_filter = ['shared_at']
