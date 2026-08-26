const API_URL = "http://localhost:5000/api";


/* =========================================
   HELPER FUNCTION
========================================= */

async function request(endpoint, options = {}) {

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",

        ...(options.headers || {}),
      },

      ...options,
    }
  );


  const data = await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Something went wrong"
    );

  }


  return data;
}


/* =========================================
   AUTH
========================================= */

export const registerUser = async (userData) => {

  return request(
    "/auth/register",
    {
      method: "POST",

      body: JSON.stringify(userData),
    }
  );

};


export const registerPartner = async (partnerData) => {

  return request(
    "/auth/register-partner",
    {
      method: "POST",

      body: JSON.stringify(partnerData),
    }
  );

};


export const loginUser = async (
  email,
  password,
  role
) => {

  return request(
    "/auth/login",
    {
      method: "POST",

      body: JSON.stringify({
        email,
        password,
        role,
      }),
    }
  );

};


/* =========================================
   TOKEN
========================================= */

const getToken = () => {

  return localStorage.getItem(
    "parksmart_token"
  );

};


/* =========================================
   AUTHENTICATED REQUEST
========================================= */

const authenticatedRequest = async (
  endpoint,
  options = {}
) => {

  const token = getToken();


  return request(
    endpoint,
    {
      ...options,

      headers: {

        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,

        ...(options.headers || {}),
      },
    }
  );

};


/* =========================================
   PARKING
========================================= */

export const getParkingCentres = async () => {

  return request(
    "/parking"
  );

};


export const addParkingCentre = async (
  parkingData
) => {

  return authenticatedRequest(
    "/parking",
    {
      method: "POST",

      body: JSON.stringify(
        parkingData
      ),
    }
  );

};


export const updateParkingCentre = async (
  id,
  parkingData
) => {

  return authenticatedRequest(
    `/parking/${id}`,
    {
      method: "PUT",

      body: JSON.stringify(
        parkingData
      ),
    }
  );

};


export const deleteParkingCentre = async (
  id
) => {

  return authenticatedRequest(
    `/parking/${id}`,
    {
      method: "DELETE",
    }
  );

};


export const updateParkingSlots = async (
  id,
  availableSlots
) => {

  return authenticatedRequest(
    `/parking/${id}/slots`,
    {
      method: "PATCH",

      body: JSON.stringify({
        availableSlots,
      }),
    }
  );

};


/* =========================================
   RESERVATIONS
========================================= */

export const createReservation = async (
  reservationData
) => {

  return authenticatedRequest(
    "/reservations",
    {
      method: "POST",

      body: JSON.stringify(
        reservationData
      ),
    }
  );

};


export const getMyReservations = async () => {

  return authenticatedRequest(
    "/reservations/my"
  );

};


export const getPartnerReservations =
  async () => {

    return authenticatedRequest(
      "/partner/reservations"
    );

  };