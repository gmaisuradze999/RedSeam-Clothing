const API_URL = "https://api.redseam.redberryinternship.ge/api";

export async function LogIn(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed: " + response.status);
  }

  return await response.json();
}

export async function Register(email, username, password, avatarFile) {
  const formData = new FormData();

  formData.append("email", email);
  formData.append("username", username);
  formData.append("password", password);
  formData.append("password_confirmation", password);

  if (avatarFile) {
    formData.append("avatar", avatarFile);
  }

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Register failed: " + response.status);
  }

  return await response.json();
}