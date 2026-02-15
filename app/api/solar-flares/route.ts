import { NextResponse } from "next/server";

// Cache for 10 minutes (solar flares don't change that frequently)
export const revalidate = 600;

// In-memory fetch history (last 5 fetches)
let fetchHistory: Array<{ timestamp: number; date: string }> = [];

export async function GET() {
    try {
        const res = await fetch(
            "https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json",
            { next: { revalidate: 600 } }
        );

        const data = await res.json();

        // Add to fetch history (keep last 5)
        const now = Date.now();
        fetchHistory.unshift({
            timestamp: now,
            date: new Date().toISOString(),
        });
        if (fetchHistory.length > 5) {
            fetchHistory = fetchHistory.slice(0, 5);
        }

        return NextResponse.json({
            flares: data,
            metadata: {
                apiSource: "NOAA GOES - X-ray Flares",
                apiEndpoint: "https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json",
                lastFetched: new Date().toISOString(),
                fetchedAt: Date.now(),
                fetchHistory: fetchHistory,
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch solar flare data" },
            { status: 500 }
        );
    }
}
