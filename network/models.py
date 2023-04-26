from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    post = models.TextField()
    created_by = models.ForeignKey(User,on_delete=models.CASCADE,related_name="user_posts")
    created_at = models.DateTimeField(auto_now_add=True)
    like_count = models.IntegerField(default=0)

    def __str__(self) -> str:
        return f"this post is created by {self.created_by} at {self.created_at}"

    def serialize(self):
        return {
            "id": self.id,
            "post":self.post,
            "created_at":self.created_at,
            "created_by":self.created_by.username,
            "like_count": self.like_count
        }


class FollowModel(models.Model):
    followed_by = models.ForeignKey(User,on_delete=models.CASCADE,related_name="user_follows")
    followed_to = models.ForeignKey(User,on_delete=models.CASCADE, related_name="followed_by")

    def __str__(self) -> str:
        return f"{self.followed_by} follows {self.followed_to}"
    
    def serialize(self):
        return {
            "followed_by": self.followed_by.username,
            "followed_to": self.followed_to.username
        }
