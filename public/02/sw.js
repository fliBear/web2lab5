import {
    get,
    del,
    entries,
} from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

const cacheName = "static_cache3";

const static_cache = [
    "/",
    "/offline.html",
    "/about.html",
    "./assets/site.css",
    "/manifest.json",
    "/404.html",
    "/score.html",
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
    console.log("Sync attempt");

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

async function handleSnaps() {
    entries().then((entries) => {
        entries.forEach((entry) => {
            if (entry[0] === "games") return;

            let snap = entry[1]; //  Each entry is an array of [key, value].
            let formData = new FormData();
            formData.append("id", snap.id);
            formData.append("ts", snap.ts);
            formData.append("title", snap.title);
            formData.append("image", snap.image, snap.id + ".png");
            fetch("/saveSnap", {
                method: "POST",
                body: formData,
            })
                .then(function (res) {
                    if (res.ok) {
                        res.json().then(function (data) {
                            console.log("Deleting from idb:", snap.id);
                            del(snap.id);
                        });
                    } else {
                        console.log(res);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    });
}

self.addEventListener("sync", function (event) {
    console.log("Choosing sync");
    if (event.tag == "data-sync") {
        event.waitUntil(handleSync());
    }

    if (event.tag == "sync-snaps") {
        event.waitUntil(handleSnaps());
    }
});
