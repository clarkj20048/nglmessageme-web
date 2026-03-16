import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../config/api";

function MessagePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    anonymousName: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("activeProfile");
    if (!raw) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.id) {
        navigate("/", { replace: true });
        return;
      }
      setProfile(parsed);
    } catch (_error) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const targetHandle = useMemo(() => username || profile?.fullName || "your-friend", [username, profile]);

  function validate() {
    const nextErrors = {};
    const anonymousName = formData.anonymousName.trim();
    const message = formData.message.trim();

    if (!anonymousName) {
      nextErrors.anonymousName = "Anonymous display name is required.";
    }

    if (!message) {
      nextErrors.message = "Message cannot be empty.";
    }

    if (!profile?.id) {
      nextErrors.message = "Profile session expired. Please create profile again.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSuccessMessage("");
    setShowSuccessPopup(false);

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: profile.id,
          anonymousName: formData.anonymousName,
          message: formData.message,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data?.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ message: data?.message || "Failed to submit message." });
        }
        return;
      }

      setFormData({ anonymousName: "", message: "" });
      setErrors({});
      setSuccessMessage("Message sent successfully.");
      setShowSuccessPopup(true);
      localStorage.removeItem("activeProfile");
    } catch (_error) {
      setErrors({ message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-bg ngl-surface">
      <main className="message-wrap">
        <div className="logo-holder">
          <img className="ngl-logo" src="/nglogo2-soft.png" alt="NGL logo" />
        </div>
        <h1 className="prompt-title">Drop an anonymous message</h1>
        <p className="prompt-subtitle">ONLY YOUR ANONYMOUS DISPLAY NAME APPEARS PUBLICLY.</p>

        <form className="form ngl-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="anonymousName">Anonymous Display Name</label>
          <input
            id="anonymousName"
            name="anonymousName"
            type="text"
            value={formData.anonymousName}
            onChange={handleChange}
            placeholder="Ex. honestfriend"
            autoComplete="off"
          />
          {errors.anonymousName && <p className="error">{errors.anonymousName}</p>}

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your anonymous message..."
            rows={5}
          />
          {errors.message && <p className="error">{errors.message}</p>}

          <button className="submit-pill" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send"}
          </button>
        </form>
      </main>

      {showSuccessPopup && (
        <div className="success-popup-overlay" role="status" aria-live="polite">
          <div className="success-popup">
            <h2>Success</h2>
            <p>{successMessage}</p>
            <button type="button" className="success-popup-btn" onClick={() => setShowSuccessPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagePage;
