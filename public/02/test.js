import { get, set } from "idb-keyval";

set("test", "test value");

export function testfu() {
    console.log(get("test"));
}
