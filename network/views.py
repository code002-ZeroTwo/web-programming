import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.forms import ValidationError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from .models import User,Post,FollowModel,Liked


def index(request):
    if request.user.is_authenticated:
        return render(request, "network/index.html")
    return login_view(request)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def handle_post(request):
    if request.method != "POST" and request.method != "PUT":
        return JsonResponse({"message":"either post or put request required."},status=400)
    
    if request.method == "PUT":
        post = json.loads(request.body)
        new_post_content = post.get("post_content")
        prev_post_content = post.get("prev_content")

        post_object = Post.objects.get(post = prev_post_content)
        post_object.post = new_post_content
        post_object.save()

        return JsonResponse({"message":"put request updated."},status=201)
    
    if request.method == "POST":
        post = json.loads(request.body)
        post_content = post.get("post_content")
        newpost = Post(
            post=post_content,
            created_by=request.user
            )
        newpost.save()

        return JsonResponse({"message": "post sucessfully updated. "},status =201)
    

@login_required
def all_post(request):
    posts = Post.objects.all()

    serialized_posts = []
    for post in posts:
        likes_on_post = Liked.objects.filter(liked_on = post)
        serialized_likes_on_post = [likes.serialize() for likes in likes_on_post]

        # serialize each post instead of serializing every of them in single line
        serialized_posts.append({"post": post.serialize(), "likes":serialized_likes_on_post})

    #serialized_posts = [post.serialize() for post in posts]

    if request.method == "GET":
        return JsonResponse({"posts": serialized_posts})
    return JsonResponse({"message": "get request required. "},status=400)

# this function return response with help of liked model
# on clicking like first time this function should create a object of like model
# on clicking like second time this function should delete a object of like model
@login_required
@csrf_exempt
def likes(request,id):
    # get the liked status
    if request.method == "POST":
        json_body = json.loads(request.body)
        liked_status = json_body.get("liked_status")

        # get the post with its id
        liked_post = Post.objects.get(id = id)
        # if user is clicking to like the post
        if liked_status == "unlike":
            like_object = Liked(
                liked_by = request.user,
                liked_on = liked_post
            )
            like_object.save()
        
        else:
            to_delete_like_object = get_object_or_404(Liked, liked_by = request.user , liked_on = liked_post)
            to_delete_like_object.delete()

        return JsonResponse({"message": "like updated sucessfully"},status=201)

    return JsonResponse({"error": "get or post method required"},status = 401)


@login_required
def profile(request, username = None):
    if request.method != "GET":
        return JsonResponse({"error": "get request required"},status=400)

    # if reequest is get then return post of user id 
    # follower and following of user 
    if username == None:
        user = User.objects.get(id = request.user.id)
    else:
        user = User.objects.get(username = username)

    posts = Post.objects.filter(created_by = user)
    serialized_posts = []
    for post in posts:
        likes_on_post = Liked.objects.filter(liked_on = post)
        serialized_likes_on_post = [likes.serialize() for likes in likes_on_post]

        # serialize each post instead of serializing every of them in single line
        serialized_posts.append({"post": post.serialize(), "likes":serialized_likes_on_post})

    followings = FollowModel.objects.filter(followed_by = user).distinct()
    followers = FollowModel.objects.filter(followed_to = user).distinct()

    #serialized_following = serializers.serialize('json', following)
    #serialized_followers = serializers.serialize('json', followers) 

    serialized_followings = [following.serialize() for following in followings]
    serialized_followers = [follower.serialize() for follower in followers]

    # make a list of followed_by in serialized_followers
    followed_by = [followers["followed_by"] for followers in serialized_followers]

    # to avoid unboundlocalerror when username == none
    followed_by_logged_in = False

    # check if user follows request.user if username != none
    if username != None:
        followed_by_logged_in = True if request.user.username in followed_by else False

    #try:
        #followed_by_logged_in = True if request.user.username in followed_by else False
    #except UnboundLocalError:
        #followed_by_logged_in = False

    return JsonResponse({"posts":serialized_posts,
                         "followings": serialized_followings,
                         "followers": serialized_followers,
                         "followed_by_logged_in":followed_by_logged_in,
                         "logged_in":request.user.username
                        })

@login_required
def poster_profile(request,username):
    if request.method == "GET":
        return profile(request,username)

@csrf_exempt
@login_required
def handle_follow(request): 
    if request.method != "POST":
        return JsonResponse({"error":"post method required"})
    
    
    json_body = json.loads(request.body)

    username = json_body.get("unfollow")

    if username != None:
        user = User.objects.get(username = username)
        # get the object to be deleted
        to_delete_object = get_object_or_404(FollowModel,followed_to=user.id,followed_by=request.user.id)

        # delete object
        to_delete_object.delete()

        return JsonResponse({"success":True})

    elif username == None:
        username = json_body.get("follow")
        # write code to follow or add user in followModel
        user = User.objects.get(username = username)
        
        follow_object = FollowModel(followed_by = request.user,followed_to= user)
        follow_object.save()

        return JsonResponse({"success":True})
    
    return JsonResponse({"error":"error has occured"})

