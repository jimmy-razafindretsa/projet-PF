"use client";
import { redirect } from "next/navigation";

export default function Page() {
    const userRole = "supplier";
     redirect('/supplier_dashboard/production');
}
