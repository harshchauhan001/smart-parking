require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

/* =========================================
   MIDDLEWARE
========================================= */

app.use(cors());
app.use(express.json());


/* =========================================
   CONFIGURATION
========================================= */

const PORT = process.env.PORT || 5000;

const JWT_SECRET =
  process.env.JWT_SECRET || "parksmart_secret";


/* =========================================
   TEST ROUTE
========================================= */

app.get("/", (req, res) => {
  res.json({
    message: "ParkSmart backend is running successfully!"
  });
});


/* =========================================
   AUTHENTICATION MIDDLEWARE
========================================= */

function authenticateToken(req, res, next) {

  const authHeader = req.headers["authorization"];

  const token =
    authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  jwt.verify(
    token,
    JWT_SECRET,
    (error, user) => {

      if (error) {
        return res.status(403).json({
          message: "Invalid or expired token"
        });
      }

      req.user = user;

      next();
    }
  );
}


/* =========================================
   REGISTER USER
========================================= */

app.post("/api/auth/register", async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      vehicleNumber,
      licenseNumber
    } = req.body;


    if (
      !name ||
      !email ||
      !password ||
      !vehicleNumber ||
      !licenseNumber
    ) {

      return res.status(400).json({
        message: "Please fill all required fields"
      });

    }


    const [existingUsers] = await db.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      `,
      [email]
    );


    if (existingUsers.length > 0) {

      return res.status(409).json({
        message: "Email already registered"
      });

    }


    const hashedPassword =
      await bcrypt.hash(password, 10);


    const [result] = await db.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password,
        vehicle_number,
        license_number,
        role
      )
      VALUES (?, ?, ?, ?, ?, 'user')
      `,
      [
        name,
        email,
        hashedPassword,
        vehicleNumber,
        licenseNumber
      ]
    );


    res.status(201).json({

      message: "User registered successfully",

      userId: result.insertId

    });

  }

  catch (error) {

    console.error("REGISTER USER ERROR:", error);

    res.status(500).json({
      message: "Server error during registration"
    });

  }

});


/* =========================================
   REGISTER PARTNER
========================================= */

app.post("/api/auth/register-partner", async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;


    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        message: "Please fill all required fields"
      });

    }


    const [existingUsers] = await db.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      `,
      [email]
    );


    if (existingUsers.length > 0) {

      return res.status(409).json({
        message: "Email already registered"
      });

    }


    const hashedPassword =
      await bcrypt.hash(password, 10);


    const [result] = await db.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password,
        vehicle_number,
        license_number,
        role
      )
      VALUES (?, ?, ?, '', '', 'partner')
      `,
      [
        name,
        email,
        hashedPassword
      ]
    );


    res.status(201).json({

      message: "Partner registered successfully",

      partnerId: result.insertId

    });

  }

  catch (error) {

    console.error("REGISTER PARTNER ERROR:", error);

    res.status(500).json({
      message: "Server error during partner registration"
    });

  }

});


/* =========================================
   LOGIN
========================================= */

app.post("/api/auth/login", async (req, res) => {

  try {

    const {
      email,
      password,
      role
    } = req.body;


    if (
      !email ||
      !password ||
      !role
    ) {

      return res.status(400).json({
        message:
          "Email, password and role are required"
      });

    }


    const [users] = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      AND role = ?
      `,
      [email, role]
    );


    if (users.length === 0) {

      return res.status(401).json({
        message:
          "Invalid email, password or account type"
      });

    }


    const user = users[0];


    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {

      return res.status(401).json({
        message:
          "Invalid email, password or account type"
      });

    }


    const token =
      jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },

        JWT_SECRET,

        {
          expiresIn: "1d"
        }
      );


    res.json({

      message: "Login successful",

      token,

      user: {

        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,

        vehicleNumber:
          user.vehicle_number,

        licenseNumber:
          user.license_number

      }

    });

  }

  catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error during login"
    });

  }

});


/* =========================================
   GET ALL PARKING CENTRES
========================================= */

app.get("/api/parking", async (req, res) => {

  try {

    const [parking] = await db.query(
      `
      SELECT *
      FROM parking_centers
      ORDER BY id DESC
      `
    );


    res.json(parking);

  }

  catch (error) {

    console.error("GET PARKING ERROR:", error);

    res.status(500).json({
      message: "Could not load parking centres"
    });

  }

});


/* =========================================
   ADD PARKING CENTRE
========================================= */

app.post(
  "/api/parking",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "partner") {

        return res.status(403).json({
          message:
            "Only partners can add parking centres"
        });

      }


      const {
        name,
        location,
        totalSlots,
        availableSlots,
        price,
        contact,
        openingTime,
        closingTime
      } = req.body;


      if (
        !name ||
        !location ||
        totalSlots === undefined ||
        availableSlots === undefined ||
        price === undefined ||
        !contact
      ) {

        return res.status(400).json({
          message:
            "Please provide all required fields"
        });

      }


      if (
        Number(availableSlots) >
        Number(totalSlots)
      ) {

        return res.status(400).json({
          message:
            "Available slots cannot exceed total slots"
        });

      }


      const [result] = await db.query(
        `
        INSERT INTO parking_centers
        (
          partner_id,
          name,
          location,
          total_slots,
          available_slots,
          price,
          contact,
          opening_time,
          closing_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.user.id,
          name,
          location,
          Number(totalSlots),
          Number(availableSlots),
          Number(price),
          contact,
          openingTime || "08:00",
          closingTime || "22:00"
        ]
      );


      const [parkingRows] = await db.query(
        `
        SELECT *
        FROM parking_centers
        WHERE id = ?
        `,
        [result.insertId]
      );


      res.status(201).json({

        message:
          "Parking centre added successfully",

        parking:
          parkingRows[0]

      });

    }

    catch (error) {

      console.error("ADD PARKING ERROR:", error);

      res.status(500).json({
        message:
          "Could not add parking centre"
      });

    }

  }
);


/* =========================================
   UPDATE PARKING CENTRE
========================================= */

app.put(
  "/api/parking/:id",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "partner") {

        return res.status(403).json({
          message:
            "Only partners can update parking centres"
        });

      }


      const parkingId =
        Number(req.params.id);


      const [parkingRows] = await db.query(
        `
        SELECT *
        FROM parking_centers
        WHERE id = ?
        `,
        [parkingId]
      );


      if (parkingRows.length === 0) {

        return res.status(404).json({
          message:
            "Parking centre not found"
        });

      }


      const parking = parkingRows[0];


      if (
        Number(parking.partner_id) !==
        Number(req.user.id)
      ) {

        return res.status(403).json({
          message:
            "You cannot update this parking centre"
        });

      }


      const {
        name,
        location,
        totalSlots,
        availableSlots,
        price,
        contact,
        openingTime,
        closingTime
      } = req.body;


      if (
        Number(availableSlots) >
        Number(totalSlots)
      ) {

        return res.status(400).json({
          message:
            "Available slots cannot exceed total slots"
        });

      }


      await db.query(
        `
        UPDATE parking_centers
        SET
          name = ?,
          location = ?,
          total_slots = ?,
          available_slots = ?,
          price = ?,
          contact = ?,
          opening_time = ?,
          closing_time = ?
        WHERE id = ?
        `,
        [
          name,
          location,
          Number(totalSlots),
          Number(availableSlots),
          Number(price),
          contact,
          openingTime,
          closingTime,
          parkingId
        ]
      );


      const [updatedRows] = await db.query(
        `
        SELECT *
        FROM parking_centers
        WHERE id = ?
        `,
        [parkingId]
      );


      res.json({

        message:
          "Parking centre updated",

        parking:
          updatedRows[0]

      });

    }

    catch (error) {

      console.error("UPDATE PARKING ERROR:", error);

      res.status(500).json({
        message:
          "Could not update parking centre"
      });

    }

  }
);


/* =========================================
   DELETE PARKING CENTRE
========================================= */

app.delete(
  "/api/parking/:id",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "partner") {

        return res.status(403).json({
          message:
            "Only partners can delete parking centres"
        });

      }


      const parkingId =
        Number(req.params.id);


      const [parkingRows] = await db.query(
        `
        SELECT *
        FROM parking_centers
        WHERE id = ?
        `,
        [parkingId]
      );


      if (parkingRows.length === 0) {

        return res.status(404).json({
          message:
            "Parking centre not found"
        });

      }


      const parking = parkingRows[0];


      if (
        Number(parking.partner_id) !==
        Number(req.user.id)
      ) {

        return res.status(403).json({
          message:
            "You cannot delete this parking centre"
        });

      }


      await db.query(
        `
        DELETE FROM parking_centers
        WHERE id = ?
        `,
        [parkingId]
      );


      res.json({

        message:
          "Parking centre deleted successfully"

      });

    }

    catch (error) {

      console.error("DELETE PARKING ERROR:", error);

      res.status(500).json({
        message:
          "Could not delete parking centre"
      });

    }

  }
);


/* =========================================
   UPDATE AVAILABLE SLOTS
========================================= */

app.patch(
  "/api/parking/:id/slots",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "partner") {

        return res.status(403).json({
          message:
            "Only partners can update slots"
        });

      }


      const parkingId =
        Number(req.params.id);


      const {
        availableSlots
      } = req.body;


      const [parkingRows] = await db.query(
        `
        SELECT *
        FROM parking_centers
        WHERE id = ?
        `,
        [parkingId]
      );


      if (parkingRows.length === 0) {

        return res.status(404).json({
          message:
            "Parking centre not found"
        });

      }


      const parking = parkingRows[0];


      if (
        Number(parking.partner_id) !==
        Number(req.user.id)
      ) {

        return res.status(403).json({
          message:
            "You cannot update this parking centre"
        });

      }


      if (
        Number(availableSlots) < 0 ||
        Number(availableSlots) >
        Number(parking.total_slots)
      ) {

        return res.status(400).json({
          message:
            "Invalid slot availability"
        });

      }


      await db.query(
        `
        UPDATE parking_centers
        SET available_slots = ?
        WHERE id = ?
        `,
        [
          Number(availableSlots),
          parkingId
        ]
      );


      const [updatedRows] = await db.query(
        `
        SELECT *
        FROM parking_centers
        WHERE id = ?
        `,
        [parkingId]
      );


      res.json({

        message:
          "Slot availability updated",

        parking:
          updatedRows[0]

      });

    }

    catch (error) {

      console.error("UPDATE SLOTS ERROR:", error);

      res.status(500).json({
        message:
          "Could not update slots"
      });

    }

  }
);


/* =========================================
   CREATE RESERVATION
========================================= */

app.post(
  "/api/reservations",
  authenticateToken,
  async (req, res) => {

    let connection;

    try {

      if (req.user.role !== "user") {

        return res.status(403).json({
          message:
            "Only users can create reservations"
        });

      }


      const {
        parkingId,
        vehicleNumber,
        slotNumber,
        paymentMethod,
        amount
      } = req.body;


      if (
        !parkingId ||
        !vehicleNumber ||
        !slotNumber ||
        !paymentMethod ||
        amount === undefined
      ) {

        return res.status(400).json({
          message:
            "Missing reservation information"
        });

      }


      connection =
        await db.getConnection();


      await connection.beginTransaction();


      const [parkingRows] =
        await connection.query(
          `
          SELECT *
          FROM parking_centers
          WHERE id = ?
          FOR UPDATE
          `,
          [Number(parkingId)]
        );


      if (parkingRows.length === 0) {

        await connection.rollback();

        return res.status(404).json({
          message:
            "Parking centre not found"
        });

      }


      const parking =
        parkingRows[0];


      if (
        Number(parking.available_slots) <= 0
      ) {

        await connection.rollback();

        return res.status(400).json({
          message:
            "Parking centre is full"
        });

      }


      const [result] =
        await connection.query(
          `
          INSERT INTO reservations
          (
            user_id,
            parking_id,
            vehicle_number,
            slot_number,
            payment_method,
            amount,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
          `,
          [
            req.user.id,
            Number(parkingId),
            vehicleNumber,
            Number(slotNumber),
            paymentMethod,
            Number(amount)
          ]
        );


      await connection.query(
        `
        UPDATE parking_centers
        SET available_slots =
          available_slots - 1
        WHERE id = ?
        `,
        [Number(parkingId)]
      );


      await connection.commit();


      const [savedRows] =
        await db.query(
          `
          SELECT
            r.*,
            p.name AS parking_name,
            p.location AS parking_location
          FROM reservations r
          JOIN parking_centers p
            ON r.parking_id = p.id
          WHERE r.id = ?
          `,
          [result.insertId]
        );


      res.status(201).json({

        message:
          "Reservation confirmed",

        reservation:
          savedRows[0]

      });

    }

    catch (error) {

      if (connection) {
        await connection.rollback();
      }

      console.error(
        "CREATE RESERVATION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Could not create reservation"
      });

    }

    finally {

      if (connection) {
        connection.release();
      }

    }

  }
);


/* =========================================
   GET USER RESERVATIONS
========================================= */

app.get(
  "/api/reservations/my",
  authenticateToken,
  async (req, res) => {

    try {

      const [reservations] =
        await db.query(
          `
          SELECT
            r.*,
            p.name AS parking_name,
            p.location AS parking_location
          FROM reservations r
          JOIN parking_centers p
            ON r.parking_id = p.id
          WHERE r.user_id = ?
          ORDER BY r.id DESC
          `,
          [req.user.id]
        );


      res.json(reservations);

    }

    catch (error) {

      console.error(
        "GET USER RESERVATIONS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Could not load reservations"
      });

    }

  }
);


/* =========================================
   GET PARTNER RESERVATIONS
========================================= */

app.get(
  "/api/partner/reservations",
  authenticateToken,
  async (req, res) => {

    try {

      if (req.user.role !== "partner") {

        return res.status(403).json({
          message:
            "Only partners can access reservations"
        });

      }


      const [reservations] =
        await db.query(
          `
          SELECT
            r.*,
            p.name AS parking_name,
            p.location AS parking_location,
            u.name AS user_name,
            u.email AS user_email
          FROM reservations r
          JOIN parking_centers p
            ON r.parking_id = p.id
          JOIN users u
            ON r.user_id = u.id
          WHERE p.partner_id = ?
          ORDER BY r.id DESC
          `,
          [req.user.id]
        );


      res.json(reservations);

    }

    catch (error) {

      console.error(
        "GET PARTNER RESERVATIONS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Could not load partner reservations"
      });

    }

  }
);


/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {

  console.log(
    `ParkSmart backend running at http://localhost:${PORT}`
  );

});