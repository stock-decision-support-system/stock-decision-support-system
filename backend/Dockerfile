# docker_tutorial/backend/Dockerfile
FROM python:3.11
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
RUN pip install gunicorn gevent
RUN python manage.py makemigrations
RUN python manage.py migrate --fake
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--worker-class=gevent", "--workers=5", "--worker-connections=1000"]