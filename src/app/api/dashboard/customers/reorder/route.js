import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  let reorderedUsers;
  
  try {
    const body = await req.json();
    reorderedUsers = Array.isArray(body) ? body : body.reorderedUsers;
    
    if (!Array.isArray(reorderedUsers)) {
      return NextResponse.json(
        { success: false, message: 'Expected an array of users' },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON format' },
      { status: 400 }
    );
  }

  // Validate each user object
  if (reorderedUsers.some(u => typeof u.id !== 'number' || typeof u.order !== 'number')) {
    return NextResponse.json(
      { success: false, message: 'Each user must have numeric id and order' },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Method 1: Using CASE statement (better for small-medium datasets)
    const caseStatements = reorderedUsers
      .map(u => `WHEN id = ${u.id} THEN ${u.order}`)
      .join(' ');
    
    const updateQuery = `
      UPDATE users
      SET sort_order = CASE ${caseStatements}
        ELSE sort_order
      END
      WHERE id IN (${reorderedUsers.map(u => u.id).join(',')})
      RETURNING id, sort_order
    `;

    const result = await client.query(updateQuery);

    // Verify all records were updated
    if (result.rowCount !== reorderedUsers.length) {
      throw new Error(`Only updated ${result.rowCount} of ${reorderedUsers.length} records`);
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.rowCount} records`,
      updatedRecords: result.rows
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Reorder error:', err);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update order',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}