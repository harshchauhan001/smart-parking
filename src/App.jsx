import { useState } from "react";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserDashboard from "./pages/user/UserDashboard";
import PartnerDashboard from "./pages/partner/PartnerDashboard";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  /* =========================================
     LOGIN
  ========================================= */

  const handleLogin = (loggedInUser) => {
    console.log("Logged in user:", loggedInUser);

    if (!loggedInUser) {
      alert("Login failed. Please try again.");
      return;
    }

    // Save logged-in user in React state
    setUser(loggedInUser);

    // Also save current logged-in user
    localStorage.setItem(
      "parksmart_user",
      JSON.stringify(loggedInUser)
    );

    /* =========================================
       CHECK USER ROLE
    ========================================= */

    if (loggedInUser.role === "user") {
      setPage("userDashboard");
    } 
    
    else if (loggedInUser.role === "partner") {
      setPage("partnerDashboard");
    } 
    
    else {
      alert("Invalid user role.");
      setUser(null);
      setPage("login");
    }
  };


  /* =========================================
     REGISTER
  ========================================= */

  const handleRegister = () => {
    // After registration go back to login
    setPage("login");
  };


  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    // Remove current login information
    localStorage.removeItem("parksmart_token");
    localStorage.removeItem("parksmart_user");

    // Remove React user state
    setUser(null);

    // Return to login
    setPage("login");
  };


  /* =========================================
     LOGIN PAGE
  ========================================= */

  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setPage("register")}
      />
    );
  }


  /* =========================================
     REGISTER PAGE
  ========================================= */

  if (page === "register") {
    return (
      <Register
        onRegister={handleRegister}
        onLogin={() => setPage("login")}
      />
    );
  }


  /* =========================================
     USER DASHBOARD
  ========================================= */

  if (page === "userDashboard") {
    return (
      <UserDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }


  /* =========================================
     PARTNER DASHBOARD
  ========================================= */

  if (page === "partnerDashboard") {
    return (
      <PartnerDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }


  return null;
}

export default App;