import { useEffect, useState } from "react";
import "./PartnerDashboard.css";

function PartnerDashboard({ user, onLogout }) {

  /* =========================================
     PARTNER ID
  ========================================= */

  const partnerId = user?.id;


  /* =========================================
     STORAGE KEYS
  ========================================= */

  const parkingStorageKey =
    `parkingCenters_${partnerId}`;

  const reservationStorageKey =
    `reservations_${partnerId}`;


  /* =========================================
     STATES
  ========================================= */

  const [parkingCenters, setParkingCenters] =
    useState([]);

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [showReservations, setShowReservations] =
    useState(false);

  const [reservations, setReservations] =
    useState([]);


  const [formData, setFormData] = useState({
    name: "",
    location: "",
    totalSlots: "",
    availableSlots: "",
    price: "",
    contact: "",
    openingTime: "08:00",
    closingTime: "22:00",
  });


  /* =========================================
     LOAD DATA
  ========================================= */

  useEffect(() => {

    if (!partnerId) {
      return;
    }

    loadParkingCenters();
    loadReservations();

  }, [partnerId]);


  /* =========================================
     LOAD PARKING CENTRES
  ========================================= */

  const loadParkingCenters = () => {

    if (!partnerId) {
      return;
    }

    const saved =
      localStorage.getItem(
        parkingStorageKey
      );

    if (saved) {

      try {

        setParkingCenters(
          JSON.parse(saved)
        );

      } catch (error) {

        console.error(
          "Error loading parking centres:",
          error
        );

        setParkingCenters([]);

      }

    } else {

      setParkingCenters([]);

    }
  };


  /* =========================================
     LOAD RESERVATIONS
  ========================================= */

  const loadReservations = () => {

    if (!partnerId) {
      return;
    }

    const saved =
      localStorage.getItem(
        reservationStorageKey
      );

    if (saved) {

      try {

        setReservations(
          JSON.parse(saved)
        );

      } catch (error) {

        console.error(
          "Error loading reservations:",
          error
        );

        setReservations([]);

      }

    } else {

      setReservations([]);

    }
  };


  /* =========================================
     FORM INPUT
  ========================================= */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };


  /* =========================================
     ADD / UPDATE PARKING
  ========================================= */

  const handleSubmit = (e) => {

    e.preventDefault();


    if (
      !formData.name ||
      !formData.location ||
      !formData.totalSlots ||
      formData.availableSlots === "" ||
      formData.price === "" ||
      !formData.contact
    ) {

      alert(
        "Please fill all required fields."
      );

      return;
    }


    const totalSlots =
      Number(formData.totalSlots);

    const availableSlots =
      Number(formData.availableSlots);

    const price =
      Number(formData.price);


    if (totalSlots <= 0) {

      alert(
        "Total slots must be greater than 0."
      );

      return;
    }


    if (availableSlots < 0) {

      alert(
        "Available slots cannot be negative."
      );

      return;
    }


    if (availableSlots > totalSlots) {

      alert(
        "Available slots cannot be greater than total slots."
      );

      return;
    }


    if (price < 0) {

      alert(
        "Price cannot be negative."
      );

      return;
    }


    let updatedCenters;


    /* =========================================
       UPDATE EXISTING PARKING
    ========================================= */

    if (editingId) {

      updatedCenters =
        parkingCenters.map(
          (parking) => {

            if (
              parking.id === editingId
            ) {

              return {

                ...parking,

                name:
                  formData.name,

                location:
                  formData.location,

                totalSlots:
                  totalSlots,

                availableSlots:
                  availableSlots,

                price:
                  price,

                contact:
                  formData.contact,

                openingTime:
                  formData.openingTime,

                closingTime:
                  formData.closingTime,

                partnerId:
                  partnerId,

              };

            }

            return parking;

          }
        );

    }


    /* =========================================
       ADD NEW PARKING
    ========================================= */

    else {

      const newParking = {

        id:
          Date.now(),

        partnerId:
          partnerId,

        name:
          formData.name,

        location:
          formData.location,

        totalSlots:
          totalSlots,

        availableSlots:
          availableSlots,

        price:
          price,

        contact:
          formData.contact,

        openingTime:
          formData.openingTime,

        closingTime:
          formData.closingTime,

      };


      updatedCenters = [

        ...parkingCenters,

        newParking,

      ];

    }


    /* =========================================
       SAVE ONLY FOR THIS PARTNER
    ========================================= */

    localStorage.setItem(

      parkingStorageKey,

      JSON.stringify(
        updatedCenters
      )

    );


    setParkingCenters(
      updatedCenters
    );


    const wasEditing =
      Boolean(editingId);


    resetForm();


    alert(

      wasEditing

        ? "Parking centre updated successfully."

        : "Parking centre added successfully."

    );

  };


  /* =========================================
     RESET FORM
  ========================================= */

  const resetForm = () => {

    setFormData({

      name: "",

      location: "",

      totalSlots: "",

      availableSlots: "",

      price: "",

      contact: "",

      openingTime: "08:00",

      closingTime: "22:00",

    });

    setEditingId(null);

    setShowAddForm(false);

  };


  /* =========================================
     EDIT PARKING
  ========================================= */

  const handleEdit = (parking) => {

    setFormData({

      name:
        parking.name,

      location:
        parking.location,

      totalSlots:
        parking.totalSlots,

      availableSlots:
        parking.availableSlots,

      price:
        parking.price,

      contact:
        parking.contact,

      openingTime:
        parking.openingTime,

      closingTime:
        parking.closingTime,

    });


    setEditingId(
      parking.id
    );

    setShowAddForm(true);


    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };


  /* =========================================
     DELETE PARKING
  ========================================= */

  const handleDelete = (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this parking centre?"
      );


    if (!confirmDelete) {
      return;
    }


    const updatedCenters =
      parkingCenters.filter(

        (parking) =>
          parking.id !== id

      );


    localStorage.setItem(

      parkingStorageKey,

      JSON.stringify(
        updatedCenters
      )

    );


    setParkingCenters(
      updatedCenters
    );

  };


  /* =========================================
     UPDATE AVAILABLE SLOTS
  ========================================= */

  const updateSlots = (
    parking,
    change
  ) => {

    const newAvailable =
      Number(
        parking.availableSlots
      ) + change;


    if (

      newAvailable < 0 ||

      newAvailable >
        Number(
          parking.totalSlots
        )

    ) {

      return;

    }


    const updatedCenters =
      parkingCenters.map(
        (item) => {

          if (
            item.id === parking.id
          ) {

            return {

              ...item,

              availableSlots:
                newAvailable,

            };

          }

          return item;

        }
      );


    localStorage.setItem(

      parkingStorageKey,

      JSON.stringify(
        updatedCenters
      )

    );


    setParkingCenters(
      updatedCenters
    );

  };


  /* =========================================
     STATISTICS
  ========================================= */

  const totalParkingCentres =
    parkingCenters.length;


  const totalSlots =
    parkingCenters.reduce(

      (sum, parking) =>

        sum +
        Number(
          parking.totalSlots || 0
        ),

      0

    );


  const availableSlots =
    parkingCenters.reduce(

      (sum, parking) =>

        sum +
        Number(
          parking.availableSlots || 0
        ),

      0

    );


  const occupiedSlots =
    totalSlots -
    availableSlots;


  /* =========================================
     DASHBOARD
  ========================================= */

  return (

    <div className="partner-dashboard">


      {/* =====================================
          NAVBAR
      ===================================== */}

      <nav className="partner-navbar">


        <div className="partner-brand">


          <div className="partner-brand-icon">
            P
          </div>


          <div>

            <strong>
              ParkSmart
            </strong>

            <span>
              Partner Portal
            </span>

          </div>

        </div>


        <div className="partner-nav-right">


          <div className="partner-profile">


            <div className="partner-avatar">

              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "P"}

            </div>


            <div>

              <strong>

                {user?.name ||
                  "Parking Partner"}

              </strong>


              <span>
                Partner Account
              </span>

            </div>

          </div>


          <button

            className="partner-logout"

            onClick={onLogout}

          >

            Logout

          </button>


        </div>

      </nav>


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="partner-content">


        {/* HEADER */}

        <section className="partner-header">


          <div>

            <p className="partner-label">
              PARTNER DASHBOARD
            </p>


            <h1>
              Welcome, {user?.name || "Partner"}!
            </h1>


            <p>
              Manage your parking centres,
              slot availability and reservations.
            </p>

          </div>


          <button

            className="add-parking-btn"

            onClick={() => {

              if (showAddForm) {

                resetForm();

              } else {

                setShowAddForm(true);

              }

            }}

          >

            {showAddForm
              ? "✕ Close"
              : "+ Add Parking Centre"}

          </button>


        </section>


        {/* =====================================
            STATISTICS
        ===================================== */}

        <section className="partner-stats">


          <div className="partner-stat-card">


            <div className="stat-icon blue">
              P
            </div>


            <div>

              <span>
                Parking Centres
              </span>

              <strong>
                {totalParkingCentres}
              </strong>

            </div>


          </div>


          <div className="partner-stat-card">


            <div className="stat-icon purple">
              ▦
            </div>


            <div>

              <span>
                Total Slots
              </span>

              <strong>
                {totalSlots}
              </strong>

            </div>


          </div>


          <div className="partner-stat-card">


            <div className="stat-icon green">
              ✓
            </div>


            <div>

              <span>
                Available
              </span>

              <strong>
                {availableSlots}
              </strong>

            </div>


          </div>


          <div className="partner-stat-card">


            <div className="stat-icon red">
              ●
            </div>


            <div>

              <span>
                Occupied
              </span>

              <strong>
                {occupiedSlots}
              </strong>

            </div>


          </div>


        </section>


        {/* =====================================
            ADD / EDIT FORM
        ===================================== */}

        {showAddForm && (

          <section className="parking-form-section">


            <div className="form-section-header">


              <div>

                <p className="partner-label">

                  {editingId
                    ? "UPDATE FACILITY"
                    : "NEW FACILITY"}

                </p>


                <h2>

                  {editingId
                    ? "Update Parking Centre"
                    : "Add Parking Centre"}

                </h2>

              </div>


            </div>


            <form

              className="parking-form"

              onSubmit={handleSubmit}

            >


              {/* NAME */}

              <div className="partner-input">

                <label>
                  Parking Centre Name *
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. City Center Parking"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>


              {/* LOCATION */}

              <div className="partner-input">

                <label>
                  Location *
                </label>

                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Main Market Road"
                  value={formData.location}
                  onChange={handleChange}
                />

              </div>


              {/* TOTAL */}

              <div className="partner-input">

                <label>
                  Total Slots *
                </label>

                <input
                  type="number"
                  name="totalSlots"
                  min="1"
                  placeholder="50"
                  value={formData.totalSlots}
                  onChange={handleChange}
                />

              </div>


              {/* AVAILABLE */}

              <div className="partner-input">

                <label>
                  Available Slots *
                </label>

                <input
                  type="number"
                  name="availableSlots"
                  min="0"
                  placeholder="35"
                  value={formData.availableSlots}
                  onChange={handleChange}
                />

              </div>


              {/* PRICE */}

              <div className="partner-input">

                <label>
                  Price per Hour (₹) *
                </label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  placeholder="30"
                  value={formData.price}
                  onChange={handleChange}
                />

              </div>


              {/* CONTACT */}

              <div className="partner-input">

                <label>
                  Contact Number *
                </label>

                <input
                  type="tel"
                  name="contact"
                  placeholder="9876543210"
                  value={formData.contact}
                  onChange={handleChange}
                />

              </div>


              {/* OPENING */}

              <div className="partner-input">

                <label>
                  Opening Time
                </label>

                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                />

              </div>


              {/* CLOSING */}

              <div className="partner-input">

                <label>
                  Closing Time
                </label>

                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                />

              </div>


              {/* ACTIONS */}

              <div className="parking-form-actions">


                <button

                  type="button"

                  className="cancel-form-btn"

                  onClick={resetForm}

                >

                  Cancel

                </button>


                <button

                  type="submit"

                  className="save-parking-btn"

                >

                  {editingId
                    ? "Update Parking Centre"
                    : "Save Parking Centre"}

                </button>


              </div>


            </form>

          </section>

        )}


        {/* =====================================
            PARKING CENTRES
        ===================================== */}

        <section className="partner-parking-section">


          <div className="partner-section-title">


            <div>

              <p className="partner-label">
                YOUR FACILITIES
              </p>

              <h2>
                My Parking Centres
              </h2>

            </div>


            <span>

              {parkingCenters.length} centres

            </span>


          </div>


          {parkingCenters.length === 0 ? (

            <div className="partner-empty">


              <div className="partner-empty-icon">
                P
              </div>


              <h3>
                No parking centre added yet
              </h3>


              <p>
                Add your first parking centre
                to start managing parking
                availability.
              </p>


              <button

                className="add-parking-btn"

                onClick={() =>
                  setShowAddForm(true)
                }

              >

                + Add Parking Centre

              </button>


            </div>

          ) : (

            <div className="partner-parking-grid">


              {parkingCenters.map(
                (parking) => {

                  const total =
                    Number(
                      parking.totalSlots
                    );

                  const available =
                    Number(
                      parking.availableSlots
                    );

                  const occupied =
                    total - available;


                  const percentage =
                    total > 0
                      ? (
                          available /
                          total
                        ) * 100
                      : 0;


                  return (

                    <div

                      className="partner-parking-card"

                      key={parking.id}

                    >


                      {/* CARD HEADER */}

                      <div className="partner-card-header">


                        <div className="partner-parking-icon">
                          P
                        </div>


                        <div className="partner-card-actions">


                          <button

                            onClick={() =>
                              handleEdit(
                                parking
                              )
                            }

                            title="Edit"

                          >

                            ✎

                          </button>


                          <button

                            onClick={() =>
                              handleDelete(
                                parking.id
                              )
                            }

                            title="Delete"

                          >

                            ×

                          </button>


                        </div>

                      </div>


                      {/* NAME */}

                      <h3>
                        {parking.name}
                      </h3>


                      <p className="partner-location">
                        📍 {parking.location}
                      </p>


                      {/* STATUS */}

                      <div className="availability-header">


                        <span>
                          Slot Availability
                        </span>


                        <strong>
                          {available}/{total}
                        </strong>


                      </div>


                      <div className="partner-progress">


                        <div

                          className="partner-progress-fill"

                          style={{
                            width:
                              `${percentage}%`,
                          }}

                        ></div>


                      </div>


                      {/* SLOT STATS */}

                      <div className="slot-stat-row">


                        <div>

                          <span>
                            Available
                          </span>

                          <strong className="available-number">
                            {available}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Occupied
                          </span>

                          <strong className="occupied-number">
                            {occupied}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Rate
                          </span>

                          <strong>
                            ₹{parking.price}
                          </strong>

                        </div>


                      </div>


                      {/* SLOT CONTROLS */}

                      <div className="slot-controls">


                        <span>
                          Update availability
                        </span>


                        <div>


                          <button

                            onClick={() =>
                              updateSlots(
                                parking,
                                -1
                              )
                            }

                          >

                            −

                          </button>


                          <strong>
                            {available}
                          </strong>


                          <button

                            onClick={() =>
                              updateSlots(
                                parking,
                                1
                              )
                            }

                          >

                            +

                          </button>


                        </div>


                      </div>


                      {/* FOOTER */}

                      <div className="partner-card-footer">


                        <span>
                          🕐{" "}
                          {parking.openingTime}
                          {" - "}
                          {parking.closingTime}
                        </span>


                        <span>
                          📞{" "}
                          {parking.contact}
                        </span>


                      </div>


                    </div>

                  );

                }

              )}

            </div>

          )}


        </section>


        {/* =====================================
            RESERVATIONS
        ===================================== */}

        <section className="partner-reservation-section">


          <div className="partner-section-title">


            <div>

              <p className="partner-label">
                BOOKINGS
              </p>


              <h2>
                User Reservations
              </h2>

            </div>


            <button

              className="view-reservations-btn"

              onClick={() => {

                loadReservations();

                setShowReservations(
                  !showReservations
                );

              }}

            >

              {showReservations
                ? "Hide Reservations"
                : "View Reservations →"}

            </button>


          </div>


          {showReservations && (

            reservations.length === 0 ? (

              <div className="no-reservations">


                <div>
                  📋
                </div>


                <h3>
                  No reservations yet
                </h3>


                <p>
                  User bookings will appear
                  here after a reservation
                  is completed.
                </p>


              </div>

            ) : (

              <div className="reservation-table-wrapper">


                <table className="reservation-table">


                  <thead>

                    <tr>

                      <th>
                        Reservation
                      </th>

                      <th>
                        Parking Centre
                      </th>

                      <th>
                        Vehicle
                      </th>

                      <th>
                        Slot
                      </th>

                      <th>
                        Payment
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {reservations.map(
                      (reservation) => (

                        <tr
                          key={
                            reservation.id
                          }
                        >


                          <td>

                            <strong>
                              PS-
                              {
                                reservation.id
                              }
                            </strong>

                            <span>
                              {
                                reservation.date
                              }
                            </span>

                          </td>


                          <td>
                            {
                              reservation.parkingName
                            }
                          </td>


                          <td>
                            {
                              reservation.vehicleNumber
                            }
                          </td>


                          <td>

                            <span className="table-slot">

                              P-
                              {
                                reservation.slot
                              }

                            </span>

                          </td>


                          <td>

                            {
                              reservation.paymentMethod ===
                              "cash"
                                ? "Cash"
                                : "Online"
                            }

                          </td>


                          <td>

                            <span className="confirmed-status">
                              Confirmed
                            </span>

                          </td>


                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )

          )}


        </section>


      </main>


      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="partner-footer">

        <p>
          © 2026 ParkSmart Partner Portal
        </p>

        <span>
          Smart parking management made simple.
        </span>

      </footer>


    </div>

  );

}

export default PartnerDashboard;