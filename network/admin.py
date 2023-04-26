from django.contrib import admin
from .models import User,Post,FollowModel,Liked

# Register your models here.

admin.site.register(User)
admin.site.register(Post)
admin.site.register(FollowModel)
admin.site.register(Liked)