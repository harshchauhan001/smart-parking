import { useState } from "react";
import "./Auth.css";
import {
  registerUser,
  registerPartner,
} from "../../services/api";

function Register({ onRegister, onLogin }) {
  const [role, setRole] = useState("user");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // New fields for user
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // USER REGISTRATION
    if (role === "user") {
      if (
        !name.trim() ||
        !email.trim() ||
        !password.trim() ||
        !vehicleNumber.trim() ||
        !licenseNumber.trim()
      ) {
        alert("Please fill all the fields.");
        return;
      }
    }

    // PARTNER REGISTRATION
    else {
      if (
        !name.trim() ||
        !email.trim() ||
        !password.trim()
      ) {
        alert("Please fill all the fields.");
        return;
      }
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      let result;

      /*
       * USER REGISTRATION
       */
      if (role === "user") {
        result = await registerUser({
          name: name.trim(),
          email: email.trim(),
          password: password,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          licenseNumber: licenseNumber.trim().toUpperCase(),
        });
      }

      /*
       * PARTNER REGISTRATION
       */
      else {
        result = await registerPartner({
          name: name.trim(),
          email: email.trim(),
          password: password,
        });
      }

      /*
       * Registration successful
       */
      alert(
        result.message ||
        "Account created successfully!"
      );

      /*
       * Clear form
       */
      setName("");
      setEmail("");
      setPassword("");
      setVehicleNumber("");
      setLicenseNumber("");

      /*
       * Go to login
       */
      onLogin();
    }

    catch (error) {
      alert(
        error.message ||
        "Registration failed. Please try again."
      );
    }

    finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* =====================================
          LEFT SIDE
      ===================================== */}

      <div className="auth-left">

        <div className="auth-brand">

          <div className="auth-brand-icon">
            P
          </div>

          <span>
            ParkSmart
          </span>

        </div>

        <div className="auth-content">

          <p className="auth-small-title">
            JOIN PARKSMART
          </p>

          <h1>
            Start your
            <span>
              {" "}parking journey.
            </span>
          </h1>

          <p className="auth-description">
            Create your ParkSmart account and enjoy
            convenient parking management.
          </p>

          <div className="auth-features">

            {/* DRIVER */}

            <div className="auth-feature">

              <div className="feature-icon">
                🚗
              </div>

              <div>

                <strong>
                  For Drivers
                </strong>

                <p>
                  Find and reserve convenient parking spaces.
                </p>

              </div>

            </div>

            {/* PARTNER */}

            <div className="auth-feature">

              <div className="feature-icon">
                🏢
              </div>

              <div>

                <strong>
                  For Parking Partners
                </strong>

                <p>
                  Manage your parking centre and available slots.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================
          RIGHT SIDE
      ===================================== */}

      <div className="auth-right">

        <div className="auth-card">

          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="auth-brand-icon">
              P
            </div>

            <span>
              ParkSmart
            </span>

          </div>


          {/* HEADER */}

          <div className="auth-card-header">

            <h2>
              Create account
            </h2>

            <p>
              Register to start using ParkSmart
            </p>

          </div>


          {/* =====================================
              ROLE SELECTOR
          ===================================== */}

          <div className="role-selector">

            {/* USER */}

            <button
              type="button"
              className={
                role === "user"
                  ? "role active"
                  : "role"
              }
              onClick={() => setRole("user")}
            >

              <span>
                🚗
              </span>

              User

            </button>


            {/* PARTNER */}

            <button
              type="button"
              className={
                role === "partner"
                  ? "role active"
                  : "role"
              }
              onClick={() => setRole("partner")}
            >

              <span>
                🏢
              </span>

              Partner

            </button>

          </div>


          {/* =====================================
              REGISTRATION FORM
          ===================================== */}

          <form onSubmit={handleSubmit}>

            {/* NAME */}

            <div className="form-group">

              <label>
                {role === "user"
                  ? "Full Name"
                  : "Partner / Business Name"
                }
              </label>

              <input
                type="text"
                placeholder={
                  role === "user"
                    ? "Enter your name"
                    : "Enter business name"
                }
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>


            {/* =====================================
                USER ONLY FIELDS
            ===================================== */}

            {role === "user" && (
              <>

                {/* VEHICLE NUMBER */}

                <div className="form-group">

                  <label>
                    Vehicle Number
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. WB01AB1234"
                    value={vehicleNumber}
                    onChange={(e) =>
                      setVehicleNumber(
                        e.target.value.toUpperCase()
                      )
                    }
                  />

                </div>


                {/* LICENSE NUMBER */}

                <div className="form-group">

                  <label>
                    Driving License Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter driving license number"
                    value={licenseNumber}
                    onChange={(e) =>
                      setLicenseNumber(
                        e.target.value.toUpperCase()
                      )
                    }
                  />

                </div>

              </>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading
                ? "Creating account..."
                : `Create ${
                    role === "user"
                      ? "User"
                      : "Partner"
                  } Account`
              }

              {!loading && (
                <span>
                  →
                </span>
              )}

            </button>

          </form>


          {/* DIVIDER */}

          <div className="auth-divider">

            <span>
              OR
            </span>

          </div>


          {/* LOGIN */}

          <p className="switch-auth">

            Already have an account?

            <button
              type="button"
              onClick={onLogin}
            >
              Login
            </button>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;