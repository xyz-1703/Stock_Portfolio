# Frontend Updates - Multiple Portfolios Support

## Overview
The React frontend has been updated to support the new multiple portfolios feature. Users can now create, manage, and switch between different investment portfolios directly from the UI.

## New Components Created

### 1. PortfolioList.js
Displays all user portfolios with the ability to select and delete them.

**Features:**
- Lists all active portfolios
- Shows stock count for each portfolio
- Select portfolio to view its stocks
- Delete portfolio with confirmation
- Auto-selects first portfolio if available

**Props:**
- `selectedPortfolioId` - Currently selected portfolio ID
- `onSelectPortfolio` - Callback when selecting a portfolio
- `onRefresh` - Trigger to refresh the list

**Usage:**
```jsx
<PortfolioList
  selectedPortfolioId={selectedPortfolioId}
  onSelectPortfolio={setSelectedPortfolioId}
  onRefresh={portfolioRefresh}
/>
```

### 2. PortfolioCreate.js
Form component for creating new portfolios.

**Features:**
- Portfolio name input (required)
- Portfolio description input (optional)
- Form validation
- Success/error handling
- Collapsible form toggle

**Props:**
- `onCreated` - Callback when portfolio is successfully created

**Usage:**
```jsx
<PortfolioCreate onCreated={handlePortfolioCreated} />
```

## Updated Components

### 1. App.js
Main app component with portfolio management integration.

**New State:**
- `selectedPortfolioId` - Currently selected portfolio
- `portfolioRefresh` - Trigger for portfolio list refresh

**New Functions:**
- `handlePortfolioCreated()` - Updates portfolio list when new portfolio is created

**Layout Changes:**
- Portfolio tab now shows sidebar + main content layout
- Sidebar has portfolio list and create form
- Main area shows selected portfolio or empty state
- Browse tab now passes `portfolioId` to StockList

### 2. Portfolio.js
Updated to work with specific portfolio IDs and handle the new API response structure.

**Changed Props:**
- Now accepts `portfolioId` (new)
- Added `onPortfolioUpdate` callback

**Key Updates:**
- Fetches specific portfolio with `/api/portfolio/{portfolioId}/`
- Properly handles new API response with `stocks` array
- Passes `portfolio_id` when removing stocks
- Shows portfolio description if available

### 3. StockList.js
Updated to support adding stocks to specific portfolios.

**Changed Props:**
- Added `portfolioId` parameter (optional)

**Key Updates:**
- When `portfolioId` is provided, includes it in add-stock requests
- Falls back to default portfolio if `portfolioId` not provided

## User Workflow

### Creating a Portfolio
1. Click "Portfolio" tab
2. Click "New Portfolio" button in left sidebar
3. Enter portfolio name (required) and description (optional)
4. Click "Create"
5. New portfolio appears in sidebar and is automatically selected

### Switching Between Portfolios
1. Click "Portfolio" tab
2. Click portfolio name in left sidebar
3. Stocks in that portfolio display in main area

### Adding Stocks to Portfolio
**Method 1 - From Browse Tab:**
1. Go to "Browse" tab
2. Make sure a portfolio is selected in the sidebar (if available)
3. Select a sector
4. Click "Add to Portfolio" on any stock
5. Stock is added to the selected portfolio

**Method 2 - From Portfolio Detail:**
1. Select portfolio from sidebar
2. Go to "Browse" tab
3. The selected portfolio is automatically used when adding stocks

### Removing Stocks from Portfolio
1. Go to "Portfolio" tab
2. Select the portfolio
3. Click "Remove" button on any stock card
4. Stock is removed from that portfolio

### Deleting a Portfolio
1. Go to "Portfolio" tab
2. Click trash icon on portfolio name in sidebar
3. Confirm deletion
4. Portfolio is marked as inactive (soft delete)

## API Integration

### Endpoints Used

**List Portfolios:**
```
GET /api/portfolios/
```

**Create Portfolio:**
```
POST /api/portfolios/create/
Body: { name, description }
```

**Get Portfolio Stocks:**
```
GET /api/portfolio/{portfolioId}/
```

**Add Stock:**
```
POST /api/add-stock/
Body: { stock_id, portfolio_id, quantity }
```

**Remove Stock:**
```
POST /api/remove-stock/
Body: { portfolio_id, stock_id }
```

**Delete Portfolio:**
```
DELETE /api/portfolios/{portfolioId}/delete/
Query: ?permanent=true (optional)
```

## Component Structure

```
App
├── Header (Navigation)
├── Main Content
│   ├── Home Page
│   ├── Browse Page
│   │   ├── SectorList (sidebar)
│   │   └── StockList (main)
│   └── Portfolio Page
│       ├── PortfolioList (sidebar)
│       │   ├── PortfolioCreate
│       │   └── Portfolio items
│       └── Portfolio (main content)
```

## State Management

**App.js State:**
- `activeTab` - Current tab (home, browse, portfolio)
- `selectedPortfolioId` - Selected portfolio ID
- `portfolioRefresh` - Counter to trigger list refresh
- `selectedStockSymbol` - Stock detail view
- `sectorId` - Selected sector for browsing

## Styling

All new components follow the existing design system:
- Dark theme (slate gray background)
- Blue accent colors
- Hover effects and transitions
- Responsive grid layouts
- Lucide icons for UI elements

## Error Handling

All components include:
- Network error messages
- Validation error alerts
- Success notifications
- Loading states with spinners
- Fallback UI for empty states

## Browser Compatibility

Works with all modern browsers supporting:
- React 16.8+
- ES6+ JavaScript
- CSS Grid and Flexbox
- Fetch API

## Performance Optimizations

- Lazy loading of portfolio data
- Pagination in stock lists
- Memoized filtered stock lists
- Single API call when switching portfolios
- Debounced success/error messages

## Testing Scenarios

### Scenario 1: First Time User
1. Click Portfolio tab
2. See "No portfolios created yet" message
3. Click "New Portfolio"
4. Create "My First Portfolio"
5. See empty portfolio message
6. Go to Browse tab
7. Add some stocks
8. View in Portfolio tab

### Scenario 2: Multiple Portfolios
1. Create "Growth Portfolio"
2. Create "Dividend Portfolio"
3. Create "Conservative Portfolio"
4. Switch between them
5. Add different stocks to each
6. Verify stocks are specific to portfolio

### Scenario 3: Stock Management
1. Select a portfolio
2. From Browse tab, add 5 stocks
3. View in Portfolio tab
4. Remove 2 stocks
5. Verify removal worked
6. Delete portfolio
7. Verify it's gone from sidebar

## Troubleshooting

### Portfolio not appearing
- Refresh the page
- Check browser console for errors
- Verify backend API is running

### Can't add stocks
- Make sure you've selected a portfolio first
- Check if portfolio has stocks (browse tab)
- Verify API response status

### Stocks not showing
- Wait for loading to complete
- Try switching portfolios
- Check network tab in DevTools

## Future Enhancements

Possible improvements:
- Portfolio statistics (total value, performance)
- Drag-and-drop between portfolios
- Portfolio comparison view
- Export portfolio data
- Portfolio performance charts
- Stock allocation pie charts

---

**Updated:** March 3, 2026  
**Frontend Version:** 2.0 (Multiple Portfolios Support)
