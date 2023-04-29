# Twitter-like App

This is a Twitter-like app that allows users to create an account, post messages, follow other users, and view their timelines.

## Technologies Used
This app was built using the following technologies:

- Django - Python web framework
- JavaScript - Client-side programming language
- HTML - Markup language for building the front-end of the app
- CSS - Styling language for the front-end of the app

## Features
- User registration and authentication system
- User profile pages
- view others users profile and timeline 
- Following and unfollowing other users
- Edit created posts
- like and unlike posts

## Installation
1. Clone the repository: git clone https://github.com/code002-ZeroTwo/web-programming.git
2. Create a virtual environment: python -m venv env
3. Activate the virtual environment: source env/bin/activate
4. Install dependencies: pip install -r requirements.txt
5. Run migrations: python manage.py makemigrations && python manage.py migrate
6. Create a superuser: python manage.py createsuperuser
7. Run the server: python manage.py runserver
8. Access the app at http://localhost:8000/
9. visit the admin panel at http://localhost:8000/admin

## you can also run the application by using docker
## Prerequisites
- To run this project using Docker, you will need to have Docker installed on your machine. You can download Docker [here](https://www.docker.com/get-started/).

## Using docker-compose
- you can use docker-compose to build and run the application. To do so, follow these steps:
    - Change into the project directory:
        ```cd my-django-project```
    - Run the docker-compose command:
        ```docker-compose up```

## Usage
1. Create an account by clicking on the "Sign up" link on the homepage.
2. Log in using your username and password.
3. Post messages by typing in the text box and clicking on "Post".
4. Follow and unfollow other users by going to their profile pages and clicking on the appropriate button.
5. Edit your own posts by clicking on edit this post text
6. like and unlike post with like and unlike button 

## Credits
This project was created by code002-ZeroTwo.