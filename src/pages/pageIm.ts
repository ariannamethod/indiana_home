/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import blurActiveElement from '../helpers/dom/blurActiveElement';
import loadFonts from '../helpers/dom/loadFonts';
import I18n from '../lib/langPack';
import rootScope from '../lib/rootScope';
import Page from './page';
import {APP_TABS} from '../lib/appManagers/appImManager';

const onFirstMount = () => {
  rootScope.managers.appStateManager.pushToState('authState', {_: 'authStateSignedIn'});
  // ! TOO SLOW
  /* appStateManager.saveState(); */

  if(!I18n.requestedServerLanguage) {
    I18n.getCacheLangPack().then((langPack) => {
      if(langPack.local) {
        I18n.getLangPack(langPack.lang_code);
      }
    });
  }

  page.pageEl.style.display = '';

  blurActiveElement();

  return Promise.all([
    import('../lib/appManagers/appDialogsManager'),
    loadFonts()/* .then(() => new Promise((resolve) => window.requestAnimationFrame(resolve))) */,
    'requestVideoFrameCallback' in HTMLVideoElement.prototype ? Promise.resolve() : import('../helpers/dom/requestVideoFrameCallbackPolyfill')
  ]).then(async([appDialogsManager]) => {
    appDialogsManager.default.start();
    document.body.classList.remove('has-auth-pages');
    setTimeout(() => {
      document.getElementById('auth-pages').remove();
    }, 1e3);

    const {getGroupId} = await import('../stores/group');
    const groupId = getGroupId();
    if(groupId) {
      const im = rootScope.managers.appImManager;
      const originalSetPeer = im.setPeer.bind(im);
      im.setPeer = (options: any = {}, animate?: boolean) => {
        if(options.peerId && options.peerId !== groupId) {
          options.peerId = groupId;
        }
        return originalSetPeer(options, animate);
      };
      im.setPeer({peerId: groupId});
      im.selectTab(APP_TABS.CHAT);
      document.getElementById('column-left')?.remove();
      document.getElementById('column-right')?.remove();
    }
  });
};

const page = new Page('page-chats', false, onFirstMount);
export default page;
