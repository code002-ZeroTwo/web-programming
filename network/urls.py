
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # api routes
    path("handle",views.handle_post,name="handle_post"),
    path("handle/allposts",views.all_post,name="all_post"),
    path("handle/<int:id>",views.likes ,name="likes"),
    path("profile/",views.profile,name="profile"),
    path("profile/<str:username>",views.poster_profile,name="poster_profile"),
    path("follow_or_unfollow",views.handle_follow,name="handle_follow")
]
