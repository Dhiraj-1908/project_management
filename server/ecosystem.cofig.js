const { Script } = require("vm");

module.exports = {
    app: [
        {
            name: "project_management",
            Script: "npm",
            args: "run dev",
            env: {
                NODE_ENV: "devlopment",
            },
        },
    ],
};