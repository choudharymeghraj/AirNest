# Airnest (Airbnb Clone)

## Description
Airnest is a full-stack web application inspired by Airbnb. It allows users to list accommodations, book stays, and leave reviews. The platform connects hosts with travelers, providing a seamless experience for finding and sharing unique places to stay.

## Features
- **User Authentication**: Secure signup and login functionality using Passport.js.
- **Listings Management**: Users can create, read, update, and delete (CRUD) property listings.
- **Reviews & Ratings**: Guests can leave reviews and ratings for listings they have visited.
- **Bookings**: Users can book listings for specific dates (Feature in progress/implemented).
- **Image Upload**: Integration with Cloudinary for storing listing images.
- **Map Integration**: (If applicable) Location support using Mapbox.
- **Responsive Design**: Mobile-friendly interface for usage on various devices.

## Tech Stack
**Backend:**
- Node.js
- Express.js
- MongoDB (with Mongoose)
- Passport.js (Authentication)
- EJS (Templating Engine)

**Frontend:**
- HTML5, CSS3
- Bootstrap (or custom styling)
- JavaScript

**Tools & Services:**
- Cloudinary (Image Cloud Storage)
- Mapbox (Maps & Geocoding)
- Render/Heroku (Deployment - *Optional*)

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Airbnb-2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add the following:
    ```env
    CLOUD_NAME=your_cloud_name
    CLOUD_API_KEY=your_cloud_api_key
    CLOUD_API_SECRET=your_cloud_api_secret
    MAP_TOKEN=your_mapbox_token
    ATLASDB_URL=your_mongodb_connection_string
    SECRET=your_session_secret
    ```

4.  **Database Initialization:**
    To seed the database with sample data:
    ```bash
    node init/index.js
    ```

5.  **Run the Server:**
    ```bash
    node app.js
    # OR with nodemon
    nodemon app.js
    ```

6.  **Access the App:**
    Open your browser and navigate to `http://localhost:8080`.

## Directory Structure
- `root`: Main application files (`app.js`, `package.json`)
- `routes/`: Express Routes for listings, reviews, and users.
- `models/`: Mongoose schemas (Listing, Review, User).
- `views/`: EJS templates for the UI.
- `public/`: Static assets (CSS, JS, Images).
- `init/`: Database initialization scripts.
- `middleware.js`: Custom middleware for authentication and validation.

## License
This project is licensed under the ISC License.
