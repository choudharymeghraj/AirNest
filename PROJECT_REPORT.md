# AirNest Technical Project Report

Welcome to the **AirNest** project documentation. This report provides a complete, top-to-bottom overview of the application's architecture, data schemas, systems, and file mappings. It is designed to get any new developer fully oriented in the codebase within minutes.

---

## 🗺️ System Architecture

AirNest is built as a robust, full-stack MVC (Model-View-Controller) application. The backend is powered by Node.js and Express, connected to MongoDB using Mongoose, and the frontend is rendered server-side using EJS templates.

```mermaid
graph TD
    Client[Client / Web Browser] -->|HTTP Requests| Router[Express Routers]
    Router -->|Authenticate & Validate| Middleware[Middleware]
    Middleware -->|Execute Handler| Controller[Controllers]
    Controller -->|Read / Write| Model[Mongoose Models]
    Model -->|Query / Sync| DB[(MongoDB)]
    Controller -->|Render UI| View[EJS Views]
    View -->|HTML / CSS / JS| Client
```

### 🗝️ Key Systems Overview

1. **User Authentication & Session Management**:
   - Authentication is implemented via [passport.js](https://www.passportjs.org/) using a local email/username strategy.
   - Sessions are managed by `express-session` and persistent storage is handled using `connect-mongo`, enabling sessions to persist across server restarts.
   - Session data and flash alerts (success/error banners) are injected into the global view rendering context via Express middleware.

2. **Listing & Accommodation Management**:
   - The platform allows hosts to perform full CRUD operations on properties.
   - Each property listing is categorized under predefined filters (such as *Farms*, *Cabins*, *Amazing Pools*, *Beach*, etc.).
   - Images for properties are securely stored on **Cloudinary** using `multer` and `multer-storage-cloudinary` during upload.

3. **Secure Reservation & Payment Gateway**:
   - Seamless bookings can be calculated directly on a property detail page by selecting Check-in and Check-out dates.
   - The transaction checkout is handled through **Razorpay**:
     1. The client submits reservation dates.
     2. The server computes night-based stay rates and GST (18%), creates a Razorpay transaction order, and responds with order metadata.
     3. The client opens the Razorpay checkout overlay.
     4. On successful checkout, Razorpay issues a transaction signature which is validated cryptographically on the backend using an HMAC-SHA256 signature check.
     5. Verified bookings are confirmed in the database.

4. **Dynamic AI-Vibe Search Bar**:
   - The navbar contains a standard desktop search bar utilizing a mock "AI Search" keyword parser.
   - Keywords (e.g., *"romantic cabin"*, *"quiet workspace"*) are checked against a local semantic dictionary mapping vibes to associated tags (like "cozy", "sunset", "wifi", "desk").
   - A combined MongoDB `$or` regex query checks titles, descriptions, categories, and locations for match relevance.

5. **Reviews & Rating System**:
   - Guests can write comments and submit star ratings (1-5) for properties.
   - The listing detail page displays all review notes, user-avatar initials, and dynamically computes aggregate ratings.
   - Author-level deletion controls protect reviews from unauthorized manipulation.

---

## 📂 Codebase File Mapping & Explanations

Here is a detailed guide listing every directory and source code file in the repository along with its exact purpose.

### 🔌 Project Configuration & Initialization

* **[app.js](file:///d:/AirNest/app.js)**:
  The central bootstrapper and core of the application. It loads environment configuration, establishes database connections, defines session/cookie settings, configures Passport authentication, registers routers, handles global exceptions (404 and error renders), and starts the Express server.
* **[middleware.js](file:///d:/AirNest/middleware.js)**:
  Exposes critical middleware wrappers:
  * `isLoggedIn`: Requires active user login sessions.
  * `isOwner` & `isReviewAuthor`: Restricts listings and reviews actions to their respective creators.
  * `validateListing` & `validateReview`: Executes JOI schema validation.
* **[schema.js](file:///d:/AirNest/schema.js)**:
  Defines JSON schema rule validations using the `joi` validation library for listings (requiring title, category, price, location, country) and reviews (rating validation bounds of 1 to 5).
* **[cloudConfig.js](file:///d:/AirNest/cloudConfig.js)**:
  Configures the Cloudinary storage client and parameters (allowed formats, storage folder) for file upload processing.
* **[checkGeometry.js](file:///d:/AirNest/checkGeometry.js)**:
  A utility command-line script to audit property listing geography/coordinates.

---

### 💾 Data Models (`models/`)
* **[models/user.js](file:///d:/AirNest/models/user.js)**:
  Mongoose model for users. It records user emails and plugs in `passport-local-mongoose` to automatically manage username hashing, salting, and authentication logic.
* **[models/listing.js](file:///d:/AirNest/models/listing.js)**:
  Mongoose model representing a property. Saves properties like title, description, category, pricing, location coordinates, reviews, and host ownership. Includes a post-delete mongoose hook that cascades to delete all reviews associated with a deleted property.
* **[models/review.js](file:///d:/AirNest/models/review.js)**:
  Mongoose schema storing reviews, including rating index (1 to 5 stars), body text comment, author reference, and timestamp.
* **[models/booking.js](file:///d:/AirNest/models/booking.js)**:
  Tracks reservations: maps a user to a listing, captures dates, totals nights and price, logs Razorpay identifiers (order ID, signature, payment ID), and holds booking statuses (`confirmed`, `cancelled`, etc.).

---

### 🎛️ Request Controllers (`controllers/`)
* **[controllers/listings.js](file:///d:/AirNest/controllers/listings.js)**:
  Handles properties logic: retrieves category filters and query terms for listing grids, populates reviews, compiles property templates, saves uploads, and performs listing deletions.
* **[controllers/booking.js](file:///d:/AirNest/controllers/booking.js)**:
  Coordinates reservation flows: processes checkout pages, coordinates Razorpay order requests, validates signature hashing, completes bookings, lists bookings for logged-in users, and manages deletions.
* **[controllers/review.js](file:///d:/AirNest/controllers/review.js)**:
  Manages reviews: appends feedback objects, deletes records, and provides listing-level rating averages.
* **[controllers/users.js](file:///d:/AirNest/controllers/users.js)**:
  Controls the user journey: signs up new accounts, handles log-in redirection, and destroys active sessions.
* **[controllers/createListing.js](file:///d:/AirNest/controllers/createListing.js)**:
  Legacy listing generator file.

---

### 🗺️ Express Routers (`routes/`)
* **[routes/listing.js](file:///d:/AirNest/routes/listing.js)**:
  Exposes routes mapping listing CRUD endpoints directly to the listings controller.
* **[routes/booking.js](file:///d:/AirNest/routes/booking.js)**:
  Maps booking detail checkouts, orders, cancellations, and history lists.
* **[routes/review.js](file:///d:/AirNest/routes/review.js)**:
  Manages review submit and delete endpoints.
* **[routes/user.js](file:///d:/AirNest/routes/user.js)**:
  Triggers user authentication routing (login/signup forms, logging in, logging out).

---

### 🛠️ Configuration & Database Setup (`config/` & `init/`)
* **[config/db.js](file:///d:/AirNest/config/db.js)**:
  Initializes Mongoose connection to MongoDB. Gracefully falls back to local database strings if `ATLASDB_URL` is unavailable.
* **[config/razorpay.js](file:///d:/AirNest/config/razorpay.js)**:
  Instantiates the Razorpay SDK client with credentials loaded from environment variables.
* **[init/data.js](file:///d:/AirNest/init/data.js)**:
  A seed dataset containing multiple sample listing documents (titles, prices, default images, countries).
* **[init/index.js](file:///d:/AirNest/init/index.js)**:
  Seeds the local MongoDB database. It drops existing collections, establishes a default admin account, maps properties to the admin, assigns random categories, and populates the database.
* **[init/seed_atlas.js](file:///d:/AirNest/init/seed_atlas.js)**:
  Seeds the production Atlas database using remote variables.
* **[init/fixImageUrls.js](file:///d:/AirNest/init/fixImageUrls.js)** & **[init/updateGeometry.js](file:///d:/AirNest/init/updateGeometry.js)**:
  One-off scripts used to update mock listing pictures and coordinate geometry.

---

### 🎨 View Templates (`views/`)

* **[views/layouts/boilerplate.ejs](file:///d:/AirNest/views/layouts/boilerplate.ejs)**:
  The main layout wrapper. It imports Bootstrap, FontAwesome icons, fonts, custom style sheets, sets up responsive headers, inserts alert overlays, and injects EJS body views.
* **[views/includes/navbar.ejs](file:///d:/AirNest/views/includes/navbar.ejs)**:
  The navigation bar. Renders brand logos, list creation buttons, authentication links (Log In, Sign Up), dropdown actions, responsive mobile toggles, and the custom-styled `.search-container`.
* **[views/includes/footer.ejs](file:///d:/AirNest/views/includes/footer.ejs)**:
  Clean website footer providing links to standard legal policies (Terms, Privacy) and social accounts.
* **[views/includes/flash.ejs](file:///d:/AirNest/views/includes/flash.ejs)**:
  Renders alert boxes if success or error notifications are set in session variables.
* **[views/listings/index.ejs](file:///d:/AirNest/views/listings/index.ejs)**:
  The portal listing feed. Integrates quick filter pills (Farms, Rooms, Surfing, Beach, etc.), tax display toggles, and card decks displaying prices, ratings, and covers.
* **[views/listings/show.ejs](file:///d:/AirNest/views/listings/show.ejs)**:
  Detailed view of a property listing. Features host detail cards, calendar date range forms with automatic pricing calculators, review rating charts, and review forms.
* **[views/listings/new.ejs](file:///d:/AirNest/views/listings/new.ejs)** & **[views/listings/edit.ejs](file:///d:/AirNest/views/listings/edit.ejs)**:
  Forms for publishing or modifying listing entries.
* **[views/bookings/confirm.ejs](file:///d:/AirNest/views/bookings/confirm.ejs)**:
  The reservation overview screen containing dates, counts, pricing subtotals, GST breakdown, and the script launching Razorpay checkout.
* **[views/bookings/success.ejs](file:///d:/AirNest/views/bookings/success.ejs)**:
  Displays verified check-out details, host info, booking IDs, and confirmation marks.
* **[views/bookings/index.ejs](file:///d:/AirNest/views/bookings/index.ejs)**:
  The trip dashboard, listing all user bookings, dates, prices, status badges, and booking cancellation forms.

---

## 🛠️ Onboarding: Run the Project Locally

Follow these steps to set up the development environment from scratch:

1. **Verify Prerequisites**:
   * Ensure [Node.js](https://nodejs.org/) (v20+) and [MongoDB](https://www.mongodb.com/try/download/community) are installed and running locally on your computer.

2. **Configure Environment Variables**:
   * Create a `.env` file in the root workspace folder with the following variables:
     ```env
     CLOUD_NAME=dh1znqbhy
     CLOUD_API_KEY=426657588736167
     CLOUD_API_SECRET=-_-VPiWfC7i5BRrczpCuDkvPMT0
     RAZORPAY_KEY_ID=rzp_test_Ryt3DhmdYmB32L
     RAZORPAY_KEY_SECRET=kW9ggdNMfTRy8jA4DfzjCccj
     ATLASDB_URL=mongodb+srv://AirNest:LVwPGaoEqdG2GFVI@cluster0.xxxxx.mongodb.net/wanderlust
     SECRET=your_secret_session_key
     ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Seed the Local Database**:
   ```bash
   node init/index.js
   ```

5. **Start the Express Application**:
   ```bash
   npm start
   ```
   * Open `http://localhost:8080` in your web browser. Enjoy exploring AirNest!
