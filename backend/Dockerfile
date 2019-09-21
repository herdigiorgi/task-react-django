FROM python:3.7.4
RUN mkdir /code
WORKDIR /code
RUN pip install pipenv
COPY Pipfile .
COPY Pipfile.lock .
RUN pipenv install --deploy --system

CMD bash -c "python manage.py migrate && \
    python manage.py loaddata users && \
    python manage.py loaddata task && \
    python manage.py runserver 0.0.0.0:8000" 
