# Multi-stage Docker build for full-stack deployment
FROM node:18-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY Frontend/Code-Her-Care/afya-kuu/package*.json ./
RUN npm ci
COPY Frontend/Code-Her-Care/afya-kuu/ ./
ENV NEXT_PUBLIC_API_URL=http://localhost:5001
RUN npm run build

# Python backend stage
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python application files
COPY *.py ./
COPY *.pkl ./
COPY *.xlsx ./
COPY *.csv ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Create startup script
RUN echo '#!/bin/bash\n\
python flask_rf_api.py &\n\
cd frontend && npm start &\n\
wait' > start.sh && chmod +x start.sh

EXPOSE 10000

CMD ["./start.sh"]
