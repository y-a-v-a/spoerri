FROM node:16-slim AS base

RUN mkdir /home/app

WORKDIR /home/app

COPY ./package*.json ./

RUN apt-get update && apt-get install -y python3 build-essential libgd-dev \
  && rm -rf /var/lib/apt/lists/*

RUN npm i



FROM node:16-slim AS spoerri

RUN apt-get update && apt-get install -y libgd3 \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/app

WORKDIR /home/app

COPY --from=base /home/app ./

COPY . .

EXPOSE 8080

ENV DEBUG_COLORS=false
ENV DEBUG=spoerri:*

USER node

CMD [ "node", "./app.js" ]
