import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            // Tambahkan dashboard.css dan dashboard.js ke dalam array input
            input: [
                "resources/css/app.css",
                "resources/js/app.js",
                "resources/css/dashboard.css", // File baru
                "resources/js/dashboard.js", // File baru
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ["**/storage/framework/views/**"],
        },
    },
});
