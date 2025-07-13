const Comment = require('../models/Comment');
const Post = require('../models/Post');

const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content: content.trim(),
      author: req.user.id,
      post: postId
    });

    await comment.save();

    // Add comment to post and update count
    post.comments.push(comment._id);
    post.commentsCount += 1;
    await post.save();

    // Populate author details
    await comment.populate('author', 'username fullName avatar');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const hasLiked = comment.likes.includes(req.user.id);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => !id.equals(req.user.id));
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      // Like
      comment.likes.push(req.user.id);
      comment.likesCount += 1;
    }

    await comment.save();

    res.json({
      liked: !hasLiked,
      likesCount: comment.likesCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!comment.author.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    const post = await Post.findById(comment.post);
    if (post) {
      post.comments = post.comments.filter(id => !id.equals(comment._id));
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createComment,
  getComments,
  likeComment,
  deleteComment
};