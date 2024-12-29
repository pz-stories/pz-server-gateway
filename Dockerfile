# Use the official Node.js image as the base image
FROM node:16

LABEL org.opencontainers.image.source="https://github.com/pz-stories/pz-server-gateway"

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run tsc

ENV INPIPE_FILE_NAME="${ZOMBOID_PATH}/Lua/PZStoriesStats/inpipe"
ENV OUTPIPE_FILE_NAME="${ZOMBOID_PATH}/Lua/PZStoriesStats/outpipe"

CMD ["npm", "run", "exec"]