# ----- Build -----

FROM node:15.14.0 AS build
# never run as root
USER node
WORKDIR /usr/src/app
ENV NODE_ENV=development
COPY --chown=node:node tsconfig.json .
COPY --chown=node:node package*.json .
COPY --chown=node:node public_config.json .
COPY --chown=node:node src src
# install nodemon, all dependencies and then build the app
RUN npm install && npx tsc


# ----- Production -----

FROM node:15.14.0-alpine3.10 AS production
# we need dumb-init to receive all the signals, for example SIGTERM
RUN apk add dumb-init
# set environment to production for smaller size and better performance
ENV NODE_ENV=production
# never run as root
USER node
WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci --only=production
# copy the dist directory with the correct rights
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/public_config.json .
EXPOSE 8080
# run
CMD [ "dumb-init", "node", "dist/main.js" ]


# ----- Development -----

FROM node:15.14.0 AS dev
# never run as root
USER node
WORKDIR /usr/src/app
ENV NODE_ENV=development
COPY --chown=node:node tsconfig.json .
COPY --chown=node:node nodemon.json .
COPY --chown=node:node public_config.json .
COPY --chown=node:node package*.json .
COPY --chown=node:node src src
# install nodemon, all dependencies and then build the app
RUN npm install && npx tsc
EXPOSE 8080
# start nodemon to reload app on file changes
CMD [ "npx", "nodemon" ]
