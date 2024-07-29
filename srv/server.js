"use strict";

const cds = require("@sap/cds");

cds.on("bootstrap", app => {
    // Middleware to set cache control headers
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '-1');
        res.set({
            "Set-Cookie": "HttpOnly; Secure; SameSite=Strict"
        });
        next(); // Pass control to the next middleware
    });
});


module.exports = cds.server;