# Debre Iyesus Church Website

A comprehensive church management system combining a public-facing website with member management capabilities.

## Features

### Public Website
- **Church Information Display**: Name, address, contact details, pastor information
- **News & Announcements**: Publish news articles and updates
- **Events Calendar**: Upcoming events and service times
- **Photo Gallery**: Church photos and memories

### Admin Dashboard
- **Church Info Management**: Update all church information (requires super admin)
- **Content Management**: Create and edit news, events, and photos
- **Members Management**: Full CRUD operations for church members
- **SMS Communication**: Send bulk SMS to members (requires Azure Communication Services)
- **Kontingent Tracking**: Monthly membership fee tracking
- **Admin Management**: Create and manage admin users (requires super admin)

## Tech Stack

**Backend:**
- Node.js with Express
- PostgreSQL database
- JWT authentication
- Azure Communication Services (for SMS)
- Cloudinary (optional, for image uploads)

**Frontend:**
- Vue 3 with Vue Router
- Vite for development
- Axios for API calls

## Project Structure

```
debre-iyesus/
├── backend/
│   ├── server.js              # Main backend server (unified)
│   ├── schema.sql             # Database schema
│   ├── generate-admin.js      # Admin password hash generator
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── views/            # Vue components
│   │   ├── services/         # API service layer
│   │   └── router.js         # Vue Router configuration
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- PostgreSQL (v12 or later)
- npm or yarn

### Database Setup

1. **Create PostgreSQL Database:**
   ```bash
   createdb debre_iyesus_db
   ```

2. **Run the schema:**
   ```bash
   psql -d debre_iyesus_db -f backend/schema.sql
   ```

3. **Generate admin password hash:**
   ```bash
   cd backend
   npm install
   node generate-admin.js
   ```
   Copy the generated hash and update the schema.sql file, then re-run the INSERT statement for the admin user.

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A random secret key for JWT tokens
   - `FRONTEND_URL`: Your frontend URL (default: http://localhost:5190)
   - `AZURE_COMMUNICATION_CONNECTION_STRING`: (Optional) For SMS features
   - `AZURE_SMS_SENDER_ID`: (Optional) Your SMS sender ID

3. **Start the backend server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```
   The server will run on http://localhost:3010

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **The `.env` file is already configured:**
   ```
   VITE_API_URL=http://localhost:3010/api
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5190

## Default Login Credentials

**Username:** `admin`
**Password:** `admin123`

**⚠️ IMPORTANT:** Change the default password immediately after first login!

## API Endpoints

### Public Routes
- `GET /api/church` - Get church information
- `GET /api/news` - Get published news articles
- `GET /api/events` - Get upcoming events
- `GET /api/photos` - Get gallery photos

### Authentication
- `POST /api/auth/login` - Admin login (unified endpoint)

### Admin Routes (require authentication)
- `GET /api/admin/dashboard` - Get dashboard statistics
- `PUT /api/admin/church-info` - Update church info (super admin only)
- `POST /api/admin/upload-logo` - Upload church logo (super admin only)
- `GET /api/admin/news` - Get all news
- `POST /api/admin/news` - Create news
- `PUT /api/admin/news/:id` - Update news
- `DELETE /api/admin/news/:id` - Delete news
- `GET /api/admin/events` - Get all events
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event
- `GET /api/admin/photos` - Get all photos
- `POST /api/admin/photos` - Upload photo
- `DELETE /api/admin/photos/:id` - Delete photo

### Members Routes (require authentication)
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get single member
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member (soft delete)

### SMS Routes (require authentication)
- `POST /api/sms/send` - Send SMS to members
- `GET /api/sms/logs` - Get SMS logs
- `GET /api/sms/stats` - Get SMS statistics

### Kontingent Routes (require authentication)
- `GET /api/kontingent/:month` - Get kontingent for specific month
- `POST /api/kontingent/update` - Update payment status

### Admin Management (require super admin)
- `GET /api/admins` - Get all admins
- `POST /api/admins` - Create admin
- `PUT /api/admins/:id` - Update admin
- `DELETE /api/admins/:id` - Delete admin

## User Roles

### Regular Admin
- Can manage news, events, photos
- Can manage members
- Can send SMS
- Can track kontingent

### Super Admin
- All regular admin permissions
- Can edit church information
- Can manage other admin users
- Identified by `is_super_admin: true` field

## SMS Configuration (Optional)

To enable SMS features, you need an Azure Communication Services account:

1. Create an Azure Communication Services resource
2. Get an Alphanumeric Sender ID (requires registration)
3. Add connection string and sender ID to `.env`:
   ```
   AZURE_COMMUNICATION_CONNECTION_STRING=your_connection_string
   AZURE_SMS_SENDER_ID=YourChurchName
   ```

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Update `DATABASE_URL` with production database
3. Set a strong `JWT_SECRET`
4. Configure CORS `FRONTEND_URL`
5. Run `npm start`

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```
2. Serve the `dist` folder with a web server
3. Update `VITE_API_URL` to point to production backend

## Security Considerations

- Change default admin password immediately
- Use strong JWT secret in production
- Enable HTTPS in production
- Validate all personnummer inputs (11 digits)
- Implement rate limiting for login attempts
- Regular database backups
- Keep dependencies updated

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the system administrator.
