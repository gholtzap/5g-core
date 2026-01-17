import { NextResponse } from 'next/server';

const SMF_URL = process.env.SMF_URL || 'http://smf:8080';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { smContextRef } = body;

    if (!smContextRef) {
      return NextResponse.json(
        { success: false, message: 'smContextRef is required' },
        { status: 400 }
      );
    }

    const smfReleaseUrl = `${SMF_URL}/nsmf-pdusession/v1/sm-contexts/${smContextRef}/release`;

    const releasePayload = {
      cause: 'NW_INITIATED',
    };

    const response = await fetch(smfReleaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(releasePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SMF release failed:', errorText);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to terminate session: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session terminated successfully',
    });
  } catch (error) {
    console.error('Error terminating session:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to terminate session',
      },
      { status: 500 }
    );
  }
}
