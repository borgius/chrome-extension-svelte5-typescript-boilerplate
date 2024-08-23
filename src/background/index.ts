import { onMessage } from "webext-bridge/background";

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

onMessage("get-cookie", async ({ data }) => {
  const { domain } = data;
  const cookies = await getCookies(domain);
  return cookies;
});

onMessage("close-tab", async (msg) => {
  chrome.tabs.remove(msg.sender.tabId);
})

const getCookies = async (domain: string) => {
  const cookies = await chrome.cookies.getAll({ domain });
  const keys = ['_device_id', 'saved_user_sessions', 'user_session', 'user_session_same_site', 'logged_in', 'dotcom_user', '_gh_sess']
  const ghCookies = cookies.filter((c) => keys.includes(c.name)).map((c) => `${c.name}=${c.value}`).join('; ');
  return ghCookies;
}

// NOTE: If you want to toggle the side panel from the extension's action button,
// you can use the following code:
// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
//    .catch((error) => console.error(error));
