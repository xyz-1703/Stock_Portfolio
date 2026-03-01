# Quick Start Guide

## For Windows Users

### 1. Start the Backend (Django)
```bash
# Navigate to project directory
cd Stock_portfolio

# Activate virtual environment
.\env\Scripts\activate

# Navigate to stock_portfolio directory
cd stock_portfolio

# Run the server
python manage.py runserver

# Server will run at: http://127.0.0.1:8000/
```

### 2. Start the Frontend (React) - In a NEW Terminal
```bash
# Navigate to frontend directory
cd Stock_portfolio\frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start

# App will open at: http://localhost:3000/
```

## Interface Overview

### Browse Tab
1. **Left Sidebar**: Select a sector
2. **Main Area**: View stocks in the selected sector
3. **Add Button**: Click to add a stock to your portfolio

### Portfolio Tab
1. **View Holdings**: See all stocks you've added
2. **Quantity**: See how many units you own
3. **Remove Button**: Remove stocks from your portfolio

## Initial Setup Tasks

### Add Sample Data
1. Go to `http://127.0.0.1:8000/admin/`
2. Login with your superuser credentials
3. Add a few sectors (e.g., "Technology", "Finance", "Healthcare")
4. Add stocks with symbols (e.g., "TECH: AAPL", "FIN: JPM")

### Test the App
1. Click on a sector
2. Click "Add to Portfolio" on a stock
3. Go to Portfolio tab to see your holdings
4. Try removing a stock

## Common Issues & Solutions

### Frontend won't load
- Check if Node is installed: `node --version`
- Check if npm packages installed: `npm ls` in frontend directory
- Kill and restart: Press Ctrl+C in terminal, then `npm start` again

### Can't connect to backend
- Check if Django server is running on port 8000
- Check browser console (F12) for CORS errors
- Ensure backend terminal shows "Starting development server"

### Database issues
- Reset database: Delete `db.sqlite3`, then `python manage.py migrate`
- Recreate superuser: `python manage.py createsuperuser`

## Environment Variables

The app uses:
- Backend: `http://127.0.0.1:8000/` (hardcoded)
- Frontend: `http://localhost:3000/` (React default)

Change backend URL in component fetch calls if needed:
- `frontend/src/components/SectorList.js`
- `frontend/src/components/StockList.js`
- `frontend/src/components/Portfolio.js`

## Next Steps

1. Add more sample data to test
2. Customize colors in `frontend/tailwind.config.js`
3. Modify API endpoints as needed
4. Deploy to production (Heroku, AWS, etc.)
