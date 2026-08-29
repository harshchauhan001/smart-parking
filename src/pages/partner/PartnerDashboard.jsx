import { useEffect, useState } from "react";
import "./PartnerDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function PartnerDashboard({ user, onLogout }) {

  const partnerId = user?.id;

  const [parkingCenters, setParkingCenters] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showReservations, setShowReservations] = useState(false);
  const [reservations, setReservations] = useState([]);

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

    if (!partnerId) return;

    loadParkingCenters();
    loadReservations();

  }, [partnerId]);


  /* =========================================
     GET TOKEN
  ========================================= */

  const getToken = () => {
  return localStorage.getItem("parksmart_token");
};


  /* =========================================
     LOAD PARTNER PARKING
  ========================================= */

  const loadParkingCenters = async () => {

    try {

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/partner/parking`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("PARTNER PARKING RESPONSE:", data);

      if (!response.ok) {

        throw new Error(
          data.message || "Could not load parking"
        );

      }

      setParkingCenters(data);

    } catch (error) {

      console.error(
        "LOAD PARTNER PARKING ERROR:",
        error
      );

      setParkingCenters([]);

    }

  };


  /* =========================================
     LOAD PARTNER RESERVATIONS
  ========================================= */

  const loadReservations = async () => {

    try {

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/partner/reservations`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "PARTNER RESERVATIONS:",
        data
      );

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Could not load reservations"
        );

      }

      setReservations(data);

    } catch (error) {

      console.error(
        "LOAD RESERVATIONS ERROR:",
        error
      );

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

  const handleSubmit = async (e) => {

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


    try {

      const token = getToken();


      /* =====================================
         UPDATE
      ===================================== */

      if (editingId) {

        const response = await fetch(
          `${API_URL}/api/parking/${editingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: formData.name,
              location: formData.location,
              totalSlots: totalSlots,
              availableSlots: availableSlots,
              price: price,
              contact: formData.contact,
              openingTime:
                formData.openingTime,
              closingTime:
                formData.closingTime,
            }),
          }
        );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Could not update parking"
          );

        }


        alert(
          "Parking centre updated successfully."
        );

      }


      /* =====================================
         ADD
      ===================================== */

      else {

        const response = await fetch(
          `${API_URL}/api/parking`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: formData.name,
              location: formData.location,
              totalSlots: totalSlots,
              availableSlots: availableSlots,
              price: price,
              contact: formData.contact,
              openingTime:
                formData.openingTime,
              closingTime:
                formData.closingTime,
            }),
          }
        );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Could not add parking"
          );

        }


        alert(
          "Parking centre added successfully."
        );

      }


      resetForm();

      await loadParkingCenters();

    } catch (error) {

      console.error(
        "SAVE PARKING ERROR:",
        error
      );

      alert(error.message);

    }

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

      name: parking.name || "",

      location: parking.location || "",

      totalSlots:
        parking.total_slots ?? "",

      availableSlots:
        parking.available_slots ?? "",

      price:
        parking.price ?? "",

      contact:
        parking.contact || "",

      openingTime:
        parking.opening_time || "08:00",

      closingTime:
        parking.closing_time || "22:00",

    });


    setEditingId(parking.id);

    setShowAddForm(true);


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  /* =========================================
     DELETE PARKING
  ========================================= */

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this parking centre?"
      );


    if (!confirmDelete) return;


    try {

      const token = getToken();


      const response = await fetch(
        `${API_URL}/api/parking/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Could not delete parking"
        );

      }


      alert(
        "Parking centre deleted successfully."
      );


      await loadParkingCenters();

    } catch (error) {

      console.error(
        "DELETE PARKING ERROR:",
        error
      );

      alert(error.message);

    }

  };


  /* =========================================
     UPDATE AVAILABLE SLOTS
  ========================================= */

  const updateSlots = async (
    parking,
    change
  ) => {

    const currentAvailable =
      Number(parking.available_slots);

    const total =
      Number(parking.total_slots);


    const newAvailable =
      currentAvailable + change;


    if (
      newAvailable < 0 ||
      newAvailable > total
    ) {

      return;

    }


    try {

      const token = getToken();


      const response = await fetch(
        `${API_URL}/api/parking/${parking.id}/slots`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            availableSlots:
              newAvailable,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Could not update slots"
        );

      }


      await loadParkingCenters();

    } catch (error) {

      console.error(
        "UPDATE SLOTS ERROR:",
        error
      );

      alert(error.message);

    }

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
          parking.total_slots || 0
        ),
      0
    );


  const availableSlots =
    parkingCenters.reduce(
      (sum, parking) =>
        sum +
        Number(
          parking.available_slots || 0
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
                      parking.total_slots || 0
                    );

                  const available =
                    Number(
                      parking.available_slots || 0
                    );

                  const occupied =
                    total - available;


                  const percentage =
                    total > 0
                      ? (available / total) * 100
                      : 0;


                  return (

                    <div
                      className="partner-parking-card"
                      key={parking.id}
                    >


                      <div className="partner-card-header">

                        <div className="partner-parking-icon">
                          P
                        </div>


                        <div className="partner-card-actions">

                          <button
                            onClick={() =>
                              handleEdit(parking)
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


                      <h3>
                        {parking.name}
                      </h3>


                      <p className="partner-location">
                        📍 {parking.location}
                      </p>


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


                      <div className="partner-card-footer">

                        <span>
                          🕐{" "}
                          {parking.opening_time ||
                            "08:00"}
                          {" - "}
                          {parking.closing_time ||
                            "22:00"}
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
                              {reservation.id}
                            </strong>

                            <span>
                              {
                                reservation.created_at ||
                                reservation.date ||
                                ""
                              }
                            </span>

                          </td>


                          <td>
                            {
                              reservation.parking_name
                            }
                          </td>


                          <td>
                            {
                              reservation.vehicle_number
                            }
                          </td>


                          <td>

                            <span className="table-slot">

                              P-
                              {
                                reservation.slot_number
                              }

                            </span>

                          </td>


                          <td>

                            {
                              reservation.payment_method ===
                              "cash"
                                ? "Cash"
                                : "Online"
                            }

                          </td>


                          <td>

                            <span className="confirmed-status">

                              {
                                reservation.status ||
                                "Confirmed"
                              }

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