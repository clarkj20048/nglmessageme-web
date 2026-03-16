import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function CreateProfilePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    age: "",
    profileImage: "",
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("No file chosen");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, profileImage: "" }));
      setPreviewUrl("");
      setSelectedFileName("No file chosen");
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, profileImage: "Please upload an image file." }));
      setFormData((prev) => ({ ...prev, profileImage: "" }));
      setPreviewUrl("");
      setSelectedFileName("No file chosen");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = String(reader.result || "");
      setFormData((prev) => ({ ...prev, profileImage: imageData }));
      setPreviewUrl(imageData);
      setSelectedFileName(file.name);
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const nextErrors = {};
    const email = formData.email.trim();
    const fullName = formData.fullName.trim();
    const ageValue = Number(formData.age);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!fullName) {
      nextErrors.fullName = "Full name is required.";
    } else {
      const words = fullName.split(/\s+/).filter(Boolean);
      if (words.length < 2) {
        nextErrors.fullName = "Enter at least first name and last name.";
      }
    }

    if (!Number.isInteger(ageValue) || ageValue < 1 || ageValue > 120) {
      nextErrors.age = "Age is required.";
    }

    if (!formData.profileImage) {
      nextErrors.profileImage = "Profile picture is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          age: Number(formData.age),
          profileImage: formData.profileImage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data?.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data?.message || "Failed to create profile." });
        }
        return;
      }

      localStorage.setItem(
        "activeProfile",
        JSON.stringify({
          id: data.data.id,
          email: data.data.email,
          fullName: data.data.fullName,
          age: data.data.age,
          profileImage: formData.profileImage,
        })
      );

      navigate("/message");
    } catch (_error) {
      setErrors({ form: "Network error. Please try again." });
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
        <h1 className="prompt-title">Create Profile</h1>
        <p className="prompt-subtitle">Upload your picture, add your email, name, and age to continue.</p>

        <form className="form ngl-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="profileImage">Profile Picture</label>
          <input
            id="profileImage"
            className="file-input-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleImageChange}
          />
          <label htmlFor="profileImage" className="file-upload-pill">
            Choose File
          </label>
          <p className="file-name-text">{selectedFileName}</p>
          {errors.profileImage && <p className="error">{errors.profileImage}</p>}
          {previewUrl && <img className="profile-preview" src={previewUrl} alt="Profile preview" />}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email"
            autoComplete="email"
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter Full Name"
            autoComplete="name"
          />
          {errors.fullName && <p className="error">{errors.fullName}</p>}

          <label htmlFor="age">Age</label>
          <input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter Age"
            min={1}
            max={120}
          />
          {errors.age && <p className="error">{errors.age}</p>}
          {errors.form && <p className="error">{errors.form}</p>}

          <button className="submit-pill" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Continue to Message"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateProfilePage;
