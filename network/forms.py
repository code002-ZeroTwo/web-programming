from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['post']
        widget = {
            'post' : forms.Textarea(attrs={'placeholder': 'what is new?',
                                           'rows':4,'cols':50})
        }
        labels = {
            'post' : '',
        }


