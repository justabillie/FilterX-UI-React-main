import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./home.css";

function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  // Load Bootstrap JS for navbar toggler
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Load posts from backend on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/social/posts');
      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleLogout = () => {
    authLogout();
    navigate("/");
  };

  const handlePost = async () => {
    const text = postText.trim();
    if (!text) return;

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await fetch('http://localhost:8080/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          userId: userData.id
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setPostText("");
      } else {
        alert("Failed to create post");
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert("Error creating post");
    }
  };

  const handleCommentPost = async (postId, commentText) => {
    if (!commentText.trim()) return;

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await fetch('http://localhost:8080/api/social/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText,
          userId: userData.id,
          postId: postId
        })
      });

      if (response.ok) {
        // Reload posts to get updated comments
        loadPosts();
      } else {
        alert("Failed to add comment");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await fetch('http://localhost:8080/api/social/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          postId: postId
        })
      });

      if (response.ok) {
        // Reload posts to get updated likes
        loadPosts();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`http://localhost:8080/api/social/comments/${commentId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id
        })
      });

      if (response.ok) {
        // Reload posts to get updated comment likes
        loadPosts();
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleReplyToComment = async (commentId, replyText) => {
    if (!replyText.trim()) return;

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`http://localhost:8080/api/social/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyText,
          userId: userData.id
        })
      });

      if (response.ok) {
        // Reload posts to get updated replies
        loadPosts();
      } else {
        alert("Failed to add reply");
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  return (
    <div className="hp-container">
      <div className="hp-home d-flex flex-column min-vh-100">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg hp-navbar-custom" style={{ position: "sticky", top: 0, zIndex: 1030 }}>
          <div className="container">
            <Link className="hp-navbar-brand navbar-brand" to="/">
              <i className="bi bi-mortarboard-fill"></i> Filter X
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
              style={{ borderColor: "#d4af37" }}
            >
              <i className="bi bi-list" style={{ color: "#d4af37", fontSize: "1.5rem" }}></i>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="hp-navbar-nav navbar-nav ms-auto align-items-lg-center">
                <li className="hp-nav-item nav-item">
                  <Link className="hp-nav-link nav-link text-warning" to="/home">
                    Home
                  </Link>
                </li>
                <li className="hp-nav-item nav-item">
                  <Link className="hp-nav-link nav-link" to="/about">
                    About
                  </Link>
                </li>
                <li className="hp-nav-item nav-item">
                  <Link className="hp-nav-link nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="hp-nav-item nav-item">
                  <a className="hp-nav-link nav-link" href="#" onClick={handleLogout}>
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <main className="hp-main container-fluid flex-grow-1 py-3 d-flex flex-column">
          <div className="hp-content-wrapper">
            <header className="hp-page-header">Filter X</header>
            <div className="hp-page-tagline">Empowering Learning & Knowledge Sharing</div>

            {/* Profile Section */}
            <section className="hp-glass-card d-flex align-items-center mb-4">
              <img
                src="https://i.pinimg.com/736x/54/c7/c3/54c7c36c20ced3eb982c4e3e21f465fe.jpg"
                alt="Profile"
                className="hp-profile-img me-4"
              />
              <div className="flex-grow-1">
                <div className="hp-username">{user?.username || "User"}</div>
                <div className="hp-meta">{user?.email || ""}</div>
                <div className="hp-meta">{user?.fullName || ""}</div>
              </div>
              <div className="ms-auto">
                <button className="hp-btn hp-btn-outline-custom btn">
                  Edit Profile
                </button>
              </div>
            </section>

            {/* Post Box */}
            <section className="hp-glass-card mb-4">
              <textarea
                id="hp-postText"
                placeholder="What's on your mind?"
                rows="4"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-100"
              ></textarea>
              <div className="d-flex justify-content-end mt-3">
                <button onClick={handlePost} className="hp-btn hp-btn-glass btn">
                  <i className="bi bi-feather me-2"></i>Post
                </button>
              </div>
            </section>

            {/* Posts Container */}
            <section className="hp-posts-container">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  user={user}
                  handleCommentPost={handleCommentPost}
                  handleLikePost={handleLikePost}
                  handleLikeComment={handleLikeComment}
                  handleReplyToComment={handleReplyToComment}
                />
              ))}

              {posts.length === 0 && (
                <div className="hp-glass-card text-center py-5 d-flex flex-column justify-content-center">
                  <i className="bi bi-chat-square-text display-4 text-muted mb-3"></i>
                  <h5 className="mt-3">No posts yet</h5>
                  <p className="text-muted">Be the first to share something!</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Post({ post, user, handleCommentPost, handleLikePost, handleLikeComment, handleReplyToComment }) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");

  const submitComment = () => {
    if (commentText.trim()) {
      handleCommentPost(post.id, commentText);
      setCommentText("");
      setShowCommentBox(false);
    }
  };

  return (
    <article className="hp-glass-card hp-post mb-3">
      <div className="d-flex align-items-center mb-3">
        <img
          src="https://i.pinimg.com/736x/54/c7/c3/54c7c36c20ced3eb982c4e3e21f465fe.jpg"
          alt="Profile"
          className="hp-profile-mini me-2"
        />
        <strong className="hp-username">{post.user?.username || "User"}</strong>
        <small className="text-muted ms-auto">
          {new Date(post.createdAt).toLocaleString()}
        </small>
      </div>
      <p>{post.content}</p>
      <div className="d-flex gap-2 flex-wrap hp-action-buttons mb-3">
        <button
          className="hp-btn hp-btn-outline-success hp-btn-outline-custom btn btn-sm"
          title="Like"
          onClick={() => handleLikePost(post.id)}
        >
          <i className="bi bi-hand-thumbs-up"></i> Like ({post.likes?.length || 0})
        </button>
        <button
          className="hp-btn hp-btn-outline-secondary hp-btn-outline-custom btn btn-sm"
          title="Comment"
          onClick={() => setShowCommentBox(!showCommentBox)}
        >
          <i className="bi bi-chat-dots"></i> Comment ({post.comments?.length || 0})
        </button>
      </div>

      <section className="hp-comments">
        {showCommentBox && (
          <section className="hp-comment-box">
            <textarea
              className="form-control mb-2"
              placeholder="Write a comment..."
              rows="2"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
            ></textarea>
            <div className="d-flex gap-2">
              <button
                className="hp-btn hp-btn-outline-secondary btn btn-sm"
                onClick={() => setShowCommentBox(false)}
              >
                Cancel
              </button>
              <button
                className="hp-btn hp-btn-glass btn btn-sm flex-grow-1"
                onClick={submitComment}
                disabled={!commentText.trim()}
              >
                <i className="bi bi-send me-1"></i>Post Comment
              </button>
            </div>
          </section>
        )}

        {post.comments?.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onLikeComment={handleLikeComment}
            onReplyToComment={handleReplyToComment}
          />
        ))}
      </section>
    </article>
  );
}

function Comment({ comment, onLikeComment, onReplyToComment }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const submitReply = () => {
    if (replyText.trim()) {
      onReplyToComment(comment.id, replyText);
      setReplyText("");
      setShowReplyBox(false);
    }
  };

  return (
    <article className="hp-comment mb-2">
      <div className="d-flex align-items-center">
        <img
          src="https://i.pinimg.com/736x/54/c7/c3/54c7c36c20ced3eb982c4e3e21f465fe.jpg"
          alt="Profile"
          className="hp-profile-mini me-2"
          style={{width: "30px", height: "30px"}}
        />
        <strong className="hp-username me-2">{comment.user?.username || "User"}:</strong>
        <span>{comment.content}</span>
      </div>
      <small className="text-muted">
        {new Date(comment.createdAt).toLocaleString()}
      </small>

      {/* Comment Actions */}
      <div className="d-flex gap-2 mt-2">
        <button
          className="hp-btn hp-btn-outline-success btn-sm"
          title="Like comment"
          onClick={() => onLikeComment(comment.id)}
        >
          <i className="bi bi-hand-thumbs-up"></i> ({comment.likes?.length || 0})
        </button>
        <button
          className="hp-btn hp-btn-outline-secondary btn-sm"
          title="Reply"
          onClick={() => setShowReplyBox(!showReplyBox)}
        >
          <i className="bi bi-reply"></i> Reply
        </button>
        {comment.replies && comment.replies.length > 0 && (
          <button
            className="hp-btn hp-btn-outline-info btn-sm"
            onClick={() => setShowReplies(!showReplies)}
          >
            <i className="bi bi-chat"></i> {comment.replies.length} {showReplies ? 'Hide' : 'Show'} replies
          </button>
        )}
      </div>

      {/* Reply Box */}
      {showReplyBox && (
        <div className="hp-reply-box mt-2">
          <textarea
            className="form-control mb-2"
            placeholder="Write a reply..."
            rows="1"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitReply();
              }
            }}
          ></textarea>
          <div className="d-flex gap-2">
            <button
              className="hp-btn hp-btn-outline-secondary btn-sm"
              onClick={() => setShowReplyBox(false)}
            >
              Cancel
            </button>
            <button
              className="hp-btn hp-btn-glass btn-sm"
              onClick={submitReply}
              disabled={!replyText.trim()}
            >
              <i className="bi bi-send me-1"></i>Reply
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="hp-replies mt-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="hp-reply mb-1">
              <div className="d-flex align-items-center">
                <img
                  src="https://i.pinimg.com/736x/54/c7/c3/54c7c36c20ced3eb982c4e3e21f465fe.jpg"
                  alt="Profile"
                  className="hp-profile-mini me-2"
                  style={{width: "25px", height: "25px"}}
                />
                <strong className="hp-username me-2">{reply.user?.username || "User"}:</strong>
                <span>{reply.content}</span>
              </div>
              <small className="text-muted">
                {new Date(reply.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default Home;