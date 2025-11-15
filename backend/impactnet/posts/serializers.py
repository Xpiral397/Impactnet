from rest_framework import serializers
from .models import Post, Comment, Goal, GoalContribution, GoalContributionComment, PostLike
from users.serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    likes_count = serializers.ReadOnlyField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'parent_comment',
                  'likes_count', 'created_at', 'updated_at', 'replies']
        read_only_fields = ['id', 'post', 'author', 'created_at', 'updated_at', 'likes_count']

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []


class GoalContributionCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = GoalContributionComment
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'updated_at']


class GoalContributionSerializer(serializers.ModelSerializer):
    supporter = UserSerializer(read_only=True)
    comments = GoalContributionCommentSerializer(many=True, read_only=True)

    class Meta:
        model = GoalContribution
        fields = '__all__'
        read_only_fields = ['supporter', 'created_at', 'updated_at']


class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    supporters_count = serializers.ReadOnlyField()
    contributions = GoalContributionSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['raised_amount', 'created_at', 'updated_at',
                            'progress_percentage', 'supporters_count']


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    goal = GoalSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'post_type', 'content', 'images', 'video_url',
                  'goal', 'comments', 'likes_count', 'comments_count', 'shares_count',
                  'is_public', 'is_pinned', 'is_featured', 'created_at', 'updated_at',
                  'is_liked']
        read_only_fields = ['id', 'author', 'likes_count', 'comments_count',
                            'shares_count', 'created_at', 'updated_at']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(post=obj, user=request.user).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    goal_data = GoalSerializer(required=False, write_only=True)

    class Meta:
        model = Post
        fields = ['content', 'post_type', 'images', 'video_url',
                  'is_public', 'goal_data']

    def create(self, validated_data):
        goal_data = validated_data.pop('goal_data', None)
        post = Post.objects.create(**validated_data)

        # Create goal if provided
        if goal_data:
            Goal.objects.create(post=post, **goal_data)

        return post
