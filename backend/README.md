# AVELUNE — Django REST Backend & Frontend Integration

AVELUNE is a premium luxury e-commerce platform built with **Python 3.14, Django 5.2, Django REST Framework, and SQLite3**, paired with a **React + TypeScript + Vite** frontend.

---

## 1. Architecture Overview

```
ecommerce-project/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # Django auth, Profile model, token authentication, demo user seeding
│   │   ├── catalog/           # Category & Product models, filters (gender, category, collection, price), seeding
│   │   ├── cart/              # Cart & CartItem models with server-side stock & price synchronization
│   │   ├── wishlist/          # Wishlist & WishlistItem models
│   │   ├── promotions/        # Promotion model (percentage & fixed discount coupons, offers)
│   │   ├── orders/            # Order & OrderItem models with authoritative server checkout calculations
│   │   ├── payments/          # Razorpay payment gateway boundary & signature verification
│   │   └── recommendations/   # Multi-factor styling recommendation engine & Gemini boundary
│   ├── config/                # Django core settings (CORS, REST Framework, SQLite, modular apps)
│   ├── tests/                 # 29 automated test cases covering all apps and boundaries
│   ├── venv/                  # Python virtual environment
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── components/        # Luxury storefront components, navigation, shopping bag, modals
    │   ├── context/           # StoreContext, AuthContext, AssistantContext
    │   ├── pages/             # Storefront, Collections, Offers, Cart, Checkout, Account, Orders
    │   └── services/          # api.ts, paymentService.ts, authService.ts, productRecommendationService.ts
    └── package.json
```

---

## 2. Quickstart Guide (macOS / Linux)

### Backend Setup

1. **Activate the Virtual Environment & Navigate to Backend**:
   ```bash
   cd ecommerce-project/backend
   source venv/bin/activate
   ```

2. **Verify Migrations & Seeded Data**:
   ```bash
   python manage.py migrate
   python manage.py seed_catalog
   python manage.py seed_demo_user
   python manage.py seed_promotions
   ```

3. **Run the Django Development Server**:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   The backend API will be available at `http://127.0.0.1:8000/api/`.

4. **Run Automated Test Suite (29 Tests)**:
   ```bash
   python manage.py test tests
   ```

---

### Frontend Setup

1. **Open a New Terminal and Navigate to Frontend**:
   ```bash
   cd ecommerce-project/frontend
   ```

2. **Start the Vite Frontend**:
   ```bash
   npm run dev
   ```
   The storefront will be available at `http://localhost:5173/`.

---

## 3. Demo & Admin Credentials

- **Customer Demo Account**:
  - Email: `demo@avelune.com`
  - Password: `Avelune@123`
  - Name: Ayush Kumar

- **Atelier Superuser / Admin**:
  - Email: `admin@avelune.com`
  - Password: `Admin@123`
  - Admin Portal: `http://127.0.0.1:8000/admin/`

- **Active Seasonal Privilege Codes**:
  - `AVELUNE10`: 10% off entire order subtotal
  - `ATELIER15`: 15% off orders with subtotal $\ge$ ₹5,000

---

## 4. Payment Gateway & AI Stylist Boundaries

Both external integrations are built using clean, robust architectural boundaries:

### Razorpay Payment Integration
- **Current Status**: Running in **Sandbox Mode** awaiting live merchant credentials.
- **Environment Placeholders** in `backend/.env`:
  ```ini
  RAZORPAY_KEY_ID=your_razorpay_key_id_here
  RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
  RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
  ```
- **Behavior**:
  - When credentials are not yet configured or placeholder values are present, the backend gracefully produces diagnostic responses (`"Payment gateway awaiting live credentials in .env. Running in sandbox mode."`), simulates order creation, and accepts test signatures (`test_sandbox_signature`) so the checkout experience remains completely functional end-to-end.
  - When real keys are added, it automatically switches to live Razorpay Orders API calls and HMAC-SHA256 signature verification.

### Gemini AI Stylist Integration
- **Current Status**: Running with **Deterministic SQLite Multi-Factor Recommendation Engine** awaiting user Gemini API key.
- **Environment Placeholder** in `backend/.env`:
  ```ini
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
- **Behavior**:
  - Queries active, in-stock products from the SQLite database.
  - Scores products based on occasion (Wedding, Office, Everyday, Vacation, etc.), budget range, gender filter, and style preferences (Minimal, Classic, Elegant, etc.).
  - Returns categorized recommendations: `bestMatches`, `withinBudget`, `similarStyles`, `completeTheLook`, and personalized rationale copy.
  - Diagnostic indicator: `"Gemini AI Stylist awaiting GEMINI_API_KEY in .env. Serving rule-based deterministic styling recommendations."`

---

## 5. API Reference Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/` | GET | API directory & status check |
| `/health/` | GET | Service & database health status |
| `/api/auth/register/` | POST | Customer registration |
| `/api/auth/login/` | POST | Token login |
| `/api/auth/send-otp/` | POST | Dispatch secure 6-digit Email OTP to Gmail/Official work email |
| `/api/auth/verify-otp/` | POST | Verify 6-digit OTP & auto-login / provision client |
| `/api/auth/google/` | POST | Google OAuth authentication & token issue |
| `/api/auth/me/` | GET | Current authenticated profile |
| `/api/products/` | GET | Catalog search, gender/category/collection/price filters, sorting |
| `/api/products/<id>/` | GET | Product detail |
| `/api/categories/` | GET | Category listing with product counts |
| `/api/cart/` | GET, POST, DELETE | Server cart synchronization |
| `/api/cart/items/<id>/` | PATCH, DELETE | Update or remove item in cart |
| `/api/wishlist/` | GET, POST | Wishlist synchronization |
| `/api/wishlist/items/<prod_id>/` | DELETE | Remove item from wishlist |
| `/api/coupons/validate/` | POST | Validate promotional privilege codes |
| `/api/orders/` | GET, POST | Create order with authoritative server pricing / order history |
| `/api/orders/<id>/cancel/` | POST | Cancel pending or confirmed order |
| `/api/payments/create-order/` | POST | Create order & initialize Razorpay payment order |
| `/api/payments/verify/` | POST | Cryptographically verify HMAC-SHA256 payment signature |
| `/api/payments/status/<id>/` | GET | Order & payment status reconciliation |
| `/api/payments/webhook/` | POST | Razorpay webhook event handler |
| `/api/recommendations/` | POST | Multi-factor style & occasion personalized product recommendations |
