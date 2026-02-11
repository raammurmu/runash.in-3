# Live-Commerce Platform Guide

## Overview
A comprehensive live-commerce platform integrating real-time shopping, livestream commerce, advanced payment systems, and inventory management with seamless real-time updates.

## Platform Architecture

### Core Modules

#### 1. **Live Commerce Hub** (`/livecommerce`)
- Real-time statistics dashboard showing active streams, viewers, and revenue
- Live stream selection interface with performance metrics
- Integration between livestream content and product shopping
- Real-time performance tracking (conversion rates, cart abandonment, customer satisfaction)

**Key Features:**
- Active stream monitoring with viewer counts and revenue tracking
- Quick access to performance metrics
- Stream status indicators with real-time updates
- Revenue overview with progress tracking

---

#### 2. **Livestream Shopping Interface** (Component)
- Integrated video player with featured products showcase
- Live chat functionality for real-time engagement
- Product selection with size/color options
- Interactive product modal for detailed viewing
- Real-time inventory indicators
- Shopping cart integration within livestream

**Features:**
- Featured products carousel with stock indicators
- Live comment feed with timestamp tracking
- One-click add to cart from livestream
- Product detail modal with size/color selection
- Real-time viewer count and streaming status

---

#### 3. **Payment Integration System** (`/ecommerce/payments`)

**Supported Payment Methods:**
- Credit/Debit Cards (Visa, Mastercard, Amex)
- Stripe Payment Integration
- PayPal Commerce
- Cryptocurrency (Bitcoin, Ethereum)

**Custom Payment Links (Stripe-like):**
- Create shareable payment links with custom amounts
- Track link performance (clicks, conversions, conversion rate)
- Support for multiple currencies
- Automatic revenue calculation
- Link analytics dashboard

**Multi-Step Checkout:**
- Payment method selection
- Shipping option selection
- Order review and confirmation
- Success confirmation page

---

#### 4. **Real-Time Shopping Dashboard** (`/ecommerce/dashboard`)

**Inventory Management:**
- Live inventory tracking with real-time updates
- Stock status indicators (Good, Low, Out of Stock)
- Automatic low-stock alerts
- Reserved item tracking
- Available vs. total stock visualization

**Metrics Displayed:**
- Total Stock Value
- Orders Today
- Low Stock Items Count
- Reserved Items Count

**Features:**
- Real-time inventory table with status indicators
- Recent orders sidebar with order status tracking
- Low stock alerts with reorder functionality
- Automatic sync capability

---

#### 5. **Live Shopping Cart & Checkout** (`/ecommerce/cart`)

**Cart Features:**
- Product quantity management with increment/decrement
- Item removal with one-click delete
- Size and color variant tracking
- Stock availability checking
- Real-time price calculations

**Order Summary:**
- Subtotal calculation
- Shipping cost (free shipping over $100)
- Tax calculation (8% default)
- Promo code application
- Total price display

**Promo Codes:**
- SAVE10: 10% discount
- SUMMER20: 20% discount
- WELCOME15: 15% discount

**Recommendations:**
- AI-powered product recommendations
- Related products with quick add-to-cart
- Personalized suggestions based on cart items

---

#### 6. **Admin Commerce Dashboard** (`/ecommerce/admin`)

**Overview Metrics:**
- Total Revenue with change indicators
- Active Orders count
- Total Customers
- Conversion Rate tracking

**Order Status Overview:**
- Visual progress bars for each status (Pending, Processing, Shipped, Delivered, Cancelled)
- Order count and revenue per status
- Real-time updates

**Top Products:**
- Sales count ranking
- Revenue generation per product
- Trend indicators (↑ up, ↓ down, → stable)
- Quick access to product management

**Recent Transactions:**
- Transaction ID tracking
- Customer names and amounts
- Status indicators (Completed, Pending, Failed)
- Timestamp tracking

**Quick Actions:**
- Manage Inventory
- View Customers
- Filter Orders
- Settings access

---

#### 7. **Real-Time Notifications System** (Component)

**Notification Types:**
- **Orders**: Order shipped, payment received, order status updates
- **Livestream**: Stream starting soon, viewer milestones
- **Inventory**: Stock alerts, items back in stock
- **Promotions**: Exclusive offers, sales announcements
- **System**: Payment confirmations, important updates

**Features:**
- Unread notification badge counter
- Tab filtering (All, Orders, Livestream)
- Notification history with timestamps
- Mark as read functionality
- Quick dismiss/clear options
- Color-coded notification types

**Real-Time Updates:**
- Automatic notification generation
- Time-based update simulation (30-second intervals)
- Toast-style presentation
- Persistent notification center

---

#### 8. **Live Update Feed** (Component)

**Update Types:**
- Order completions with revenue impact
- Revenue updates with percentage change
- New customer acquisition
- Inventory alerts and status
- Livestream viewer count updates

**Features:**
- Auto-scrolling feed with latest updates
- Real-time value changes
- Automatic update generation (8-second intervals)
- Max 9 visible updates with historical tracking
- Timestamp tracking for all events
- Color-coded update categories

---

## Page Structure

```
/ecommerce/
├── page.tsx                    # Main marketplace
├── livecommerce/
│   └── page.tsx                # Live commerce hub
├── dashboard/
│   └── page.tsx                # Shopping dashboard
├── orders/
│   └── page.tsx                # Order management
├── payments/
│   └── page.tsx                # Payment integration
├── cart/
│   └── page.tsx                # Shopping cart & checkout
├── admin/
│   └── page.tsx                # Admin dashboard
├── profile/
│   └── page.tsx                # User profile
├── wishlist/
│   └── page.tsx                # Wishlist management
├── invoices/
│   └── page.tsx                # Invoice management
├── shipping/
│   └── page.tsx                # Shipping & logistics
├── watch/
│   └── page.tsx                # Video content
├── history/
│   └── page.tsx                # Order history
├── analytics/
│   └── page.tsx                # Analytics
└── notifications/
    └── page.tsx                # Notification center
```

## Component Library

### Core Components Used
- `Card` - Container components
- `Button` - Action buttons
- `Input` - Form inputs
- Icons from `lucide-react` for UI elements

### Custom Components
1. **CommerceNav** - Navigation hub for all commerce pages
2. **LiveStreamShoppingInterface** - Integrated shopping + streaming
3. **StripeLinkPayment** - Multi-step payment checkout
4. **RealTimeNotifications** - Notification center
5. **LiveUpdateFeed** - Real-time event stream
6. Plus all previously built components (order tracking, logistics, media players, etc.)

---

## Design System

### Color Scheme
- **Primary**: Orange (#FF6B35, #FF7A50)
- **Background**: Slate (#0F172A, #1E293B)
- **Accent**: Various (Green for success, Red for alerts, Blue for info, Purple for highlights)
- **Text**: White/Light gray on dark backgrounds

### Typography
- Headings: Bold, 2xl-4xl sizes
- Body: Regular, sm-base sizes
- Emphasis: Font-bold, uppercase for labels

### Spacing
- Padding: 4px-8px units (Tailwind scale)
- Gaps: 4px-8px units
- Responsive: Mobile-first with md/lg breakpoints

---

## Real-Time Features

### Live Updates
- Inventory sync capability
- Real-time viewer counts
- Order status updates
- Revenue tracking
- Notification generation
- Feed auto-refresh

### Performance Tracking
- Conversion rate monitoring
- Cart abandonment tracking
- Customer satisfaction metrics
- Revenue per stream
- Product performance ranking

---

## Integration Points

### Payment Integrations
- Stripe Connect
- PayPal Commerce
- Custom payment links
- Multiple currency support

### Inventory Management
- Real-time stock tracking
- Automatic low-stock alerts
- Reserved item management
- Multi-warehouse support (scalable)

### Order Management
- Order status tracking
- Shipment integration
- Payment status monitoring
- Customer notifications

---

## User Flows

### Customer Journey
1. Browse main marketplace
2. Select live commerce stream
3. Watch livestream + browse products
4. Add items to cart
5. Proceed to checkout
6. Select payment method
7. Choose shipping option
8. Complete purchase
9. Receive notifications for order status

### Admin Workflow
1. Access admin dashboard
2. Monitor real-time metrics
3. Review orders and transactions
4. Manage inventory
5. Track top products
6. Generate reports
7. Take action on alerts

---

## API Endpoints (Future Implementation)

```
GET /api/ecommerce/products           # Product listing
GET /api/ecommerce/livestreams        # Active streams
POST /api/ecommerce/orders            # Create order
GET /api/ecommerce/inventory          # Stock levels
POST /api/ecommerce/payments/links    # Create payment link
GET /api/ecommerce/admin/stats        # Dashboard stats
POST /api/ecommerce/notifications     # Create notification
```

---

## Performance Optimization

- Lazy loading for images and components
- Efficient state management with React hooks
- Real-time updates throttled to prevent lag
- Responsive design for all device sizes
- Dark theme optimized for reduced eye strain

---

## Mobile Responsiveness

- All pages responsive on mobile (320px+)
- Touch-friendly buttons and inputs
- Optimized navigation for small screens
- Stack-based layouts on mobile
- Horizontal scroll for long tables on mobile

---

## Future Enhancements

1. **Database Integration**
   - Real product and inventory management
   - User account synchronization
   - Order persistence

2. **Authentication**
   - User login/signup
   - Admin authentication
   - Session management

3. **Advanced Analytics**
   - Detailed sales reports
   - Customer behavior tracking
   - Predictive analytics

4. **Integrations**
   - Real Stripe/PayPal integration
   - Shipping provider APIs
   - Email notifications
   - SMS alerts

5. **Scalability**
   - Multi-warehouse support
   - Global currency support
   - Multi-language interface
   - CDN for media delivery

## API Envelope Standardization & `/api/v1` Compatibility (2026 update)

RunAsh now provides a shared response envelope for stabilized external API contracts:

```json
{
  "success": true,
  "data": { "...": "payload" },
  "error": null,
  "requestId": "req_...",
  "meta": { "...": "optional" }
}
```

For failures:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { "...": "optional" }
  },
  "requestId": "req_..."
}
```

### Stabilized namespace

New stabilized routes are available under `/api/v1` for high-impact domains:
- `/api/v1/auth/register`
- `/api/v1/payment/create-intent`
- `/api/v1/seller/settings`
- `/api/v1/chat`
- `/api/v1/analytics`

### Backward compatibility behavior

Legacy routes remain available at their current non-versioned paths. During migration, legacy response fields remain present for compatibility while clients can adopt envelope fields (`success`, `data`, `error`, `requestId`) incrementally.

Migration guidance:
1. Prefer `/api/v1/*` for new integrations.
2. Read `requestId` for end-to-end tracing.
3. Use `error.code` for programmatic handling instead of brittle message matching.
4. Move payload reads to `data` while keeping legacy field fallbacks during rollout.
