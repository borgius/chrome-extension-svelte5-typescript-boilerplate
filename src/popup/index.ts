import { mount } from 'svelte';
import Popup from "../components/Popup.svelte";

// Action popup
// https://developer.chrome.com/docs/extensions/reference/action/

function render() {
  const target = document.getElementById("app");

  if (target) {
    mount(Popup, {
      target,
    });
  }
}

document.addEventListener("DOMContentLoaded", render);
