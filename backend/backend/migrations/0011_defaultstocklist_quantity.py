# Generated by Django 5.0.1 on 2024-10-10 08:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_defaultstocklist'),
    ]

    operations = [
        migrations.AddField(
            model_name='defaultstocklist',
            name='quantity',
            field=models.IntegerField(default=1),
        ),
    ]
