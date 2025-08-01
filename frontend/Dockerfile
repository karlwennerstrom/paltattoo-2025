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

WORKDIR /app

# Install express for serving
RUN npm install express

# Copy build files
COPY --from=build /app/build ./build

# Create simple server file
RUN cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
EOF

EXPOSE $PORT

CMD ["node", "server.js"]