import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// POST: Add Customer
export async function POST(req) {
  try {
    const data = await req.json();

    const {
      firstname,
      lastname,
      company,
      address,
      city,
      state,
      zip,
      country,
      phone,
      mobile,
      email,
      password,
      sfirstname,
      slastname,
      scompany,
      saddress,
      scity,
      sstate,
      szip,
      scountry,
      sphone,
      smobile,
      sendinvoice,
      conformance,
      terms,
      freight,
      note,
    } = data;

    // Hash password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer (
        id SERIAL PRIMARY KEY,
        billing_firstname TEXT,
        billing_lastname TEXT,
        billing_company TEXT,
        billing_address TEXT,
        billing_city TEXT,
        billing_state TEXT,
        billing_zip TEXT,
        billing_country TEXT,
        billing_phone TEXT,
        billing_mobile TEXT,
        billing_email TEXT,
        password TEXT,
        shipping_firstname TEXT,
        shipping_lastname TEXT,
        shipping_company TEXT,
        shipping_address TEXT,
        shipping_city TEXT,
        shipping_state TEXT,
        shipping_zip TEXT,
        shipping_country TEXT,
        shipping_phone TEXT,
        shipping_mobile TEXT,
        sendinvoice TEXT,
        conformance TEXT,
        terms TEXT,
        freight TEXT,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert Query
    const insertQuery = `
      INSERT INTO customer (
        billing_firstname, billing_lastname, billing_company, billing_address, billing_city,
        billing_state, billing_zip, billing_country, billing_phone, billing_mobile,
        billing_email, password,
        shipping_firstname, shipping_lastname, shipping_company, shipping_address, shipping_city,
        shipping_state, shipping_zip, shipping_country, shipping_phone, shipping_mobile,
        sendinvoice, conformance, terms, freight, note
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27
      ) RETURNING id
    `;

    // values
    const values = [
      firstname,
      lastname,
      company,
      address,
      city,
      state,
      zip,
      country,
      phone || null,
      mobile || null,
      email,
      hashedPassword,
      sfirstname || null,
      slastname || null,
      scompany || null,
      saddress || null,
      scity || null,
      sstate || null,
      szip || null,
      scountry || null,
      sphone || null,
      smobile || null,
      sendinvoice || null,
      conformance || null,
      terms || null,
      freight || null,
      note || null,
    ];

    const result = await pool.query(insertQuery, values);

    return NextResponse.json(
      { message: "Customer added", customerId: result.rows[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in add customer:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // Parse and validate pagination parameters
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "5")));
  const offset = (page - 1) * limit;

  // Search term - trim and escape special characters
  const search = (searchParams.get("search") || "").trim();
  const searchTerm = `%${search.replace(/[\\%_]/g, '\\$&')}%`;

  // Sorting parameters with validation
  const validSorts = ["id", "first_name", "last_name", "email", "company", "created_at", "sort_order"];
  const sortBy = validSorts.includes(searchParams.get("sortBy")) 
    ? searchParams.get("sortBy") 
    : "sort_order";
  const orderDirection = searchParams.get("sortOrder") === "desc" ? "DESC" : "ASC";

  try {
    // Base query for both data and count
    const baseQuery = `
      FROM customers
      WHERE 
        ($1 = '' OR 
         first_name ILIKE $1 OR 
         last_name ILIKE $1 OR 
         email ILIKE $1 OR 
         company ILIKE $1)
    `;

    // Get paginated results
    const dataQuery = `
      SELECT *, sort_order 
      ${baseQuery}
      ORDER BY ${sortBy} ${orderDirection}
      LIMIT $2 OFFSET $3
    `;

    // Get total count
    const countQuery = `SELECT COUNT(*) ${baseQuery}`;

    // Execute both queries in parallel
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [searchTerm, limit, offset]),
      pool.query(countQuery, [searchTerm])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);

    return Response.json({
      users: dataResult.rows,
      totalCount,
      page,
      limit,
      hasMore: (page * limit) < totalCount
    });
  } catch (err) {
    console.error("DB error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Pagination & Search
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);

//   const page = parseInt(searchParams.get("page") || "1");
//   const limit = parseInt(searchParams.get("limit") || "5");
//   const offset = (page - 1) * limit;

//   const search = searchParams.get("search") || "";
//   const sortBy = searchParams.get("sortBy") || 'sort_order';
//   const sortOrder = searchParams.get("sortOrder") || "asc";

//   // Validate allowed sort columns
//   const validSorts = [
//     "id",
//     "first_name",
//     "last_name",
//     "email",
//     "company",
//     "created_at",
//     "sort_order"
//   ];
//   const orderBy = validSorts.includes(sortBy) ? sortBy : "sort_order"; 
//   const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";

//   try {
//     const queryText = `
//       SELECT *,sort_order FROM users
//       WHERE 
//         first_name ILIKE $1 OR 
//         last_name ILIKE $1 OR 
//         email ILIKE $1 OR 
//         company ILIKE $1
//       ORDER BY ${orderBy} ${orderDirection}
//       LIMIT $2 OFFSET $3
//     `;
//     const values = [`%${search}%`, limit, offset];
//     const result = await pool.query(queryText, values);

//     const countResult = await pool.query(
//       `
//       SELECT COUNT(*) FROM users
//       WHERE 
//         first_name ILIKE $1 OR 
//         last_name ILIKE $1 OR 
//         email ILIKE $1 OR 
//         company ILIKE $1
//     `,
//       [`%${search}%`]
//     );

//     const totalCount = parseInt(countResult.rows[0].count);

//     return Response.json({
//       users: result.rows,
//       totalCount,
//     });
//   } catch (err) {
//     console.error("DB error:", err);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 5;
//     const search = searchParams.get("search") || "";

//     const rawSortBy = searchParams.get("sortBy");
//     const rawSortOrder = searchParams.get("sortOrder");

//     const offset = (page - 1) * limit;

//     let queryParams = [];
//     let searchClause = "";

//     if (search) {
//       searchClause = `
//         WHERE first_name ILIKE $1
//         OR last_name ILIKE $1
//         OR email ILIKE $1
//         OR company ILIKE $1
//       `;
//       queryParams.push(`%${search}%`);
//     }

//     // Sorting
//     const allowedSortFields = ['first_name', 'last_name', 'email', 'company', 'created_at'];
//     const sortFields = rawSortBy
//       ? rawSortBy.split(',').map(f => allowedSortFields.includes(f) ? f : 'created_at')
//       : ['created_at'];

//     const sortOrders = rawSortOrder
//       ? rawSortOrder.split(',').map(o => o.toLowerCase() === 'asc' ? 'ASC' : 'DESC')
//       : ['DESC'];

//     const sortClauses = sortFields.map((field, idx) => `${field} ${sortOrders[idx] || 'DESC'}`);
//     const orderByClause = `ORDER BY ${sortClauses.join(', ')}`;

//     // Count
//     const countQuery = `SELECT COUNT(*) FROM users ${searchClause}`;
//     const countResult = await pool.query(countQuery, queryParams);
//     const totalCount = parseInt(countResult.rows[0].count);

//     // Data
//     const userQuery = `
//       SELECT * FROM users
//       ${searchClause}
//       ${orderByClause}
//       LIMIT $${queryParams.length + 1}
//       OFFSET $${queryParams.length + 2}
//     `;

//     queryParams.push(limit, offset);

//     const result = await pool.query(userQuery, queryParams);

//     return NextResponse.json({
//       users: result.rows,
//       totalCount,
//       page,
//       limit,
//     });
//   } catch (error) {
//     console.error("DB Error:", error);
//     return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
//   }
// }

// GEt : Fetch All Data
// export async function GET() {
//   try {
//     const result = await pool.query(`SELECT * FROM users ORDER BY created_at `);
//     // console.log(result)
//     return NextResponse.json(result.rows, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
//   }
// }
