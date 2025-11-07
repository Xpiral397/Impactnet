from rest_framework import viewsets, decorators, status, permissions
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Post, Comment, Goal, GoalContribution, PostLike, CommentLike
from .serializers import (PostSerializer, PostCreateSerializer, CommentSerializer,
                          GoalSerializer, GoalContributionSerializer)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_approved=True).select_related('author').prefetch_related('comments', 'goal')
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PostCreateSerializer
        return PostSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(post_type=category)

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(content__icontains=search) |
                Q(author__username__icontains=search)
            )

        return queryset.order_by('-is_pinned', '-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @decorators.action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user

        like, created = PostLike.objects.get_or_create(post=post, user=user)

        if not created:
            like.delete()
            post.likes_count = max(0, post.likes_count - 1)
            post.save()
            return Response({'liked': False, 'likes_count': post.likes_count})
        else:
            post.likes_count += 1
            post.save()
            return Response({'liked': True, 'likes_count': post.likes_count})

    @decorators.action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        post = self.get_object()

        if request.method == 'GET':
            comments = post.comments.filter(parent_comment=None)
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = CommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(post=post, author=request.user)
                post.comments_count += 1
                post.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @decorators.action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        post = self.get_object()
        post.shares_count += 1
        post.save()

        from .models import PostShare
        PostShare.objects.create(
            post=post,
            user=request.user,
            share_message=request.data.get('message', '')
        )

        return Response({'shares_count': post.shares_count})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @decorators.action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        user = request.user

        like, created = CommentLike.objects.get_or_create(comment=comment, user=user)

        if not created:
            like.delete()
            comment.likes_count = max(0, comment.likes_count - 1)
            comment.save()
            return Response({'liked': False})
        else:
            comment.likes_count += 1
            comment.save()
            return Response({'liked': True})


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.filter(is_active=True).select_related('post')
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @decorators.action(detail=True, methods=['get'])
    def contributions(self, request, pk=None):
        goal = self.get_object()
        contributions = goal.contributions.filter(payment_status='completed').order_by('-created_at')
        serializer = GoalContributionSerializer(contributions, many=True)
        return Response(serializer.data)

    @decorators.action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def contribute(self, request, pk=None):
        goal = self.get_object()
        amount = request.data.get('amount')
        message = request.data.get('message', '')

        if not amount or float(amount) <= 0:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        contribution = GoalContribution.objects.create(
            goal=goal,
            supporter=request.user,
            amount=amount,
            message=message,
            payment_status='completed'  # In production, this would be 'pending' until Stripe confirms
        )

        # Update goal raised amount
        from decimal import Decimal
        goal.raised_amount += Decimal(str(amount))
        goal.save()

        serializer = GoalContributionSerializer(contribution)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
