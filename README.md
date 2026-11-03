# AVELUNE — Premium Lifestyle & Fashion Storefront

A modern luxury D2C e-commerce storefront for **AVELUNE**, designed with a quiet luxury aesthetic inspired by timeless architectural restraint, honest materiality, and tactile warmth.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Framer Motion**.

---

## 📁 Repository Structure

```
ecommerce-project/
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── brand.ts
│   │   ├── components/
│   │   │   ├── account/
│   │   │   │   └── AuthenticatedHeader.tsx
│   │   │   ├── auth/
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── AuthBrand.tsx
│   │   │   │   ├── AuthTextField.tsx
│   │   │   │   ├── PasswordField.tsx
│   │   │   │   ├── PasswordStrengthIndicator.tsx
│   │   │   │   ├── SocialAuthButton.tsx
│   │   │   │   ├── AuthDivider.tsx
│   │   │   │   ├── AuthFooter.tsx
│   │   │   │   ├── AuthFeedbackMessage.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── AnnouncementBar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── WishlistDrawer.tsx
│   │   │   ├── SearchOverlay.tsx
│   │   │   ├── QuickViewModal.tsx
│   │   │   └── ToastNotification.tsx
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   ├── NewArrivalsSection.tsx
│   │   │   ├── FeaturedCollection.tsx
│   │   │   ├── BrandStorySection.tsx
│   │   │   ├── BestsellersSection.tsx
│   │   │   ├── LookbookSection.tsx
│   │   │   ├── BrandValuesSection.tsx
│   │   │   └── NewsletterSection.tsx
│   │   ├── layouts/
│   │   │   ├── RootLayout.tsx
│   │   │   └── AccountLayout.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── account/
│   │   │       ├── AccountHomePage.tsx
│   │   │       ├── OrdersPage.tsx
│   │   │       ├── WishlistPage.tsx
│   │   │       └── ProfilePage.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   └── demoAuthService.ts
│   │   ├── context/
│   │   │   ├── StoreContext.tsx
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useStore.ts
│   │   │   └── useAuth.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── auth.ts
│   │   ├── utils/
│   │   │   └── currency.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── backend/
    └── README.md
```

---

## 🔑 Demo Authentication & Private Client Credentials

For testing and presentation evaluation, centralized demo credentials are built into the frontend:

- **Demo Email**: `demo@avelune.com`
- **Demo Password**: `Avelune@123`
- **Client Name**: `Ayush`
- **Member Tier**: `Atelier Private Client`

On the `/login` screen, users can enter these credentials or click the **"Autofill"** pill to instantly populate them.

- Successful sign-in redirects to `/account/home` with a personalized greeting: *"Welcome back, Ayush."*
- Invalid credentials preserve the email input and display an inline error: *"Invalid email or password. Please try again."*
- Demo session is persisted safely in `localStorage` without plaintext passwords.
- `/account/*` routes are protected by `ProtectedRoute`. Unauthenticated users are redirected to `/login`.

---

## 🎨 Visual Identity & Color Palette

| Color Name | Hex Code | Usage |
|---|---|---|
| **Warm Ivory** | `#F8F6F1` | Primary background, clean spacious surfaces |
| **Soft Cream** | `#EFE9DF` | Secondary containers, image backdrops, accents |
| **Champagne Beige** | `#D8C6AA` | Accents, badges, active hover lines |
| **Deep Charcoal** | `#242522` | Primary typography, CTA buttons, luxury footer |
| **Muted Olive** | `#777B63` | Editorial labels, organic badges, subtle icons |
| **Subtle Border** | `#E4DED4` | Restrained architectural dividers |
| **Pure White** | `#FFFFFF` | Elevated cards and modal surfaces |

**Typography**:
- Editorial Serif: **Cormorant Garamond** (Google Fonts)
- Interface Sans: **Plus Jakarta Sans** (Google Fonts)

---

## ✨ Features & Functionality

1. **Sticky Navigation & Header**:
   - Wordmark with subtle scroll backdrop transition
   - Slide-in mobile menu drawer with smooth Framer Motion transitions
   - Live badge counters for Wishlist and Shopping Bag
   - Quick account status indicator

2. **Cinematic Hero**:
   - Asymmetrical editorial layout with rich negative space
   - Staggered entrance animation
   - Editorial tags and collection highlights
   - Responsive portrait crops for mobile devices

3. **Shop by Category ("Find Your Everyday")**:
   - 4 image-led category cards with varied editorial aspect ratios
   - Interactive zoom & hover arrow reveals
   - Smooth filter connection to the product catalog

4. **Featured Collection ("Pieces Worth Keeping")**:
   - Category filtering pills ("All Pieces", "Everyday Essentials", "Contemporary Living", "Modern Accessories", "The Signature Collection")
   - Sorting options: Curated, Price Low-High, Price High-Low, Rating, New Arrivals
   - Product cards with dual image crossfade hover, badges, INR pricing, wishlist heart toggle, and Quick View

5. **Quick View Modal**:
   - High-resolution gallery with thumbnail switcher
   - Size selector, color swatch selector, and quantity counter
   - Direct add-to-bag interaction with animated feedback

6. **Functional Shopping Cart Drawer**:
   - Slide-in drawer with backdrop blur
   - Dynamic item quantity adjustment & removal
   - Subtotal in Indian Rupees (₹)
   - Interactive Free Shipping Progress Bar (calculated against ₹1,999 threshold)
   - Privilege discount code support (try `AVELUNE10` for 10% off)
   - LocalStorage synchronization

7. **Saved Pieces / Wishlist Drawer**:
   - One-click heart toggle on every card
   - Dedicated wishlist drawer with "Move to Bag" functionality
   - LocalStorage persistence

8. **Live Search Overlay**:
   - Full-width modal search with suggested inquiries
   - Instant multi-field search across product names, categories, descriptions, and tags
   - Instant quick-add and quick-view actions from search results

9. **Editorial Lookbook & Journal**:
   - Magazine-style multi-image layout celebrating volume releases and artisanal philosophy

10. **Newsletter Subscription**:
    - Client-side regex email validation with dedicated success and error states

11. **Future Backend & Personalization Readiness**:
    - Strictly typed interfaces (`Product`, `CartItem`, `Wishlist`, `Category`)
    - Decoupled mock dataset in `src/data/products.ts` designed for seamless swap with future REST/GraphQL endpoints without UI refactoring

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+` or `v20+`
- npm `v9+` or `v10+`

### Installation & Local Development

1. Navigate to the frontend directory:
   ```bash
   cd ecommerce-project/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:5173/`.

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

