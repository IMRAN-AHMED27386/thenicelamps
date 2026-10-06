import { NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || "imran27386@gmail.com";
    
    console.log("Testing review query for userId:", userId);
    
    const snap = await getDocs(
      query(
        collection(db, "orders"),
        where("userId", "==", userId),
        where("status", "==", "delivered")
      )
    );

    return NextResponse.json({ success: true, count: snap.size });
  } catch (error: any) {
    console.error("Firebase Query Error:", error);
    return NextResponse.json({ success: false, error: error.message, code: error.code });
  }
}
