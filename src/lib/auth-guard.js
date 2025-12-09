import { verifyJWT } from "@/lib/jwt";

export function getUserFromRequest(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;
    return verifyJWT(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function requireRole(request, role) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== role) {
    return { ok: false, user: null };
  }
  return { ok: true, user };
}
