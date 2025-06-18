import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstname,
      lastname,
      company,
      address,
      city,
      state,
      country,
      zip,
      phone,
      about,
    } = body;

    const trimmedEmail = email.trim().toLowerCase();

    // existingUser if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [trimmedEmail]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        company VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        zip VARCHAR(20),
        phone VARCHAR(20),
        about TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users
        (email, password, first_name, last_name, company, address, city, state, country, zip, phone, about)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        trimmedEmail,
        hashedPassword,
        firstname,
        lastname,
        company,
        address,
        city,
        state,
        country,
        zip,
        phone,
        about,
      ]
    );

    const user = result.rows[0];
    console.log("Registered user:", user);

    if (!user) {
      return NextResponse.json(
        { error: "User could not be created" },
        { status: 500 }
      );
    }
    // create a jwt token
    const token = createToken({ id: user.id, email: user.email });

    const response = NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      secure: false,
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
