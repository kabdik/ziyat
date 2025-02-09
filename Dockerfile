# ---- Build Stage ----
FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Copy the package.json, yarn.lock, and prisma schema files
COPY package.json yarn.lock ./ 
COPY src/database/prisma ./src/database/prisma/

# Install app dependencies including devDependencies
# Prisma will auto-generate types during this step in a post-install hook
RUN yarn install --frozen-lockfile

# Copy all source files
COPY . .

# Build the application
RUN yarn build

# ---- Release Stage ----
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json, yarn.lock and the built code from the previous stage
COPY package.json yarn.lock ./
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Install only production dependencies
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline && yarn cache clean

# Command to run the application
CMD ["yarn", "start:prod"]
