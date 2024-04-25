from django.shortcuts import render
from rest_framework import viewsets

from books.models import Books
from books.serializer import BooksSerializer

# Create your views here.
class BooksViewSet(viewsets.ModelViewSet):
    queryset = Books.objects.all()
    serializer_class = BooksSerializer