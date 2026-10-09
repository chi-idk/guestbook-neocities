const form = document.querySelector("#comment-form");
const textarea = form.elements.comment;
const counter = document.querySelector("#character-count");
const list = document.querySelector("#comments-list");
const count = document.querySelector("#comment-count");
const sort = document.querySelector("#sort-comments");
const message = document.querySelector("#form-message");

const STORAGE_KEY = "guestbook-demo-comments";
let comments = loadComments();

function loadComments() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveComments() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    return true;
  } catch {
    message.textContent = "Could not save comments in this browser.";
    return false;
  }
}

function updateCounter() {
  counter.textContent = `${textarea.value.length} / 2,000`;
}

function safeWebsite(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch {
    // Ignore invalid URLs.
  }

  return "";
}

function renderComments() {
  list.replaceChildren();

  const ordered = [...comments].sort((a, b) => {
    const difference = a.createdAt - b.createdAt;
    return sort.value === "newest" ? -difference : difference;
  });

  count.textContent = comments.length;

  if (ordered.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No comments yet. Be the first!";
    list.append(empty);
    return;
  }

  for (const comment of ordered) {
    const article = document.createElement("article");
    article.className = "comment";

    const meta = document.createElement("div");
    meta.className = "comment-meta";

    const name = document.createElement("strong");
    name.textContent = comment.name;
    meta.append(name);

    const date = document.createElement("time");
    date.className = "comment-date";
    date.dateTime = new Date(comment.createdAt).toISOString();
    date.textContent = new Date(comment.createdAt).toLocaleString();
    meta.append(date);

    const website = safeWebsite(comment.website);
    if (website) {
      const link = document.createElement("a");
      link.className = "comment-website";
      link.href = website;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Website";
      meta.append(link);
    }

    const body = document.createElement("p");
    body.className = "comment-body";
    body.textContent = comment.comment;

    article.append(meta, body);
    list.append(article);
  }
}

textarea.addEventListener("input", updateCounter);
sort.addEventListener("change", renderComments);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "";

  if (!form.reportValidity()) return;

  const data = new FormData(form);

  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const website = String(data.get("website") || "").trim();
  const comment = String(data.get("comment") || "").trim();

  if (!name || !comment) {
    message.textContent = "Please fill in your name and comment.";
    return;
  }

  if (comment.length > 2000) {
    message.textContent = "Comments must be 2,000 characters or fewer.";
    return;
  }

  comments.push({
    id: crypto.randomUUID(),
    name,
    email,
    website: safeWebsite(website),
    comment,
    createdAt: Date.now()
  });

  if (!saveComments()) {
    comments.pop();
    return;
  }

  form.reset();
  updateCounter();
  renderComments();
  message.textContent = "Comment saved in this browser.";
});

updateCounter();
renderComments();
