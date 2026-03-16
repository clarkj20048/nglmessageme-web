import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    async function loadMessages() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/admin/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }

        if (!response.ok) {
          setError(data?.message || "Failed to load messages.");
          return;
        }

        setMessages(data.messages || []);
      } catch (_error) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [navigate]);

  function logout() {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  }

  function resolveMessageId(msg) {
    return msg?._id || msg?.profileId || msg?.id || "";
  }

  async function handleDelete(messageId) {
    if (!messageId) {
      setError("Missing message id. Refresh and try again.");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const shouldDelete = window.confirm("Delete this message?");
    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(messageId);
      const response = await fetch(`${API_BASE_URL}/api/admin/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        setError(data?.message || "Failed to delete message.");
        return;
      }

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (_error) {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="page-bg ngl-surface admin-dashboard-surface">
      <main className="card dashboard-card ngl-dashboard-card">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Admin Dashboard</p>
            <h1>Submitted Messages</h1>
          </div>
          <button className="ghost-button dashboard-logout" onClick={logout}>
            Logout
          </button>
        </div>

        {loading && <p className="subtext">Loading messages...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && messages.length === 0 && (
          <p className="subtext">No messages submitted yet.</p>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Anonymous Name</th>
                  <th>Message</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => {
                  const messageId = resolveMessageId(msg);
                  return (
                  <tr key={messageId || `${msg.fullName}-${msg.createdAt}`}>
                    <td>
                      <div className="dashboard-name-cell">
                        {msg.profileImage ? (
                          <button
                            type="button"
                            className="dashboard-profile-thumb-btn"
                            onClick={() => setSelectedImage({ src: msg.profileImage, alt: msg.fullName })}
                            aria-label={`View profile image of ${msg.fullName}`}
                          >
                            <img
                              className="dashboard-profile-thumb"
                              src={msg.profileImage}
                              alt={msg.fullName}
                            />
                          </button>
                        ) : (
                          <div className="dashboard-profile-thumb dashboard-profile-thumb-fallback" />
                        )}
                        <span>{msg.fullName}</span>
                      </div>
                    </td>
                    <td>{msg.anonymousName}</td>
                    <td>
                      <button
                        type="button"
                        className="table-view-btn"
                        onClick={() => setSelectedMessage(msg)}
                      >
                        View
                      </button>
                    </td>
                    <td>{new Date(msg.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className="table-delete-btn"
                        onClick={() => handleDelete(messageId)}
                        disabled={!messageId || deletingId === messageId}
                      >
                        {deletingId === messageId ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedMessage && (
        <div className="message-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="message-modal-title">
          <div className="message-modal">
            <h2 id="message-modal-title">Message</h2>
            <p className="message-modal-sender">
              From: {selectedMessage.fullName} ({selectedMessage.anonymousName})
            </p>
            <p className="message-modal-content">{selectedMessage.message}</p>
            <button type="button" className="message-modal-close" onClick={() => setSelectedMessage(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="message-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="image-modal-title">
          <div className="image-modal">
            <h2 id="image-modal-title">Profile Picture</h2>
            <img className="image-modal-preview" src={selectedImage.src} alt={selectedImage.alt} />
            <button type="button" className="message-modal-close" onClick={() => setSelectedImage(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;

