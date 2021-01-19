FROM node:alpine

WORKDIR /usr/app

RUN npm install --global pm2

COPY ./package*.json ./
RUN npm install --production

COPY ./ ./
RUN npm run build

RUN chmod +x /start.sh

EXPOSE 3000

USER node

CMD ["/start.sh"]