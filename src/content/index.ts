import './styles.css';

import { mount, unmount } from 'svelte';

import Overlay from '@components/Overlay.svelte';

import { store } from '../store';

const content = () => {
  let app: Record<string, any>;
  store.subscribe((s) => {
    if (s.isReady && s.feature.content) {
      app = mount(Overlay, { target: document.body });
    } else {
      unmount(app);
    }
  })
}

content();
