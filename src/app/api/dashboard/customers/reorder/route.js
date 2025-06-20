
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const { id, newOrder } = await req.json();
    
    // Simple validation
    if (!id || newOrder === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing id or newOrder' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    await client.query(
      'UPDATE customers SET sort_order = $1 WHERE id = $2',
      [newOrder, id]
    );
    client.release();

    return NextResponse.json(
      { success: true, message: 'Order updated' }
    );

  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}