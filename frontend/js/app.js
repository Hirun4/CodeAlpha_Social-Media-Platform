import * as api from './api.js';
import { showLogin, showRegister, logout } from './auth.js';

window.showLogin = showLogin;
window.showRegister = showRegister;
window.login = login;
window.register = register;
window.logout = logout;

const API_BASE = 'http://localhost:5002';

document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('token')) {
        document.getElementById('authContainer').style.display = '';
        document.getElementById('navbar').style.display = 'none';
        document.getElementById('mainContent').style.display = 'none';
        showLogin();
        return;
    }
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('navbar').style.display = '';
    document.getElementById('mainContent').style.display = '';

    loadFeed();
    setupSearch();
});

async function loadFeed() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = 'Loading...';
    try {
        const posts = await api.getAllPosts();
        console.log('Fetched posts:', posts); // <-- Debug log
        if (!Array.isArray(posts)) {
            console.error('Posts is not an array:', posts);
            postsContainer.innerHTML = 'Error: Posts data is invalid.';
            return;
        }
        if (posts.length === 0) {
            console.warn('No posts found.');
            postsContainer.innerHTML = 'No posts to display.';
            return;
        }
        postsContainer.innerHTML = posts.map(post => {
            try {
                return renderPost(post);
            } catch (err) {
                console.error('Error rendering post:', post, err);
                return '<div>Error rendering post</div>';
            }
        }).join('');
    } catch (err) {
        console.error('Failed to load posts:', err);
        postsContainer.innerHTML = 'Failed to load posts.';
    }
}

function renderPost(post) {
    if (!post) {
        console.error('renderPost called with null/undefined:', post);
        return '<div>Invalid post</div>';
    }
    if (!post.author) {
        console.warn('Post author missing:', post);
    }
    // Add follow button next to username
    const followBtn = `
        <button class="follow-btn" style="margin-left:10px;font-size:12px;padding:2px 10px;"
            onclick="followFromFeed(event, '${post.author._id}')">
            Follow
        </button>
    `;
    const imageHtml = post.image
        ? `<div class="post-image"><img src="${API_BASE}${post.image}" alt="Post Image" style="max-width:100%;border-radius:10px;margin:10px 0;"></div>`
        : '';
    return `
    <div class="post-card">
        <div class="post-header">
            <div class="post-avatar"><i class="fas fa-user-circle"></i></div>
            <div class="post-author">
                <h4>${post.author.fullName} <span class="username">@${post.author.username}</span> ${followBtn}</h4>
            </div>
            <div class="post-time">${new Date(post.createdAt).toLocaleString()}</div>
        </div>
        <div class="post-content">${post.content}</div>
        ${imageHtml}
        <div class="post-actions">
            <button onclick="likePost('${post._id}')" class="post-action">${post.likesCount} <i class="fas fa-heart"></i></button>
            <button onclick="showComments('${post._id}')" class="post-action">${post.commentsCount} <i class="fas fa-comment"></i></button>
        </div>
        <div id="comments-${post._id}" class="comments-section" style="display:none"></div>
    </div>`;
}

window.createPost = async function(event) {
    event.preventDefault();
    const content = document.getElementById('postContent').value;
    const imageInput = document.getElementById('postImage');
    const imageFile = imageInput.files[0];

    if (!content.trim()) return;

    const formData = new FormData();
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);

    try {
        await api.createPostWithImage(formData);
        document.getElementById('postContent').value = '';
        imageInput.value = '';
        loadFeed();
    } catch (err) {
        alert(err.message || 'Failed to create post');
    }
};

window.likePost = async function(postId) {
    try {
        await api.likePost(postId);
        loadFeed();
    } catch (err) {
        alert(err.message || 'Failed to like post');
    }
};

window.showComments = async function(postId) {
    const section = document.getElementById(`comments-${postId}`);
    if (section.style.display === 'none') {
        section.style.display = '';
        section.innerHTML = 'Loading...';
        try {
            const comments = await api.getComments(postId);
            section.innerHTML = comments.map(renderComment).join('') + `
                <form onsubmit="addComment(event, '${postId}')">
                    <input type="text" id="commentInput-${postId}" placeholder="Add a comment..." required>
                    <button type="submit">Comment</button>
                </form>
            `;
        } catch (err) {
            section.innerHTML = 'Failed to load comments.';
        }
    } else {
        section.style.display = 'none';
    }
};

function renderComment(comment) {
    return `
    <div class="comment">
        <div class="comment-avatar"><i class="fas fa-user-circle"></i></div>
        <div class="comment-content">
            <div class="comment-author">${comment.author.fullName}</div>
            <div class="comment-text">${comment.content}</div>
        </div>
    </div>`;
}

window.addComment = async function(event, postId) {
    event.preventDefault();
    const input = document.getElementById(`commentInput-${postId}`);
    try {
        await api.createComment(postId, input.value);
        input.value = '';
        showComments(postId);
    } catch (err) {
        alert(err.message || 'Failed to add comment');
    }
};

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim();
        if (!query) {
            searchResults.style.display = 'none';
            return;
        }
        try {
            const users = await api.searchUsers(query);
            searchResults.innerHTML = users.map(u =>
                `<div class="search-result-item" onclick="viewUserProfile('${u._id}')">
                    <i class="fas fa-user"></i> ${u.fullName} (@${u.username})
                </div>`
            ).join('');
            searchResults.style.display = '';
        } catch {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
        }
    });
}

window.viewUserProfile = async function(userId) {
    document.getElementById('feedSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('userProfileSection').style.display = '';
    try {
        const { user, posts } = await api.getUserProfile(userId);
        document.getElementById('userProfileName').textContent = user.fullName;
        document.getElementById('userProfileUsername').textContent = '@' + user.username;
        document.getElementById('userProfileBio').textContent = user.bio || '';
        document.getElementById('userProfilePosts').textContent = (user.postsCount || 0) + ' Posts';
        document.getElementById('userProfileFollowers').textContent = (user.followers?.length || 0) + ' Followers';
        document.getElementById('userProfileFollowing').textContent = (user.following?.length || 0) + ' Following';
        document.getElementById('viewUserPostsContainer').innerHTML = posts.map(renderPost).join('');
        // Show follow button if not self
        const myProfile = await api.getProfile();
        const followBtn = document.getElementById('followBtn');
        if (user._id === myProfile._id) {
            followBtn.style.display = 'none';
        } else {
            followBtn.style.display = '';
            if (user.followers.some(f => f._id === myProfile._id)) {
                followBtn.textContent = 'Unfollow';
                followBtn.onclick = async () => {
                    await api.unfollowUser(user._id);
                    viewUserProfile(user._id);
                };
            } else {
                followBtn.textContent = 'Follow';
                followBtn.onclick = async () => {
                    await api.followUser(user._id);
                    viewUserProfile(user._id);
                };
            }
        }
    } catch (err) {
        alert('Failed to load user profile');
    }
};

window.showFeed = function() {
    document.getElementById('feedSection').style.display = '';
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('userProfileSection').style.display = 'none';
    loadFeed();
};

window.showProfile = async function() {
    document.getElementById('feedSection').style.display = 'none';
    document.getElementById('profileSection').style.display = '';
    document.getElementById('userProfileSection').style.display = 'none';
    await loadProfile();
};

async function loadProfile() {
    try {
        const user = await api.getProfile();
        document.getElementById('profileName').textContent = user.fullName;
        document.getElementById('profileUsername').textContent = '@' + user.username;
        document.getElementById('profileBio').textContent = user.bio || '';
        document.getElementById('profilePosts').textContent = (user.postsCount || 0) + ' Posts';
        document.getElementById('profileFollowers').textContent = (user.followers?.length || 0) + ' Followers';
        document.getElementById('profileFollowing').textContent = (user.following?.length || 0) + ' Following';
        // Optionally, load user's posts
        // const posts = await api.getUserProfile(user._id);
        // document.getElementById('userPostsContainer').innerHTML = posts.posts.map(renderPost).join('');
    } catch (err) {
        alert('Failed to load profile');
    }
}

window.followFromFeed = async function(event, userId) {
    event.stopPropagation();
    try {
        await api.followUser(userId);
        alert('Followed!');
        loadFeed();
    } catch (err) {
        alert(err.message || 'Failed to follow user');
    }
};