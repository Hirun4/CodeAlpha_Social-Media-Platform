const API_BASE = 'http://localhost:5002/api';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

async function apiRequest(path, method = 'GET', body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) throw await res.json();
    return res.json();
}

// Auth
export async function loginApi(email, password) {
    return apiRequest('/auth/login', 'POST', { email, password }, false);
}
export async function registerApi(username, email, password, fullName) {
    return apiRequest('/auth/register', 'POST', { username, email, password, fullName }, false);
}

// User
export async function getProfile() {
    return apiRequest('/users/profile');
}
export async function updateProfile(fullName, bio, username) {
    return apiRequest('/users/profile', 'PUT', { fullName, bio, username });
}
export async function searchUsers(query) {
    return apiRequest(`/users/search?query=${encodeURIComponent(query)}`);
}
export async function getUserProfile(id) {
    return apiRequest(`/users/profile/${id}`);
}
export async function followUser(id) {
    return apiRequest(`/users/follow/${id}`, 'POST');
}
export async function unfollowUser(id) {
    return apiRequest(`/users/unfollow/${id}`, 'POST');
}

// Posts
export async function getFeedPosts() {
    return apiRequest('/posts/feed');
}
export async function createPost(content) {
    return apiRequest('/posts', 'POST', { content });
}
export async function likePost(id) {
    return apiRequest(`/posts/${id}/like`, 'POST');
}
export async function deletePost(id) {
    return apiRequest(`/posts/${id}`, 'DELETE');
}
export async function getPost(id) {
    return apiRequest(`/posts/${id}`);
}
export async function getAllPosts() {
    return apiRequest('/posts/all', 'GET', null, false);
}
export async function createPostWithImage(formData) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
    });
    if (!res.ok) throw await res.json();
    return res.json();
}
export async function editPost(postId, formData) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

// Comments
export async function getComments(postId) {
    return apiRequest(`/comments/post/${postId}`);
}
export async function createComment(postId, content) {
    return apiRequest(`/comments/post/${postId}`, 'POST', { content });
}
export async function likeComment(id) {
    return apiRequest(`/comments/${id}/like`, 'POST');
}
export async function deleteComment(id) {
    return apiRequest(`/comments/${id}`, 'DELETE');
}
export async function uploadAvatar(formData) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/users/avatar`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
    });
    if (!res.ok) throw await res.json();
    return res.json();
}
export async function getAllTags() {
    const res = await fetch(`${API_BASE}/tags`);
    if (!res.ok) throw await res.json();
    return res.json();
}