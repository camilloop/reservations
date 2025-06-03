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

## Real-time Task Status Monitoring

The application provides real-time task status updates via WebSocket connection. You can test this functionality using the provided example client:

1. **Open the example client**
   ```bash
   # From the project root directory
   open src/task/examples/websocket-client.html
   ```

2. **Test the WebSocket connection**
   1. Open the browser's developer tools console (F12)
   2. You should see "Connected to WebSocket server" message
   3. Enter a task ID in the input field (you can get it from the upload response)
   4. Click "Subscribe" button
   5. Make a GET request to `/tasks/status/:taskId` for the same task ID
   6. You should see a real-time status update in the client
   7. Try unsubscribing using the "Unsubscribe" button to stop receiving updates

3. **Testing multiple clients**
   - Open the client in multiple browser windows
   - Subscribe to the same task from different clients
   - Verify that all clients receive updates
   - Test disconnection by closing browser windows

4. **WebSocket events**
   - `subscribeToTask` - Subscribe to task updates
   - `unsubscribeFromTask` - Unsubscribe from task updates
   - `taskStatusUpdate` - Receive task status updates

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
- `PORT`: Application port
- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `API_KEY`: API key for authorization
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