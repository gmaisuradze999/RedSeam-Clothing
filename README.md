RedSeam Clothing - E-commerce Web Application
A modern, responsive e-commerce web application built with vanilla JavaScript, featuring a complete shopping experience from product browsing to checkout.

* Project Overview
RedSeam Clothing is a fully functional e-commerce platform that provides users with a seamless shopping experience. The application features product catalog browsing, detailed product views, user authentication, shopping cart management, and a complete checkout process.

* Features
* Core Shopping Features
Product Catalog - Browse products with pagination and responsive grid layout

Advanced Filtering - Filter products by price range and sort by various criteria

Product Details - Detailed product pages with color/size selection and image galleries

Shopping Cart - Add/remove products, modify quantities, and view cart totals

Checkout Process - Complete order form with validation and order confirmation

* User Management
User Registration - Create new accounts with profile picture upload

User Login - Secure authentication with token-based sessions

Profile Management - Update user information and profile pictures

Session Persistence - Automatic login state maintenance

* User Experience
Responsive Design - Optimized for desktop and mobile devices

Interactive UI - Dynamic cart sidebar, modal dialogs, and smooth transitions

Visual Feedback - Loading states, error messages, and success confirmations

Intuitive Navigation - Breadcrumb navigation and clear user flows

* Technology Stack
Frontend
HTML5 - Semantic markup and page structure

SCSS/CSS - Advanced styling with variables and mixins

Vanilla JavaScript - No framework dependency, pure ES6+

CSS Grid & Flexbox - Modern layout techniques

Styling & Design
Poppins Font Family - Comprehensive typography system

Custom Color Palette - Consistent brand colors throughout

SCSS Mixins - Reusable styling patterns and utilities

Responsive Breakpoints - Mobile-first design approach

API Integration
RESTful API - Communication with backend services

JWT Authentication - Secure user sessions

Fetch API - Modern HTTP requests

FormData - File upload capabilities

* Project Structure
text
redseam-clothing/
├── index.html                 # Main entry point
├── main.js                   # Core application logic
├── style.scss               # Main stylesheet
├── images/                  # Image assets
│   ├── redSeamClothingLogo.svg
│   ├── modelsWalking.svg
│   └── various-icons/
├── src/                     # Source files
│   ├── colors.scss         # Color variables
│   ├── mixins.scss         # SCSS mixins
│   └── fonts.scss          # Font definitions
└── html-pages/             # Dynamic page templates
    ├── products.html
    ├── productPage.html
    ├── checkoutPage.html
    └── auth.html
* Installation & Setup
Prerequisites
Modern web browser with JavaScript enabled

Web server for local development (due to CORS and file loading)

Local Development
Clone or download the project files

Set up a local server (required for proper functionality):

bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
Access the application:
Open your browser and navigate to http://localhost:8000

Production Deployment
Upload all files to a web server

Ensure proper MIME types for .scss files if precompiling

Configure API endpoint URLs if different from development

* How to Use
Browsing Products
Navigate to the products page from the main menu

Use filters to narrow down products by price range

Sort products by price, date, or other criteria

Click on any product to view detailed information

Product Selection
Choose color from available options (updates product images)

Select size from available sizes

Choose quantity from the dropdown

Add to cart to proceed with purchase

Shopping Cart
View cart by clicking the cart icon in the header

Modify quantities using +/- buttons

Remove items using the removal link

Proceed to checkout when ready

User Authentication
Register a new account with email, username, and password

Upload profile picture during registration (optional)

Login with credentials to access personalized features

Maintain session across browser restarts

Checkout Process
Fill in shipping information (name, address, email, zip code)

Review order summary and totals

Complete payment to place order

Receive confirmation with order details

* Key JavaScript Functions
Application Core
main() - Application entry point and initialization

router() - Handles page routing and hash-based navigation

loadingPage() - Dynamic page loading system

Product Management
getProducts() - Fetches product catalog from API

getProduct() - Retrieves individual product details

forwardToProductPage() - Handles product page navigation

loadFilteredProducts() - Manages filtered product displays

Shopping Cart
getCart() - Retrieves user's shopping cart

addProductToCart() - Adds items to cart

updateCartProductQuantity() - Modifies item quantities

productDelete() - Removes items from cart

controlCardContainer() - Manages cart sidebar visibility

User Authentication
auth() - Handles user login

registration() - Manages user registration

initUserInfo() - Initializes user session data

switchLogInRegistration() - Toggles between login/register forms

UI Interactions
fakePlaceholderDisplay() - Custom input placeholder handling

fakeEyeDisplay() - Password visibility toggle

pictureChanger() - Product image and color synchronization

priceFilter() - Product filtering functionality

* Design System
Color Palette
Primary: #ff4000 (ArtyClick Warm Red) - Buttons, accents, active states

Text Primary: #10151f (Cinder) - Main text content

Text Secondary: #3e424a (Bright Grey) - Secondary text

Background: #ffff (White) - Main backgrounds

Light Background: #f8f6f7 (Spring Wood) - Form sections

Borders: #e1dfe1 (Lavender Pinocchio) - Dividers and borders

Typography
Primary Font: Poppins (all weights)

Headings: SemiBold (600) and Bold (700) weights

Body Text: Regular (400) and Medium (500) weights

Small Text: Light (300) for secondary information

Layout
Container Width: 89.583% for consistent content alignment

Grid System: CSS Grid with auto-fill for product listings

Flexbox: Extensive use for component alignment

Fixed Sidebar: 28.125% width for shopping cart

🔌 API Integration
The application communicates with a RESTful API at https://api.redseam.redberryinternship.ge/api with the following main endpoints:

Product Endpoints
GET /products - Fetch product catalog with filtering

GET /products/{id} - Get individual product details

Cart Endpoints
GET /cart - Retrieve user's shopping cart

POST /cart/products/{id} - Add product to cart

PATCH /cart/products/{id} - Update product quantity

DELETE /cart/products/{id} - Remove product from cart

POST /cart/checkout - Process order checkout

Authentication Endpoints
POST /register - User registration

POST /login - User authentication

* Security Features
JWT Token Storage - Secure token management in localStorage

Input Validation - Client-side form validation

API Authentication - Bearer token authorization headers

XSS Prevention - Safe DOM manipulation practices

* Browser Compatibility
Chrome 60+

Firefox 55+

Safari 12+

Edge 79+

* Important Notes
Local Server Required - The application must be run through a web server due to browser security restrictions on file loading

API Dependency - Full functionality requires connection to the backend API

No Build Process - The application uses vanilla JavaScript and doesn't require compilation

Progressive Enhancement - Core functionality works without JavaScript, but enhanced with JS

* Future Enhancements
Potential areas for improvement and additional features:

Product search functionality

User review and rating system

Wishlist functionality

Order history and tracking

Payment gateway integration

Admin dashboard

Mobile app development

* License
This project is for educational and demonstration purposes as part of the RedBerry Internship program.

git back clone: https://github.com/gmaisuradze999/RedSeam-Clothing.git