import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./home.css";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    loadUserPosts();
  }, [user]);

  const loadUserPosts = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/social/posts/user/${user.id}`);
      if (response.ok) {
        const postsData = await response.json();
        setUserPosts(postsData);
      }
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async () => {
    const text = postText.trim();
    if (!text) return;

    try {
      const response = await fetch('http://localhost:8080/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          userId: user.id
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        setUserPosts([newPost, ...userPosts]);
        setPostText("");
      } else {
        alert("Failed to create post");
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert("Error creating post");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        // Note: You'll need to add a delete endpoint in the backend
        // For now, we'll just filter it out from the UI
        setUserPosts(userPosts.filter(post => post.id !== postId));
        alert("Post deleted successfully");
      } catch (error) {
        console.error('Error deleting post:', error);
        alert("Error deleting post");
      }
    }
  };

  const handleCommentPost = async (postId, commentText) => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch('http://localhost:8080/api/social/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText,
          userId: user.id,
          postId: postId
        })
      });

      if (response.ok) {
        // Reload user posts to get updated comments
        loadUserPosts();
      } else {
        alert("Failed to add comment");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await fetch('http://localhost:8080/api/social/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          postId: postId
        })
      });

      if (response.ok) {
        // Reload user posts to get updated likes
        loadUserPosts();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="hp-container">
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hp-container">
      <div className="hp-home d-flex flex-column min-vh-100">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg hp-navbar-custom" style={{ position: "sticky", top: 0, zIndex: 1030 }}>
          <div className="container">
            <Link className="hp-navbar-brand navbar-brand" to="/home">
              <i className="bi bi-mortarboard-fill"></i> Filter X
            </Link>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="hp-navbar-nav navbar-nav ms-auto align-items-lg-center">
                <li className="hp-nav-item nav-item">
                  <Link className="hp-nav-link nav-link" to="/home">
                    Home
                  </Link>
                </li>
                <li className="hp-nav-item nav-item">
                  <Link className="hp-nav-link nav-link" to="/about">
                    About
                  </Link>
                </li>
                <li className="hp-nav-item nav-item">
                  <span className="hp-nav-link nav-link text-warning">
                    <i className="bi bi-person-circle me-1"></i>My Profile
                  </span>
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
            <header className="hp-page-header">My Profile</header>
            <div className="hp-page-tagline">Your personal space on Filter X</div>

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
                <div className="hp-meta">
                  <i className="bi bi-postcard me-1"></i>
                  {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
                </div>
              </div>
            </section>

            {/* Create Post Box */}
            <section className="hp-glass-card mb-4">
              <h5 className="mb-3">Create a New Post</h5>
              <textarea
                placeholder="What's on your mind?"
                rows="3"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-100 form-control"
              ></textarea>
              <div className="d-flex justify-content-end mt-3">
                <button onClick={handlePost} className="hp-btn hp-btn-glass btn">
                  <i className="bi bi-feather me-2"></i>Post
                </button>
              </div>
            </section>

            {/* User's Posts */}
            <section className="hp-posts-container">
              <h4 className="mb-4">My Posts</h4>
              
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <UserPost
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                    onComment={handleCommentPost}
                    onLike={handleLikePost}
                  />
                ))
              ) : (
                <div className="hp-glass-card text-center py-5 d-flex flex-column justify-content-center">
                  <i className="bi bi-chat-square-text display-4 text-muted mb-3"></i>
                  <h5 className="mt-3">No posts yet</h5>
                  <p className="text-muted">Start sharing your thoughts!</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function UserPost({ post, onDelete, onComment, onLike }) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");

  const submitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
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
        <div className="flex-grow-1">
          <strong className="hp-username">You</strong>
          <small className="text-muted ms-2">
            {new Date(post.createdAt).toLocaleString()}
          </small>
        </div>
        <button
          className="hp-btn hp-btn-outline-danger btn-sm"
          onClick={() => onDelete(post.id)}
          title="Delete post"
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
      <p>{post.content}</p>
      
      {/* Like and Comment Buttons */}
      <div className="d-flex gap-2 flex-wrap hp-action-buttons mb-3">
        <button 
          className="hp-btn hp-btn-outline-success hp-btn-outline-custom btn btn-sm" 
          title="Like"
          onClick={() => onLike(post.id)}
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

      {/* Comment Box */}
      {showCommentBox && (
        <section className="hp-comment-box mb-3">
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

      {/* Comments Preview */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-3">
          <h6 className="text-muted mb-2">Comments:</h6>
          {post.comments.map((comment) => (
            <div key={comment.id} className="hp-comment mb-2">
              <div className="d-flex align-items-center">
                <img
                  src="https://i.pinimg.com/736x/54/c7/c3/54c7c36c20ced3eb982c4e3e21f465fe.jpg"
                  alt="Profile"
                  className="hp-profile-mini me-2"
                  style={{width: "25px", height: "25px"}}
                />
                <strong className="hp-username me-2">{comment.user?.username || "User"}:</strong>
                <span>{comment.content}</span>
              </div>
              <small className="text-muted">
                {new Date(comment.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default Profile;
