FROM node:22-bookworm

# Install Python and its dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first to leverage caching
COPY package.json package-lock.json ./
RUN npm install

# Copy MCP server package files and install
COPY mcp-server/package.json mcp-server/package-lock.json* ./mcp-server/
RUN cd mcp-server && npm install

# Set up Python virtual environment and install requirements
# The script backend/start-backend.cjs expects .venv to be in the root directory
COPY backend/requirements.txt ./backend/
RUN python3 -m venv .venv && \
    .venv/bin/pip install --upgrade pip && \
    .venv/bin/pip install -r backend/requirements.txt && \
    touch .venv/.installed_requirements

# Copy the rest of the application
COPY . .

# Build MCP server since it requires tsconfig and src files
RUN cd mcp-server && npm run build

# Expose ports
# 5173: Vite frontend
# 8000: FastAPI backend
EXPOSE 5173 8000

# Set environment variables
ENV HOST=0.0.0.0
ENV OLLAMA_HOST=http://host.docker.internal:11434

# Start the application
CMD ["npm", "run", "dev"]
