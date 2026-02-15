import { NextResponse } from "next/server";

// Cache data for 5 minutes (KP index updates every minute, but we don't need real-time)
export const revalidate = 300;

// In-memory fetch history (last 5 fetches)
let fetchHistory: Array<{ timestamp: number; date: string }> = [];

export async function GET() {
    try {
        const res = await fetch(
            "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json",
            { next: { revalidate: 300 } }
        );

        const data = await res.json();

        if (!data || data.length === 0) {
            return NextResponse.json({ error: "No data" }, { status: 500 });
        }

        // Get latest record
        const latest = data[data.length - 1];

        const kp = parseFloat(latest.kp_index);

        // Convert KP → Visibility score
        const visibilityScore = Math.min(kp * 15, 100);

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
            event_name: "Aurora Activity",
            event_type: "aurora",
            kp_index: kp,
            visibility_score: visibilityScore,
            observation_time: latest.time_tag,
            description: "Aurora activity based on real-time solar storm intensity.",
            best_view_direction: "North",
            source: "NOAA SWPC",
            metadata: {
                apiSource: "NOAA SWPC - Planetary K-index",
                apiEndpoint: "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json",
                lastFetched: new Date().toISOString(),
                fetchedAt: Date.now(),
                fetchHistory: fetchHistory,
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch aurora data" },
            { status: 500 }
        );
    }
}
