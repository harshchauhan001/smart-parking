import { useState } from "react";
import "./Auth.css";
import { loginUser } from "../../services/api";


function Login({ onLogin, onRegister }) {

  const [role, setRole] = useState("user");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!email || !password) {

      alert("Please enter email and password.");

      return;

    }


    try {

      setLoading(true);


      /*
        Send login information
        to our Express backend
      */

      const result = await loginUser(
        email,
        password,
        role
      );


      /*
        Save JWT token
        in browser storage
      */

      localStorage.setItem(
        "parksmart_token",
        result.token
      );


      /*
        Save logged-in user information
      */

      localStorage.setItem(
        "parksmart_user",
        JSON.stringify(result.user)
      );


      /*
        Tell App.jsx that login
        was successful
      */

      onLogin(result.user);

    }

    catch (error) {

      alert(
        error.message ||
        "Login failed. Please try again."
      );

    }

    finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">


      {/* =================================
          LEFT SIDE
      ================================= */}

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
            SMART PARKING MANAGEMENT
          </p>


          <h1>

            Parking made

            <span>
              {" "}simple.
            </span>

          </h1>


          <p className="auth-description">

            Find parking spaces, manage parking centres and
            enjoy a simple parking experience.

          </p>


          <div className="auth-features">


            {/* FEATURE 1 */}

            <div className="auth-feature">

              <div className="feature-icon">
                📍
              </div>


              <div>

                <strong>
                  Find Nearby Parking
                </strong>

                <p>
                  Discover parking centres around you.
                </p>

              </div>

            </div>


            {/* FEATURE 2 */}

            <div className="auth-feature">

              <div className="feature-icon">
                🚗
              </div>


              <div>

                <strong>
                  Easy Vehicle Management
                </strong>

                <p>
                  Manage your vehicle and parking sessions.
                </p>

              </div>

            </div>


            {/* FEATURE 3 */}

            <div className="auth-feature">

              <div className="feature-icon">
                🔒
              </div>


              <div>

                <strong>
                  Simple & Secure
                </strong>

                <p>
                  A convenient way to manage parking.
                </p>

              </div>

            </div>


          </div>


        </div>


      </div>


      {/* =================================
          RIGHT SIDE
      ================================= */}

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
              Welcome back
            </h2>

            <p>
              Login to continue to ParkSmart
            </p>

          </div>


          {/* =================================
              ROLE SELECTOR
          ================================= */}

          <div className="role-selector">


            {/* USER */}

            <button

              type="button"

              className={
                role === "user"
                  ? "role active"
                  : "role"
              }

              onClick={() =>
                setRole("user")
              }

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

              onClick={() =>
                setRole("partner")
              }

            >

              <span>
                🏢
              </span>

              Partner

            </button>


          </div>


          {/* =================================
              LOGIN FORM
          ================================= */}

          <form
            onSubmit={handleSubmit}
          >


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


              <div className="label-row">

                <label>
                  Password
                </label>


                <button

                  type="button"

                  className="forgot-password"

                  onClick={() =>
                    alert(
                      "Password recovery will be added later."
                    )
                  }

                >

                  Forgot password?

                </button>

              </div>


              <input

                type="password"

                placeholder="Enter your password"

                value={password}

                onChange={(e) =>
                  setPassword(e.target.value)
                }

              />


            </div>


            {/* =================================
                LOGIN BUTTON
            ================================= */}

            <button

              type="submit"

              className="auth-submit"

              disabled={loading}

            >

              {loading
                ? "Logging in..."
                : `Login as ${
                    role === "user"
                      ? "User"
                      : "Partner"
                  }`
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


          {/* REGISTER */}

          <p className="switch-auth">

            Don't have an account?


            <button

              type="button"

              onClick={onRegister}

            >

              Create account

            </button>

          </p>


        </div>


      </div>


    </div>

  );

}


export default Login;