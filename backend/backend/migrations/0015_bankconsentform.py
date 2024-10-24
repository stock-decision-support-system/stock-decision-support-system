# Generated by Django 5.0.1 on 2024-10-19 01:56

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0014_remove_investment_buytype_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='BankConsentForm',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('form_path', models.FileField(max_length=250, null=True, upload_to='consent_form/')),
                ('create_date', models.DateTimeField(auto_now_add=True)),
                ('available', models.BooleanField(default=False)),
                ('review', models.ForeignKey(db_column='review', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bankconsentform_review', to=settings.AUTH_USER_MODEL)),
                ('username', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bankconsentform_username', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'bank_consent_form',
            },
        ),
    ]
