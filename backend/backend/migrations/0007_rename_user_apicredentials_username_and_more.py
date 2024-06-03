# Generated by Django 5.0.1 on 2024-06-01 07:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0006_apicredentials_available_asset_available_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='apicredentials',
            old_name='user',
            new_name='username',
        ),
        migrations.AlterField(
            model_name='apicredentials',
            name='ca_path',
            field=models.FileField(default=None, max_length=250, null=True, upload_to='ca_file/'),
        ),
    ]
