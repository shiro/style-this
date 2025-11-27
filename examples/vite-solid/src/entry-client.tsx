// @refresh reload
// import "solid-devtools";
import { mount, StartClient } from "@solidjs/start/client";

console.log("app started");

mount(() => <StartClient />, document.getElementById("app")!);
