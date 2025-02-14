export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      headers: "*",
      origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    },
  },
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
