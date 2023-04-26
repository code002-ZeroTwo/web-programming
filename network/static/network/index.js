document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#post_form").addEventListener("click", senddata);
  document.querySelector("#allposts").addEventListener("click", returnposts);
  document.querySelector("#profile").addEventListener("click", profile);
  document
    .querySelector("#following")
    .addEventListener("click", return_from_followed);
  document.querySelector("#edit_post").style.display = "none";
});


const profile = (event) => {
  // stop the propagation of click event
  event.stopPropagation();

  // hide all the other views and show only profile view
  document.querySelector("#profile_info").innerHTML = "";
  document.querySelector("#profile_info").style.display = "block";
  document.querySelector("#ffcontainer").style.display = "block";

  document.querySelector("#allposts_view").style.display = "block";
  document.querySelector("#following_posts").style.display = "none";

  fetch("/profile/")
    .then((response) => response.json())
    .then((result) => {
      show_posts(result, event);
      show_following(result, event);
      console.log(result);
    })
    .catch((error) => console.log(error));
};

const senddata = () => {
  let post = document.querySelector("#post");
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  fetch("/handle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ post_content: post.value }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
};

// show followers and following for a user

const show_following = (result, event) => {
  event.stopPropagation();

  // create a following and followers div
  let following_follower_container = document.querySelector("#ffcontainer");

  // hide other containers
  document.querySelector("#following_posts").style.display = "none";
  document.querySelector("#profile_info").style.display = "none";
  let followings = document.createElement("div");
  let followers = document.createElement("div");
  let followings_header = document.createElement("p");
  let followers_header = document.createElement("p");

  //assign followings_header
  followings_header.innerHTML = "<h3>followings</h3>";
  followings.appendChild(followings_header);

  // assign a followers_header
  followers_header.innerHTML = "<h3>followers</h3>";
  followers.appendChild(followers_header);

  // display followings of user
  for (let following of result.followings) {
    let following_user = document.createElement("p");
    following_user.innerHTML = following.followed_to;

    // append user to followings container
    followings.appendChild(following_user);
    visit_profile(following_user);
  }

  // display followers of user
  for (let follower of result.followers) {
    let follower_user = document.createElement("p");
    follower_user.innerHTML = follower.followed_by;

    // append user to followings container
    followers.appendChild(follower_user);
    visit_profile(follower_user);
  }

  // empty the ffcontainer before reloading
  following_follower_container.innerHTML = "";

  // append followings to ffcontainer
  following_follower_container.appendChild(followings);
  // append followings to ffcontainer
  following_follower_container.appendChild(followers);
};

const show_posts = (result, event) => {
  // stop click event to affect other event
  event.stopPropagation();

  // log result
  console.log(result);

  // remove the create post form from view
  document.querySelector("#index").style.display = "none";
  document.querySelector("#edit_post").style.display = "none";
  document.querySelector("#profile_info").style.display = "none";

  // update allposts_view
  let supercontainer = document.querySelector("#allposts_view");

  supercontainer.innerHTML = "";
  // create a multiple container that contains each post and its info

  for (let post of result.posts) {
    // create a single container for each post
    let subcontainer = document.createElement("div");
    let content = document.createElement("p");
    let created_by = document.createElement("p");
    let created_at = document.createElement("p");
    let like = document.createElement("div");
    let like_text = document.createElement("div");
    let edit = document.createElement("div");
    let pid = post.id;

    // add content to created element
    content.innerHTML = post.post;
    edit.innerHTML = "edit this post";
    created_at.innerHTML = post.created_at;
    created_by.innerHTML = post.created_by;
    like.innerHTML = "0";
    like_text.innerHTML = "like";

    // append all these content to a subcontainer

    subcontainer.appendChild(content);
    subcontainer.appendChild(created_by);
    subcontainer.appendChild(created_at);
    subcontainer.appendChild(like);
    subcontainer.appendChild(like_text);
    subcontainer.appendChild(edit);

    // now append this subcontainer to a supercontainer
    supercontainer.appendChild(subcontainer);

    // add style

    subcontainer.setAttribute("class", "post_container");
    content.setAttribute("class", "post_content");
    like.setAttribute("class", "like");
    like_text.classList.add("like");
    created_by.classList.add("extra_post_content");
    created_by.classList.add("post_username");
    created_at.classList.add("extra_post_content");

    // add event listener to edit only if created_by is logged in user

    // get logged in user
    let logged_in;
    fetch("/profile/")
      .then((response) => response.json())
      .then((result) => {
        logged_in = result.logged_in;
      });

    // edit the post only if created_by is logged in user
    edit.addEventListener("click", () => {
      if (logged_in == created_by.innerHTML) {
        document.querySelector("#profile_info").style.display = "none";
        document.querySelector("#allposts_view").style.display = "none";
        document.querySelector("#ffcontainer").style.display = "none";
        document.querySelector("#edit_post").style.display = "block";

        // load previously created content in edit container
        document.querySelector("#tedit_post").value = content.innerHTML;

        // when edited and clicked in edit button new event is triggerd to edit the post
        document.querySelector("#edit").addEventListener("click", (event) => {
          event.stopPropagation();
          event.preventDefault();
          let new_content = document.querySelector("#tedit_post").value;

          // now change the post content with put request
          fetch("/handle", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ "post_content": new_content, "prev_content": content.innerHTML }),
          })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error(error));
          
          document.querySelector("#index").style.display = "block";
          document.querySelector("#edit_post").style.display = "none";
        });
      } else {
        alert("cannot edit other's post");
      }
    });


    // add event listener to created_by
    visit_profile(created_by);

    // add event listener to like
    
    let liked_status = false;
    like_text.addEventListener("click", () => {
      if (like_text.innerHTML == "like"){
        liked_status = false;
        like_text.innerHTML = "unlike";
      }
      else{
        liked_status = true;
        like_text.innerHTML = "like";
      }

      fetch(`handle/${pid}`,{
        method : "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({"liked_status" : liked_status}),
      })
      .then(response => response.json())
      .then(result => console.log(result));

    })
    
  }
};

// function to handle click on username

const visit_profile = (created_by) => {
  // show info of user whose username is created by

  document.querySelector("#profile_info").style.display = "block";
  document.querySelector("#allposts_view").style.display = "block";

  created_by.addEventListener("click", (event) => {
    fetch(`/profile/${created_by.innerHTML}`)
      .then((response) => response.json())
      .then((result) => {
        show_info(result, created_by.innerHTML, event);
        show_posts(result, event);
        show_following(result, event);
      });
  });
};

// show basic information of user in profile

const show_info = (result, username, event) => {
  event.stopPropagation();

  // get the container from html
  let profile_info = document.querySelector("#profile_info");

  // make a information container
  let info_container = document.createElement("div");

  // clear the profile_info previously created
  profile_info.innerHTML = "";

  let user = document.createElement("p");
  user.innerHTML = username;

  info_container.appendChild(user);

  // now check if this user is logged user or not
  // if logged in user not need to show follow or unfollow button

  // show button only if user is not a logged in user

  if (username != result.logged_in) {
    // create unfollow button
    let button = document.createElement("button");

    // now check logged in user status and add the text of button accordingly

    if (result.followed_by_logged_in == true) {
      button.innerText = "unfollow";
    } else {
      button.innerText = "follow";
    }

    info_container.appendChild(button);
    profile_info.appendChild(info_container);

    // addevent listener to button

    button.addEventListener("click", (event) => {
      if (button.innerText == "follow") {
        // create a new object that follows logged in user
        follow = true;
        button.innerText = "unfollow";
      } else {
        // delete existing object that follows logged in user
        follow = false;
        button.innerText = "follow";
      }
      console.log("button clicked");
      fetch(`/follow_or_unfollow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: follow
          ? JSON.stringify({ follow: user.innerText })
          : JSON.stringify({ unfollow: user.innerText }),
      })
        .then((response) => response.json())
        .then((result) => console.log(result))
        .catch((error) => console.log(error));
    });
  }
};

const returnposts = (event) => {
  // with default this code reloads and all changes are gone
  // to prevent default action following code helps
  event.preventDefault();

  // when returnposts is triggered all posts should be viewed
  document.querySelector("#allposts_view").style.display = "block";

  // when returnposts is triggered all the other views should disappear
  document.querySelector("#ffcontainer").style.display = "none";
  document.querySelector("#following_posts").style.display = "none";
  document.querySelector("#profile_info").style.display = "none";

  fetch("handle/allposts")
    .then((response) => response.json())
    .then((result) => show_posts(result, event))
    .catch((error) => console.log(error));
};

// return posts followed posts
const return_from_followed = (event) => {
  event.preventDefault();

  // remove all the other block and show only following posts
  document.querySelector("#profile_info").style.display = "none";
  document.querySelector("#ffcontainer").style.display = "none";

  document.querySelector("#allposts_view").style.display = "block";

  // list of followings
  let followings_array = [];
  // get followings
  fetch("profile/")
    .then((response) => response.json())
    .then((result) => {
      console.log(result);

      // append username of following user in array
      for (let following of result.followings) {
        followings_array.push(following.followed_to);
      }

      console.log(followings_array);
    });

  // new set of posts
  new_posts = [];
  setTimeout(() => {
    fetch("handle/allposts")
      .then((response) => response.json())
      .then((results) => {
        for (let post of results.posts) {
          if (followings_array.includes(post.created_by)) {
            new_posts.push(post);
          }
        }
        return { posts: new_posts };
      })
      .then((result) => show_posts(result, event));
  }, 500);
};
