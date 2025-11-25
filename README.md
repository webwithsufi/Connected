# Connected | Mini Social Media App 🚀

A fully functional, responsive social media interface built entirely with **Vanilla JavaScript, HTML, and CSS**. This project was developed as part of the **Coding Night Challenge**, focusing on DOM manipulation, local storage persistence, and modern UI design without any backend dependencies.



[Image of Connected App Demo or Screenshot]

> *Replace this text with a screenshot of your app or a link to the live demo.*

## 🔗 Live Demo
**[Click here to view the live project](YOUR_VERCEL_OR_GITHUB_PAGES_LINK_HERE)**

## ✨ Key Features

### 🔐 Authentication (Frontend Simulation)
* **Dual Mode:** Seamless toggle between **Login** and **Sign Up**.
* **Validation:** Checks for existing emails/usernames and matches passwords.
* **Persistence:** User session is saved in `localStorage`, keeping you logged in on refresh.

### 📱 Social Feed & Interactivity
* **Create Posts:** Support for text and image URLs.
* **Stories System:** View and "add" mock stories with a full-screen viewer.
* **Like System:** Real-time like counter (prevents unlimited likes from the same user).
* **Comments:** Collapsible comment section for every post.
* **Delete Logic:** Users can only delete their own posts.

### 🔍 Explore & Search
* **Dynamic Search:** Real-time filtering of posts by content or username.
* **Image Lightbox:** Click any image in the feed or explore grid to view it in full screen.

### 👤 Profile & Networking
* **Dynamic Profiles:** View your own stats or visit other users' profiles.
* **Follow System:** Follow/Unfollow logic updates follower counts instantly.
* **Stats Dashboard:** Tracks Posts, Followers, and Following counts.

## 🛠️ Tech Stack
* **HTML5:** Semantic structure.
* **CSS3:** Flexbox, Grid, CSS Variables, and Glassmorphism effects.
* **JavaScript (ES6+):** Complete DOM manipulation, Event Handling, and LocalStorage logic.

## 📂 Project Structure
```text
/
├── index.html      # Main HTML structure (Single Page App logic)
├── style.css       # All styling, responsive media queries, and animations
├── app.js          # Auth logic, Feed rendering, and State management
└── README.md       # Project documentation
