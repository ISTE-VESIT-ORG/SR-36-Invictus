import { NextResponse } from "next/server";

// Cache for 30 minutes (3-day forecast updates less frequently)
export const revalidate = 1800;

// In-memory fetch history (last 5 fetches)
let fetchHistory: Array<{ timestamp: number; date: string }> = [];

export async function GET() {
    try {
        const res = await fetch(
            "https://services.swpc.noaa.gov/json/3-day-forecast.json",
            { next: { revalidate: 1800 } }
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
            forecast: data,
            metadata: {
                apiSource: "NOAA SWPC - 3-Day Forecast",
                apiEndpoint: "https://services.swpc.noaa.gov/json/3-day-forecast.json",
                lastFetched: new Date().toISOString(),
                fetchedAt: Date.now(),
                fetchHistory: fetchHistory,
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch forecast" },
            { status: 500 }
        );
    }
}
