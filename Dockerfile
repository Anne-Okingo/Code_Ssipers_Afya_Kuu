# Multi-stage build for Python backend
FROM python:3.11-slim as backend

WORKDIR /app

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python application files
COPY *.py .
COPY *.pkl .
COPY *.xlsx .
COPY *.csv .

# Expose port for Flask API
EXPOSE 5001

# Command to run the Flask API
CMD ["python", "flask_rf_api.py"]
