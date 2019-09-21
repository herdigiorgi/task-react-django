FROM python:3.7.4
FROM node:12.10
RUN mkdir /code
WORKDIR /code
COPY package.json .
COPY package-lock.json .
RUN npm install

CMD npm start