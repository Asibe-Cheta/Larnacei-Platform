import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: "Test inquiry endpoint working",
      receivedData: body
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Test inquiry failed",
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Test inquiry GET endpoint working"
  });
} 