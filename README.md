# OurEdu - College Portal

A full-stack college management system built with React, TypeScript, Vite, Express.js, and Firebase.

## Project Structure

```
OurEdu/
├── OurEdu/              # Frontend (React + Vite)
├── backend/             # Backend API (Express.js)
├── api/                 # Vercel Serverless Functions
├── vercel.json          # Vercel deployment config
└── package.json         # Root package configuration
```

## Features

- 🎓 Student & Faculty Management
- 📚 Course Management
- 💰 Payment Integration (Razorpay)
- 🔐 Authentication (JWT)
- 👁️ AI-powered Vision Features (MediaPipe)
- 🔥 Real-time Database (Firebase)

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router
- **Backend**: Express.js, Node.js
- **Database**: MySQL
- **Authentication**: JWT, Firebase
- **Payments**: Razorpay
- **Hosting**: Vercel
- **AI/ML**: MediaPipe Tasks Vision

## Local Development

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/kompari-Anjanna/OurEdu.git
cd OurEdu
```

2. **Install root dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd OurEdu
npm install
```

4. **Install backend dependencies**
```bash
cd ../backend
npm install
```

5. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your actual values
```

6. **Start development servers**

Frontend (from OurEdu directory):
```bash
npm run dev
# Runs on http://localhost:5173
```

Backend (from backend directory):
```bash
npm run dev
# Runs on http://localhost:3000
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
# Firebase
FIREBASE_API_KEY=your_key
FIREBASE_PROJECT_ID=your_project_id

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ouredu_db

# JWT
JWT_SECRET=your_secret_key

# Razorpay
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# Environment
NODE_ENV=production
```

## Vercel Deployment

### Step 1: Push to GitHub
Ensure all changes are committed and pushed:
```bash
git add .
git commit -m "Deployment configuration"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select `kompari-Anjanna/OurEdu`

### Step 3: Configure Environment Variables
In Vercel project settings, add these environment variables:

**Firebase:**
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

**Database:**
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`

**Security:**
- `JWT_SECRET`

**Payments:**
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

**System:**
- `NODE_ENV=production`

### Step 4: Deploy
Click "Deploy" and Vercel will automatically:
1. Install dependencies from `package.json`
2. Build the frontend using `npm run build`
3. Deploy the built files to production
4. Set up serverless functions in `/api`

### Step 5: Verify Deployment
- Check the deployment status in Vercel dashboard
- Visit your domain (https://ouredu.vercel.app)
- Check Vercel logs if there are any build errors

## Available Scripts

**Root Directory:**
```bash
npm run dev      # Start frontend dev server
npm run build    # Build frontend
npm start        # Start API server
```

**Frontend (OurEdu/):**
```bash
npm run dev      # Start Vite dev server
npm run build    # Build with TypeScript & Vite
npm run preview  # Preview production build
```

**Backend (backend/):**
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

## Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE ouredu_db;
```

2. Update `backend/.env` with your database credentials

3. Run migrations (if available in your backend):
```bash
# Add migration commands here
```

## Troubleshooting

### Vercel Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables are set
- Clear cache: `vercel env pull` then redeploy

### API Endpoints Not Working
- Verify backend environment variables
- Check database connection settings
- Review CORS configuration in `api/server.js`

### Database Connection Issues
- Ensure MySQL is running
- Verify credentials in `.env`
- Check firewall rules for database access

### Frontend Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build` (local)
- Verify all imports are correct

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

Apache License 2.0 - See LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review GitHub issues
3. Contact: anjikompari6@gmail.com

---

**Last Updated:** September 14, 2026
**Status:** ✅ Ready for Production
