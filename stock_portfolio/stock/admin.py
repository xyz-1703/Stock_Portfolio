from django.contrib import admin

# Register your models here.
from .models import Sector ,Stock

admin.site.register(Sector)
admin.site.register(Stock)