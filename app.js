// === DATA (Initial Setup) ===
// Add dummy data for testing if LS is empty
const INITIAL_USERS = {
  ali: {
    name: "Ali Dev",
    email: "ali@test.com",
    handle: "@alicode",
    password: "123",
    img: "https://i.pravatar.cc/150?img=11",
    followers: 120,
    following: 45,
  },
  sarah: {
    name: "Sarah Design",
    email: "sarah@test.com",
    handle: "@sarah_ux",
    password: "123",
    img: "https://i.pravatar.cc/150?img=5",
    followers: 340,
    following: 120,
  },
};

const DUMMY_POSTS = [
  {
    id: 101,
    user: "sarah",
    text: "Designing the future! 🎨",
    img: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600",
    likes: 45,
    likedBy: [],
    comments: [],
    timestamp: Date.now(),
  },
];

let stories = [
  {
    user: "sarah",
    img: "https://images.unsplash.com/photo-1516961642265-531546e84af2?w=600",
  },
];

// === STATE ===
let currentUser = null;
let posts = JSON.parse(localStorage.getItem("app_posts")) || DUMMY_POSTS;
let users = JSON.parse(localStorage.getItem("app_users")) || INITIAL_USERS;
let following = JSON.parse(localStorage.getItem("app_following")) || ["sarah"];
let notifications = [];

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  renderStories();
  renderSuggestions();

  document.getElementById("explore-search").addEventListener("input", (e) => {
    renderExplore(e.target.value);
  });
});

// === AUTHENTICATION ===

// Toggle between Login and Signup Forms
window.toggleAuth = (mode) => {
  if (mode === "signup") {
    document.getElementById("login-card").classList.add("hidden");
    document.getElementById("signup-card").classList.remove("hidden");
  } else {
    document.getElementById("signup-card").classList.add("hidden");
    document.getElementById("login-card").classList.remove("hidden");
  }
};

// Handle Login
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value;

  // Find user by email
  let foundUserKey = null;
  for (let key in users) {
    if (users[key].email === email) {
      foundUserKey = key;
      break;
    }
  }

  if (foundUserKey && users[foundUserKey].password === pass) {
    loginSuccess(foundUserKey);
  } else {
    alert("Invalid Email or Password");
  }
});

// Handle Signup
document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const username = document
    .getElementById("reg-username")
    .value.trim()
    .toLowerCase();
  const pass = document.getElementById("reg-pass").value;
  const confirmPass = document.getElementById("reg-confirm-pass").value;

  if (pass !== confirmPass) return alert("Passwords do not match!");
  if (users[username]) return alert("Username already taken!");

  // Check if email exists
  for (let key in users) {
    if (users[key].email === email) return alert("Email already registered!");
  }

  // Create User
  users[username] = {
    name: name,
    email: email,
    handle: "@" + username,
    password: pass,
    img: "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 50),
    followers: 0,
    following: 0,
  };

  saveData();
  alert("Account created! Logging you in...");
  loginSuccess(username);
});

function loginSuccess(username) {
  currentUser = username;
  localStorage.setItem("current_user", currentUser);
  document.getElementById("auth-layer").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  document.getElementById("mini-avatar").src = users[currentUser].img;

  // Reset forms
  document.getElementById("login-form").reset();
  document.getElementById("signup-form").reset();

  renderFeed();
  renderExplore();
  renderNotifications();
  renderSuggestions();
}

function checkAuth() {
  const storedUser = localStorage.getItem("current_user");
  if (storedUser && users[storedUser]) {
    loginSuccess(storedUser);
  } else {
    document.getElementById("auth-layer").classList.remove("hidden");
  }
}

function logout() {
  localStorage.removeItem("current_user");
  location.reload();
}

// === NAVIGATION & UI ===
window.switchTab = (tab) => {
  document
    .querySelectorAll(".view")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(`view-${tab}`).classList.add("active");
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
  if (tab === "explore") renderExplore();
};

// === FEED & POSTS ===
function renderFeed() {
  const container = document.getElementById("feed-container");
  container.innerHTML = "";
  posts.sort((a, b) => b.timestamp - a.timestamp);

  posts.forEach((post) => {
    const u = users[post.user];
    if (!u) return; // Skip if user deleted

    const isFollowing = following.includes(post.user);
    if (!post.likedBy) post.likedBy = [];
    const iLiked = post.likedBy.includes(currentUser);

    let commentsHtml = post.comments
      .map((c) => `<div class="comment"><b>${c.user}</b> ${c.text}</div>`)
      .join("");

    const deleteBtnHtml =
      post.user === currentUser
        ? `<i class="fas fa-trash delete-btn" onclick="deletePost(${post.id})"></i>`
        : "";
    const followBtnHtml =
      post.user !== currentUser && !isFollowing
        ? `<span class="btn-follow-sm" onclick="event.stopPropagation(); followUser('${post.user}')">Follow</span>`
        : "";

    const div = document.createElement("div");
    div.className = "post-card";
    div.innerHTML = `
            <div class="post-header">
                <div class="user-row" onclick="openProfile('${post.user}')">
                    <img src="${u.img}">
                    <div><b>${
                      u.name
                    }</b><span style="font-size:0.8rem; display:block; color:gray">${timeAgo(
      post.timestamp
    )}</span></div>
                    ${followBtnHtml}
                </div>
                ${deleteBtnHtml}
            </div>
            <div class="post-content">
                <p>${post.text}</p>
                ${
                  post.img
                    ? `<img src="${post.img}" class="post-img" onclick="openImage('${post.img}')">`
                    : ""
                }
            </div>
            <div class="post-actions">
                <div class="action-btn ${
                  iLiked ? "liked" : ""
                }" onclick="likePost(${post.id})"><i class="${
      iLiked ? "fas" : "far"
    } fa-heart"></i> ${post.likes}</div>
                <div class="action-btn" onclick="toggleComments(${
                  post.id
                })"><i class="far fa-comment"></i> ${post.comments.length}</div>
            </div>
            <div id="comments-${post.id}" class="comments-section">
                <div id="list-${
                  post.id
                }" style="max-height:100px; overflow-y:auto; margin-bottom:5px;">${commentsHtml}</div>
                <div class="comment-input-row">
                    <input type="text" id="input-${
                      post.id
                    }" placeholder="Add a comment...">
                    <button class="btn-primary" style="width:auto; padding:5px 15px;" onclick="addComment(${
                      post.id
                    })">Post</button>
                </div>
            </div>
        `;
    container.appendChild(div);
  });
}

// === POST ACTIONS ===
window.publishContent = () => {
  const type = document.getElementById("post-type-select").value;
  const text = document.getElementById("post-text").value;
  const img = document.getElementById("post-img-url").value;

  if (!text && !img) return alert("Write something!");

  if (type === "post") {
    posts.unshift({
      id: Date.now(),
      user: currentUser,
      text: text,
      img: img,
      likes: 0,
      likedBy: [],
      comments: [],
      timestamp: Date.now(),
    });
    saveData();
    resetCreateForm();
    switchTab("home");
    renderFeed();
  } else {
    if (!img && !text) return alert("Status needs content");
    stories.unshift({
      user: currentUser,
      img: img || "https://via.placeholder.com/500",
    });
    resetCreateForm();
    switchTab("home");
    renderStories();
  }
};

function resetCreateForm() {
  document.getElementById("post-text").value = "";
  document.getElementById("post-img-url").value = "";
  document.getElementById("img-preview-area").style.display = "none";
  document.getElementById("post-type-select").value = "post";
}

window.previewImage = () => {
  const url = document.getElementById("post-img-url").value;
  const area = document.getElementById("img-preview-area");
  if (url) {
    document.getElementById("img-preview").src = url;
    area.style.display = "block";
  } else {
    area.style.display = "none";
  }
};

window.deletePost = (id) => {
  if (confirm("Delete post?")) {
    posts = posts.filter((p) => p.id !== id);
    saveData();
    renderFeed();
    if (document.getElementById("view-profile").classList.contains("active"))
      openMyProfile();
  }
};

window.likePost = (id) => {
  const p = posts.find((x) => x.id === id);
  if (!p.likedBy) p.likedBy = [];
  if (p.likedBy.includes(currentUser)) {
    p.likes--;
    p.likedBy = p.likedBy.filter((u) => u !== currentUser);
  } else {
    p.likes++;
    p.likedBy.push(currentUser);
  }
  saveData();
  renderFeed();
};

window.toggleComments = (id) =>
  document.getElementById(`comments-${id}`).classList.toggle("open");
window.addComment = (id) => {
  const input = document.getElementById(`input-${id}`);
  const text = input.value.trim();
  if (!text) return;
  const p = posts.find((x) => x.id === id);
  p.comments.push({ user: currentUser, text: text });
  saveData();
  renderFeed();
};

// === STORIES & EXPLORE ===
function renderStories() {
  const container = document.getElementById("stories-container");
  let html = `<div class="story-circle" onclick="startStoryCreation()"><div class="story-img story-add">+</div><span>Add</span></div>`;
  stories.forEach((s, index) => {
    const u = users[s.user];
    if (u)
      html += `<div class="story-circle" onclick="viewStory(${index})"><img class="story-img" src="${
        u.img
      }"><span>${u.name.split(" ")[0]}</span></div>`;
  });
  container.innerHTML = html;
}
window.startStoryCreation = () => {
  switchTab("create");
  document.getElementById("post-type-select").value = "story";
};
window.viewStory = (index) => {
  const s = stories[index];
  const u = users[s.user];
  const modal = document.getElementById("story-modal");
  document.getElementById("story-user-img").src = u.img;
  document.getElementById("story-user-name").textContent = u.name;
  document.getElementById(
    "story-body"
  ).style.backgroundImage = `url('${s.img}')`;
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 3000);
};

function renderExplore(query = "") {
  const grid = document.getElementById("explore-grid");
  grid.innerHTML = "";
  const results = posts.filter(
    (p) => !query || p.text.toLowerCase().includes(query.toLowerCase())
  );
  results.forEach((p) => {
    if (p.img) {
      const img = document.createElement("img");
      img.src = p.img;
      img.className = "explore-item";
      img.onclick = () => openImage(p.img);
      grid.appendChild(img);
    }
  });
}

// === PROFILE ===
window.openMyProfile = () => openProfile(currentUser);
window.openProfile = (username) => {
  const u = users[username];
  if (!u) return;
  switchTab("profile");
  document.getElementById("profile-name").textContent = u.name;
  document.getElementById("profile-handle").textContent = u.handle;
  document.getElementById("profile-img").src = u.img;
  const userPosts = posts.filter((p) => p.user === username);
  document.getElementById("stat-posts").textContent = userPosts.length;
  document.getElementById("stat-followers").textContent = u.followers;
  document.getElementById("stat-following").textContent = u.following || 0;

  const btn = document.getElementById("profile-action-btn");
  if (username === currentUser) {
    btn.textContent = "Edit";
    btn.className = "btn-follow following";
  } else {
    const isFollowing = following.includes(username);
    btn.textContent = isFollowing ? "Unfollow" : "Follow";
    btn.className = isFollowing ? "btn-follow following" : "btn-follow";
    btn.onclick = () => followUser(username);
  }

  const grid = document.getElementById("profile-posts-grid");
  grid.innerHTML = "";
  userPosts.forEach((p) => {
    if (p.img) {
      const img = document.createElement("img");
      img.src = p.img;
      img.onclick = () => openImage(p.img);
      grid.appendChild(img);
    }
  });
};

window.followUser = (target) => {
  if (following.includes(target)) {
    following = following.filter((u) => u !== target);
    users[target].followers--;
  } else {
    following.push(target);
    users[target].followers++;
  }
  saveData();
  if (document.getElementById("view-profile").classList.contains("active"))
    openProfile(target);
  renderFeed();
  renderSuggestions();
};

function renderSuggestions() {
  const list = document.getElementById("suggestions-list");
  list.innerHTML = "";
  Object.keys(users).forEach((key) => {
    if (key !== currentUser) {
      const isFollowing = following.includes(key);
      const div = document.createElement("div");
      div.className = "user-row";
      div.style.marginBottom = "15px";
      div.innerHTML = `<img src="${users[key].img}"><div><b>${
        users[key].name
      }</b><span style="font-size:0.8rem; color:gray; display:block">${
        users[key].handle
      }</span></div><button class="btn-follow-sm ${
        isFollowing ? "following" : ""
      }" style="background:none; border:none; margin-left:auto" onclick="followUser('${key}')">${
        isFollowing ? "Following" : "Follow"
      }</button>`;
      list.appendChild(div);
    }
  });
}

// === UTILS ===
window.openImage = (src) => {
  document.getElementById("modal-img").src = src;
  document.getElementById("image-modal").classList.remove("hidden");
};
window.closeModal = (id) => document.getElementById(id).classList.add("hidden");
function saveData() {
  localStorage.setItem("app_posts", JSON.stringify(posts));
  localStorage.setItem("app_users", JSON.stringify(users));
  localStorage.setItem("app_following", JSON.stringify(following));
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  return Math.floor(s / 3600) + "h";
}
