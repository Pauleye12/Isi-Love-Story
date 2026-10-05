import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home2.tsx"),
  route("home2", "routes/home.tsx"),
  route("admin", "routes/admin.tsx"),
  route("rsvp", "routes/RSVP.tsx"),
] satisfies RouteConfig;
