# Stage 1: Build the application
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y build-essential

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy the application code
COPY ./app /app/app

# Stage 2: Create the final image
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from the builder stage
COPY --from=builder /root/.local /root/.local

# Copy the application code from the builder stage
COPY --from=builder /app/app /app/app

# Add the local user's bin to the PATH
ENV PATH=/root/.local/bin:$PATH

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
