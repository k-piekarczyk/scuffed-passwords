FROM node:alpine

WORKDIR /usr/app

COPY ./package*.json ./
RUN npm install

COPY ./ ./
RUN npm run db:generate
RUN npm run build

RUN chmod +x start.sh
RUN chown -R node:node /usr/app/prisma
RUN chown -R node:node /usr/app/node_modules/@prisma
RUN chown -R node:node /usr/app/node_modules/.prisma

EXPOSE 3000

USER node

CMD ["./start.sh"]