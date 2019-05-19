FROM node:6.10

# Create app directory
RUN mkdir -p /opt/graphql
WORKDIR /opt/graphql/

# Install yarn package manager
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Install app dependencies
COPY package.json /opt/graphql/
RUN ~/.yarn/bin/yarn install

# Bundle app source
COPY . /opt/graphql/
RUN ~/.yarn/bin/yarn build

EXPOSE 8080

CMD node ./build/server.js
