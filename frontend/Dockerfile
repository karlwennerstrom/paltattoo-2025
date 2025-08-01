FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without cache issues
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-optional

# Copy source code
COPY . .

# Build environment variables
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV CI=false

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve
RUN npm install -g serve@14.2.1

WORKDIR /app

# Copy build files
COPY --from=build /app/build ./build

# Railway asigna el puerto dinámicamente
EXPOSE $PORT

# Use correct serve syntax for Railway
CMD ["sh", "-c", "serve -s build -H 0.0.0.0 -p ${PORT:-3000}"]