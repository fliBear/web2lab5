import { get, del } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

const cacheName = "static_cache1";

const static_cache = [
    "/offline.html",
    "/about.html",
    "./assets/site.css",
    "/manifest.json",
    "/404.html",
    "/score.html",
    "/scorelist.html",
    "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache
                .addAll(
                    static_cache.map((url) => {
                        return new Request(url, { mode: "cors" });
                    })
                )
                .then(() => {})
                .catch((e) => {
                    console.log(e);
                });
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((response) => {
                    if (response.status === 404) {
                        return caches.match("404.html");
                    }
                    return response;
                });
            })
            .catch((error) => {
                console.log(error);
                return caches.match("offline.html");
            })
    );
});

async function sendData(data) {
    console.log(data);
    const options = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    };

    await fetch("/save", options);
}

async function handleSync() {
    let data = await get("games");

    if (!data) return;

    data = JSON.parse(data);
    console.log(data);
    for (let i = 0; i < data.games.length; i++) {
        console.log("sending: " + data.games[i]);
        await sendData(data.games[i]);
    }
    del("games");
}

self.addEventListener("sync", function (event) {
    if (event.tag == "data-sync") {
        event.waitUntil(handleSync());
    }
});
