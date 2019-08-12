FROM node:10.16.0 as builder

RUN mkdir -p /root/src/app
WORKDIR /root/src/app
ENV PATH /root/src/app/node_modules/.bin:$PATH

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

WORKDIR /root/src/app

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /root/src/app/dist /var/www/html
