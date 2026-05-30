import { toast } from "./ui.js";

export async function api(url, { method = "GET", body } = {}) {
    try {
        const r = await fetch(url, {
            method,
            headers: body ? { "Content-Type": "application/json" } : {},
            body: body ? JSON.stringify(body) : undefined,
        });
        return r.json();
    } catch (e) {
        toast("Network error: " + e.message, "fail");
        return null;
    }
}
