import { useEffect, useState } from "react";
import "./UserDashboard.css";

function UserDashboard({ onLogout }) {

  // ================================
  // LOGGED-IN USER
  // ================================

  const [currentUser, setCurrentUser] = useState(null);

  // ================================
  // VEHICLE DETAILS
  // ================================

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  // ================================
  // PARKING
  // ================================

  const [showParking, setShowParking] = useState(false);

  const [parkingCenters, setParkingCenters] = useState([]);

  const [selectedParking, setSelectedParking] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);

  // ================================
  // RESERVATION
  // ================================

  const [reservation, setReservation] = useState(null);

  // ================================
  // PAYMENT
  // ================================

  const [showPayment, setShowPayment] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");

  const [paymentSuccess, setPaymentSuccess] = useState(false);


  // ==================================================
  // LOAD CURRENT USER
  // ==================================================

  useEffect(() => {

    const savedUser =
      localStorage.getItem("parksmart_user");

    if (savedUser) {

      try {

        const user =
          JSON.parse(savedUser);

        setCurrentUser(user);

        // Load user's registered vehicle details
        if (user.vehicleNumber) {
          setVehicleNumber(
            user.vehicleNumber
          );
        }

        if (user.licenseNumber) {
          setLicenseNumber(
            user.licenseNumber
          );
        }

      }

      catch (error) {

        console.error(
          "Could not load user",
          error
        );

      }

    }

  }, []);


  // ==================================================
  // LOAD PARKING CENTRES
  // ==================================================

  useEffect(() => {

    const loadParkingCenters = () => {

      const savedCenters =
        localStorage.getItem(
          "parkingCenters"
        );

      if (savedCenters) {

        setParkingCenters(
          JSON.parse(savedCenters)
        );

      }

      else {

        setParkingCenters([]);

      }

    };


    loadParkingCenters();


    window.addEventListener(
      "storage",
      loadParkingCenters
    );


    return () => {

      window.removeEventListener(
        "storage",
        loadParkingCenters
      );

    };

  }, []);


  // ==================================================
  // FIND PARKING
  // ==================================================

  const handleFindParking = (e) => {

    e.preventDefault();


    if (
      !vehicleNumber ||
      !licenseNumber
    ) {

      alert(
        "Please enter vehicle number and license number."
      );

      return;

    }


    setShowParking(true);

  };


  // ==================================================
  // SELECT PARKING CENTRE
  // ==================================================

  const handleReserve = (parking) => {

    setSelectedParking(parking);

    setSelectedSlot(null);

    setShowPayment(false);

    setPaymentSuccess(false);

  };


  // ==================================================
  // BACK TO PARKING
  // ==================================================

  const handleBackToParking = () => {

    setSelectedParking(null);

    setSelectedSlot(null);

    setShowPayment(false);

    setPaymentSuccess(false);

  };


  // ==================================================
  // GENERATE PARKING SLOTS
  // ==================================================

  const generateSlots = () => {

    if (!selectedParking) {

      return [];

    }


    const totalSlots =
      Number(
        selectedParking.totalSlots
      );


    const availableSlots =
      Number(
        selectedParking.availableSlots
      );


    const occupiedSlots =
      totalSlots -
      availableSlots;


    const slots = [];


    for (
      let i = 1;
      i <= totalSlots;
      i++
    ) {

      slots.push({

        number: i,

        available:
          i > occupiedSlots,

      });

    }


    return slots;

  };


  // ==================================================
  // PROCEED TO PAYMENT
  // ==================================================

  const handleProceedToPayment = () => {

    if (!selectedSlot) {

      alert(
        "Please select a parking slot."
      );

      return;

    }


    setShowPayment(true);

  };


  // ==================================================
  // PAYMENT
  // ==================================================

  const handlePayment = () => {

    if (!paymentMethod) {

      alert(
        "Please select a payment method."
      );

      return;

    }


    if (
      !selectedParking ||
      !selectedSlot
    ) {

      return;

    }


    const newReservation = {

      id: Date.now(),

      userId:
        currentUser?.id,

      userName:
        currentUser?.name,

      userEmail:
        currentUser?.email,

      parkingId:
        selectedParking.id,

      parkingName:
        selectedParking.name,

      location:
        selectedParking.location,

      slot:
        selectedSlot,

      vehicleNumber,

      licenseNumber,

      price:
        selectedParking.price,

      status:
        "Confirmed",

      paymentMethod,

      paymentStatus:
        paymentMethod === "cash"
          ? "Pay at Parking Centre"
          : "Paid",

      date:
        new Date().toLocaleDateString(),

      time:
        new Date().toLocaleTimeString(),

    };


    // ==================================================
    // USER-SPECIFIC RESERVATION STORAGE
    // ==================================================

    if (currentUser?.id) {

      localStorage.setItem(

        `currentReservation_${currentUser.id}`,

        JSON.stringify(
          newReservation
        )

      );

    }


    // ==================================================
    // UPDATE PARKING AVAILABILITY
    // ==================================================

    const updatedCenters =
      parkingCenters.map(
        (parking) => {

          if (

            parking.id ===
              selectedParking.id &&

            Number(
              parking.availableSlots
            ) > 0

          ) {

            return {

              ...parking,

              availableSlots:
                Number(
                  parking.availableSlots
                ) - 1,

            };

          }


          return parking;

        }
      );


    localStorage.setItem(

      "parkingCenters",

      JSON.stringify(
        updatedCenters
      )

    );


    setParkingCenters(
      updatedCenters
    );


    setReservation(
      newReservation
    );


    setPaymentSuccess(
      true
    );

  };


  // ==================================================
  // NEW RESERVATION
  // ==================================================

  const handleNewReservation = () => {

    setReservation(null);

    setSelectedParking(null);

    setSelectedSlot(null);

    setShowPayment(false);

    setPaymentSuccess(false);

    setPaymentMethod("");

    setShowParking(false);

  };


  // ==================================================
  // LOGOUT
  // ==================================================

  const handleUserLogout = () => {

    // Remove ONLY current user's session
    localStorage.removeItem(
      "parksmart_token"
    );

    localStorage.removeItem(
      "parksmart_user"
    );

    if (onLogout) {

      onLogout();

    }

  };


  // ==================================================
  // DISPLAY
  // ==================================================

  return (

    <div className="dashboard">


      {/* =====================================
          NAVBAR
      ===================================== */}

      <nav className="dashboard-navbar">

        <div className="brand">

          <div className="brand-icon">
            P
          </div>

          <span>
            ParkSmart
          </span>

        </div>


        <div className="nav-right">

          <span className="welcome-text">

            Welcome,{" "}

            {currentUser?.name ||
              "User"}

          </span>


          <button
            className="logout-btn"
            onClick={handleUserLogout}
          >

            Logout

          </button>

        </div>

      </nav>


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="dashboard-content">


        {/* =====================================
            RESERVATION SUCCESS
        ===================================== */}

        {reservation &&
        paymentSuccess ? (

          <section className="reservation-success">

            <div className="success-icon">
              ✓
            </div>


            <p className="section-label">

              {reservation.paymentMethod ===
              "cash"

                ? "RESERVATION CONFIRMED"

                : "PAYMENT SUCCESSFUL"}

            </p>


            <h1>
              Your parking is reserved!
            </h1>


            <p className="success-description">

              {reservation.paymentMethod ===
              "cash"

                ? "Your parking slot has been reserved. Please pay the parking fee at the parking centre."

                : "Your payment has been successfully processed and your parking slot is confirmed."}

            </p>


            {/* PARKING PASS */}

            <div className="parking-pass">


              <div className="pass-top">

                <div>

                  <span className="pass-brand">
                    PARKSMART
                  </span>

                  <h2>
                    Parking Pass
                  </h2>

                </div>


                <div className="pass-status">
                  CONFIRMED
                </div>

              </div>


              <div className="pass-divider"></div>


              <div className="pass-main">

                <div className="pass-slot">

                  <span>
                    PARKING SLOT
                  </span>

                  <strong>
                    P-{reservation.slot}
                  </strong>

                </div>


                <div className="pass-id">

                  <span>
                    RESERVATION ID
                  </span>

                  <strong>
                    PS-{reservation.id}
                  </strong>

                </div>

              </div>


              <div className="pass-details">


                <div>

                  <span>
                    Customer
                  </span>

                  <strong>
                    {reservation.userName}
                  </strong>

                </div>


                <div>

                  <span>
                    Parking Centre
                  </span>

                  <strong>
                    {reservation.parkingName}
                  </strong>

                </div>


                <div>

                  <span>
                    Location
                  </span>

                  <strong>
                    {reservation.location}
                  </strong>

                </div>


                <div>

                  <span>
                    Vehicle Number
                  </span>

                  <strong>
                    {reservation.vehicleNumber}
                  </strong>

                </div>


                <div>

                  <span>
                    Date
                  </span>

                  <strong>
                    {reservation.date}
                  </strong>

                </div>


                <div>

                  <span>
                    Booking Time
                  </span>

                  <strong>
                    {reservation.time}
                  </strong>

                </div>


                <div>

                  <span>
                    Payment
                  </span>

                  <strong>

                    {reservation.paymentMethod ===
                    "cash"

                      ? "Cash at Centre"

                      : "Online Paid"}

                  </strong>

                </div>

              </div>


              <div className="pass-divider"></div>


              <div className="pass-bottom">

                <div>

                  <span>
                    Parking Fee
                  </span>

                  <strong>
                    ₹{reservation.price}/hour
                  </strong>

                </div>


                <div className="pass-entry">

                  🚗 Show this pass at entry

                </div>

              </div>

            </div>


            {/* ACTION */}

            <div className="pass-actions">

              <button
                className="new-reservation-btn"
                onClick={handleNewReservation}
              >

                Make Another Reservation →

              </button>

            </div>

          </section>


        ) : showPayment &&
          selectedParking ? (

          /* =====================================
             PAYMENT
          ===================================== */

          <section className="payment-section">


            <button
              className="back-btn"
              onClick={() =>
                setShowPayment(false)
              }
            >

              ← Back to Slot Selection

            </button>


            <div className="payment-header">

              <p className="section-label">
                STEP 04
              </p>

              <h1>
                Complete Your Payment
              </h1>

              <p>
                Choose how you want to pay for
                your parking session.
              </p>

            </div>


            <div className="payment-layout">


              {/* SUMMARY */}

              <div className="payment-summary">

                <div className="summary-heading">

                  <span>
                    PARKING SUMMARY
                  </span>

                  <h3>
                    {selectedParking.name}
                  </h3>

                </div>


                <div className="summary-row">

                  <span>
                    Location
                  </span>

                  <strong>
                    {selectedParking.location}
                  </strong>

                </div>


                <div className="summary-row">

                  <span>
                    Vehicle
                  </span>

                  <strong>
                    {vehicleNumber}
                  </strong>

                </div>


                <div className="summary-row">

                  <span>
                    Parking Slot
                  </span>

                  <strong>
                    P-{selectedSlot}
                  </strong>

                </div>


                <div className="summary-row">

                  <span>
                    Rate
                  </span>

                  <strong>
                    ₹{selectedParking.price}/hour
                  </strong>

                </div>


                <div className="summary-total">

                  <span>
                    Total Parking Fee
                  </span>

                  <strong>
                    ₹{selectedParking.price}
                  </strong>

                </div>

              </div>


              {/* PAYMENT METHODS */}

              <div className="payment-methods">

                <h3>
                  Select Payment Method
                </h3>


                {/* CASH */}

                <button

                  type="button"

                  className={`payment-method ${
                    paymentMethod === "cash"
                      ? "payment-selected"
                      : ""
                  }`}

                  onClick={() =>
                    setPaymentMethod("cash")
                  }
                >

                  <div className="payment-method-icon">
                    ₹
                  </div>


                  <div className="payment-method-text">

                    <strong>
                      Pay by Cash
                    </strong>

                    <span>
                      Pay the parking fee at the
                      parking centre.
                    </span>

                  </div>


                  <div className="radio-circle">

                    {paymentMethod ===
                    "cash"
                      ? "✓"
                      : ""}

                  </div>

                </button>


                {/* ONLINE */}

                <button

                  type="button"

                  className={`payment-method ${
                    paymentMethod === "online"
                      ? "payment-selected"
                      : ""
                  }`}

                  onClick={() =>
                    setPaymentMethod("online")
                  }
                >

                  <div className="payment-method-icon">
                    💳
                  </div>


                  <div className="payment-method-text">

                    <strong>
                      Dummy Online Payment
                    </strong>

                    <span>
                      Simulated payment for prototype
                      demonstration.
                    </span>

                  </div>


                  <div className="radio-circle">

                    {paymentMethod ===
                    "online"
                      ? "✓"
                      : ""}

                  </div>

                </button>


                {/* PAYMENT BUTTON */}

                <button

                  type="button"

                  className="pay-now-btn"

                  disabled={!paymentMethod}

                  onClick={handlePayment}
                >

                  {paymentMethod ===
                  "cash"

                    ? "Confirm Cash Payment →"

                    : "Pay ₹" +
                      (selectedParking.price ||
                        0) +
                      " →"}

                </button>


                <p className="demo-payment-note">

                  🔒 This is a demonstration payment
                  system. No real money will be charged.

                </p>

              </div>

            </div>

          </section>


        ) : selectedParking ? (

          /* =====================================
             SLOT SELECTION
          ===================================== */

          <section className="slot-selection-section">


            <button
              className="back-btn"
              onClick={handleBackToParking}
            >

              ← Back to Parking Centres

            </button>


            <div className="slot-page-header">

              <div>

                <p className="section-label">
                  STEP 03
                </p>

                <h1>
                  Select Your Parking Slot
                </h1>

                <p>
                  {selectedParking.name}
                  {" · "}
                  {selectedParking.location}
                </p>

              </div>


              <div className="selected-parking-price">

                <span>
                  Parking Fee
                </span>

                <strong>

                  ₹{selectedParking.price}

                  <small>
                    /hour
                  </small>

                </strong>

              </div>

            </div>


            {/* LEGEND */}

            <div className="slot-legend">

              <div>

                <span className="legend-box available"></span>

                Available

              </div>


              <div>

                <span className="legend-box occupied"></span>

                Occupied

              </div>


              <div>

                <span className="legend-box selected"></span>

                Selected

              </div>

            </div>


            {/* PARKING LAYOUT */}

            <div className="parking-layout">

              <div className="parking-road">
                ENTRY / EXIT
              </div>


              <div className="slot-grid">

                {generateSlots()
                  .slice(0, 20)
                  .map((slot) => (

                    <button

                      key={slot.number}

                      disabled={
                        !slot.available
                      }

                      className={`parking-slot ${
                        !slot.available
                          ? "occupied"
                          : selectedSlot ===
                            slot.number
                          ? "selected"
                          : "available"
                      }`}

                      onClick={() =>
                        setSelectedSlot(
                          slot.number
                        )
                      }
                    >

                      <span>
                        P
                      </span>

                      {slot.number}

                    </button>

                  ))}

              </div>

            </div>


            {/* CONFIRM */}

            <div className="slot-confirm-bar">

              <div>

                <span>
                  Selected Slot
                </span>

                <strong>

                  {selectedSlot
                    ? `P-${selectedSlot}`
                    : "Not selected"}

                </strong>

              </div>


              <button

                className="confirm-slot-btn"

                disabled={!selectedSlot}

                onClick={
                  handleProceedToPayment
                }
              >

                Continue to Payment →

              </button>

            </div>

          </section>


        ) : (

          /* =====================================
             MAIN DASHBOARD
          ===================================== */

          <>

            {/* HERO */}

            <section className="hero-section">

              <div>

                <p className="small-heading">
                  SMART PARKING MANAGEMENT
                </p>


                <h1>

                  Find a parking spot

                  <br />

                  <span>
                    without the hassle.
                  </span>

                </h1>


                <p className="hero-description">

                  Search nearby parking centres,
                  check available slots and reserve
                  your parking space easily.

                </p>

              </div>


              <div className="hero-card">

                <div className="hero-card-icon">
                  🚗
                </div>

                <h3>
                  Quick Parking
                </h3>

                <p>
                  Find available parking spaces near
                  you.
                </p>

              </div>

            </section>


            {/* VEHICLE DETAILS */}

            <section className="vehicle-section">

              <div className="section-heading">

                <div>

                  <p className="section-label">
                    STEP 01
                  </p>

                  <h2>
                    Enter Vehicle Details
                  </h2>

                </div>


                <p>

                  We use these details to manage your
                  parking session.

                </p>

              </div>


              <form

                className="vehicle-form"

                onSubmit={
                  handleFindParking
                }
              >

                <div className="input-group">

                  <label>
                    Vehicle Number
                  </label>


                  <input

                    type="text"

                    placeholder="e.g. DL01AB1234"

                    value={vehicleNumber}

                    onChange={(e) =>
                      setVehicleNumber(
                        e.target.value.toUpperCase()
                      )
                    }

                  />

                </div>


                <div className="input-group">

                  <label>
                    Driving License Number
                  </label>


                  <input

                    type="text"

                    placeholder="Enter license number"

                    value={licenseNumber}

                    onChange={(e) =>
                      setLicenseNumber(
                        e.target.value.toUpperCase()
                      )
                    }

                  />

                </div>


                <button

                  type="submit"

                  className="find-parking-btn"
                >

                  Find Nearest Parking

                  <span>
                    →
                  </span>

                </button>

              </form>

            </section>


            {/* PARKING RESULTS */}

            {showParking && (

              <section className="parking-section">


                <div className="section-heading parking-heading">

                  <div>

                    <p className="section-label">
                      STEP 02
                    </p>

                    <h2>
                      Nearby Parking Centres
                    </h2>

                  </div>


                  {parkingCenters.length >
                    0 && (

                    <span className="result-count">

                      {parkingCenters.length}

                      {" "}

                      centres found

                    </span>

                  )}

                </div>


                {parkingCenters.length ===
                0 ? (

                  <div className="no-parking">

                    <div className="no-parking-icon">
                      🅿️
                    </div>


                    <h3>
                      No parking centres available
                    </h3>


                    <p>

                      There are currently no parking
                      centres registered in the system.

                    </p>

                  </div>

                ) : (

                  <div className="parking-grid">

                    {parkingCenters.map(
                      (parking) => (

                        <div

                          className="parking-card"

                          key={parking.id}
                        >

                          <div className="parking-card-top">

                            <div className="parking-icon">
                              P
                            </div>


                            <span className="available-badge">

                              {parking.availableSlots}

                              {" "}

                              slots available

                            </span>

                          </div>


                          <h3>
                            {parking.name}
                          </h3>


                          <p className="parking-location">

                            📍 {parking.location}

                          </p>


                          <div className="parking-info">


                            <div>

                              <span>
                                Distance
                              </span>

                              <strong>
                                Nearby
                              </strong>

                            </div>


                            <div>

                              <span>
                                Price
                              </span>

                              <strong>
                                ₹{parking.price}/hr
                              </strong>

                            </div>


                            <div>

                              <span>
                                Contact
                              </span>

                              <strong>
                                {parking.contact}
                              </strong>

                            </div>

                          </div>


                          <div className="slot-progress">

                            <div className="slot-progress-text">

                              <span>
                                Parking availability
                              </span>

                              <span>

                                {parking.availableSlots}/
                                {parking.totalSlots}

                              </span>

                            </div>


                            <div className="progress-bar">

                              <div

                                className="progress-fill"

                                style={{
                                  width:
                                    `${
                                      parking.totalSlots >
                                      0
                                        ? (
                                            parking.availableSlots /
                                            parking.totalSlots
                                          ) *
                                          100
                                        : 0
                                    }%`,
                                }}

                              ></div>

                            </div>

                          </div>


                          <div className="parking-timing">

                            🕐{" "}

                            {parking.openingTime}

                            {" - "}

                            {parking.closingTime}

                          </div>


                          <button

                            className="reserve-btn"

                            onClick={() =>
                              handleReserve(
                                parking
                              )
                            }
                          >

                            View & Reserve

                            <span>
                              →
                            </span>

                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

            )}

          </>

        )}

      </main>


      {/* FOOTER */}

      <footer className="dashboard-footer">

        <p>
          © 2026 ParkSmart. Smart parking made simple.
        </p>

      </footer>

    </div>

  );

}

export default UserDashboard;