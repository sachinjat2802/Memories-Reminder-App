FROM node:18-alpine

WORKDIR /usr/Node_Js/

COPY ./package.json ./package.json
RUN npm i
COPY . .

CMD ["npm", "start"]