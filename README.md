# Reservations API

System for managing apartment reservations with file processing capabilities.

## Prerequisites

- Docker and Docker Compose
- Node.js 22+ (for local development)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reservations
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   npm run docker:up
   ```

4. **Access the application**
    - API: http://localhost:3000
    - Swagger Documentation: http://localhost:3000/api

4. **Test files**
   - in the root catalog you can find 3 files for testing: `reservations.xslx`, `reservations_2.xslx`, `reservations_errors.xslx`
   - `reservations.xslx` should add one row into database for the first run
   - `reservations_2.xslx` should update one row in database for the first run
   - `reservations_errors.xslx` should cause validation errors and add error reports

## Development

### Local Development
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start dependencies only**
   ```bash
   docker-compose up mongo redis -d
   ```

3. **Start in development mode**
   ```bash
   npm run start:dev
   ```

### With Docker
1. **Build and start all services**
   ```bash
   npm run docker:up
   ```
2. **View logs**
   ```bash
   npm run docker:logs
   ```

3. **Stop services**
   ```bash
   npm run docker:down
   ```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `PROCESS_NAME`: Process name
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `LOG_LEVEL`: Logging level

## API Endpoints

- `POST /tasks/upload` - Upload XLSX file for processing
- `GET /tasks/status/:taskId` - Get task status
- `GET /tasks/report/:taskId` - Download processing report
- `GET /health` - Health check

## File Format

XLSX files should contain columns:
- `reservation_id`
- `guest_name`
- `status` (oczekująca/zrealizowana/anulowana)
- `check_in_date`
- `check_out_date`