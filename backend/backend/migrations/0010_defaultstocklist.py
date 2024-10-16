# Generated by Django 5.0.1 on 2024-10-10 08:02

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0009_delete_defaultstocklist'),
    ]

    operations = [
        migrations.CreateModel(
            name='DefaultStockList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stock_symbol', models.CharField(max_length=10)),
                ('stock_name', models.CharField(blank=True, max_length=100, null=True)),
                ('default_investment_portfolio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stocks', to='backend.defaultinvestmentportfolio')),
            ],
            options={
                'db_table': 'default_stock_list',
            },
        ),
    ]
