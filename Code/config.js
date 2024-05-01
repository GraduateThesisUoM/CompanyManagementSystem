module.exports = {
  folders: {
    css: "./public/css",
    img: "./public/imgs"
  },
  routes: {
    routes: "./routes/",
    accountant_routers_path: () => `./${this.routes}/AccountantRoutes/`
  },
  logging: {
    level: "info"
  }
};
