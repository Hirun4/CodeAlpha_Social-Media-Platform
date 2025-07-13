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
    const avatarUrl = getAvatarUrl(post.author);
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
            <div class="post-avatar"><img src="${avatarUrl}" alt="avatar" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></div>
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
        // Redirect to feed or reload
        window.location.href = '../index.html';
    } catch (err) {
        // Try to show a more helpful error
          console.warn('Suppressed error:', err);
        window.location.href = '../index.html'; 
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
    const avatarUrl = getAvatarUrl(comment.author);
    return `
    <div class="comment">
        <div class="comment-avatar"><img src="${avatarUrl}" alt="avatar" style="width:30px;height:30px;border-radius:50%;object-fit:cover;"></div>
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
        document.querySelector('#userProfileSection .profile-avatar').innerHTML =
            `<img src="${getAvatarUrl(user)}" alt="avatar" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`;
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
        document.querySelector('#profileSection .profile-avatar').innerHTML =
            `<img src="${getAvatarUrl(user)}" alt="avatar" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`;

        // Load user's posts
        const { posts } = await api.getUserProfile(user._id);
        document.getElementById('userPostsContainer').innerHTML = posts.map(renderOwnPost).join('');
    } catch (err) {
        if (err && err.message && err.message !== 'Failed to fetch') {
        alert(err.message);
    } else {
        // Otherwise, just log
        console.warn('Non-critical error:', err);
    }
    }
}

// Helper to render own post with edit/delete
function renderOwnPost(post) {
    const avatarUrl = getAvatarUrl(post.author);
    const imageHtml = post.image
        ? `<div class="post-image"><img src="${API_BASE}${post.image}" alt="Post Image" style="max-width:100%;border-radius:10px;margin:10px 0;"></div>`
        : '';
    return `
    <div class="post-card">
        <div class="post-header">
            <div class="post-avatar"><img src="${avatarUrl}" alt="avatar" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></div>
            <div class="post-author">
                <h4>${post.author.fullName} <span class="username">@${post.author.username}</span></h4>
            </div>
            <div class="post-time">${new Date(post.createdAt).toLocaleString()}</div>
        </div>
        <div class="post-content">${post.content}</div>
        ${imageHtml}
        <div class="post-actions">
            <button onclick="showEditPostModal('${post._id}', '${encodeURIComponent(post.content)}')" class="post-action">Edit</button>
            <button onclick="deletePost('${post._id}')" class="post-action">Delete</button>
        </div>
    </div>`;
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

window.updateProfile = async function(event) {
    event.preventDefault();
    const fullName = document.getElementById('editFullName').value;
    const username = document.getElementById('editUsername').value;
    const bio = document.getElementById('editBio').value;
    const avatarInput = document.getElementById('editAvatar');
    try {
        await api.updateProfile(fullName, bio, username);
        if (avatarInput.files && avatarInput.files[0]) {
            const formData = new FormData();
            formData.append('avatar', avatarInput.files[0]);
            await api.uploadAvatar(formData);
        }
        closeEditProfile();
        await loadProfile();
    } catch (err) {
        if (err && err.message) {
            alert(err.message);
        } else {
            alert('Failed to update profile. Please check your network connection.');
        }
    }
};

window.showEditPostModal = function(postId, content) {
    const decodedContent = decodeURIComponent(content);
    const modalHtml = `
        <div class="modal" id="editPostModal" style="display:flex;">
            <div class="modal-content">
                <span class="close" onclick="closeEditPostModal()">&times;</span>
                <h3>Edit Post</h3>
                <form onsubmit="editPost(event, '${postId}')">
                    <div class="form-group">
                        <textarea id="editPostContent" rows="3" required>${decodedContent}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Change Image</label>
                        <input type="file" id="editPostImage" accept="image/*">
                    </div>
                    <div class="form-actions">
                        <button type="button" onclick="closeEditPostModal()" class="cancel-btn">Cancel</button>
                        <button type="submit" class="save-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.closeEditPostModal = function() {
    const modal = document.getElementById('editPostModal');
    if (modal) modal.remove();
};

window.editPost = async function(event, postId) {
    event.preventDefault();
    const content = document.getElementById('editPostContent').value;
    const imageInput = document.getElementById('editPostImage');
    const formData = new FormData();
    formData.append('content', content);
    if (imageInput.files[0]) formData.append('image', imageInput.files[0]);
    try {
        await api.editPost(postId, formData);
        closeEditPostModal();
        await loadProfile();
    } catch (err) {
        alert(err.message || 'Failed to edit post');
    }
};

window.deletePost = async function(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
        await api.deletePost(postId);
        await loadProfile();
    } catch (err) {
        alert(err.message || 'Failed to delete post');
    }
};

window.editProfile = function() {
    // Fill modal fields with current profile data
    api.getProfile().then(user => {
        document.getElementById('editFullName').value = user.fullName || '';
        document.getElementById('editUsername').value = user.username || '';
        document.getElementById('editBio').value = user.bio || '';
        document.getElementById('editAvatar').value = '';
        document.getElementById('editProfileModal').style.display = 'flex';
    });
};

window.closeEditProfile = function() {
    document.getElementById('editProfileModal').style.display = 'none';
};

function getAvatarUrl(user) {
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
        return API_BASE + user.avatar;
    }
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName || user.username || 'U');
}