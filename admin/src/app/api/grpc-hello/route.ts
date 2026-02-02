import { NextResponse } from 'next/server';
import { sayHello } from 'src/features/matchingEngine/matchingEngineGrpcClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'Next.js';

  try {
    const message = await sayHello(name);
    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('gRPC error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}
