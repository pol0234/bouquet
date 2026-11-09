// js/gift.js
// Dedication card ("Venovať kyticu") and URL share management

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GiftModule = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function initGift(options) {
    var giftWrap = options.giftWrap;
    var giftTo = options.giftTo;
    var giftMsg = options.giftMsg;
    var giftFrom = options.giftFrom;
    var shareModal = options.shareModal;
    var inputTo = options.inputTo;
    var inputMsg = options.inputMsg;
    var inputFrom = options.inputFrom;
    var toast = options.toast;

    function getParams() {
      try {
        var params = new URLSearchParams(window.location.search);
        return {
          to: params.get('to') || '',
          msg: params.get('msg') || '',
          from: params.get('from') || ''
        };
      } catch (e) {
        return { to: '', msg: '', from: '' };
      }
    }

    function applyDedication(data) {
      var toText = data.to ? ('Pre ' + data.to) : 'Pre Teba';
      var msgText = data.msg || 'Slnko a kvety, ktoré nikdy nezvädnú, pretože sú napísané v kóde.';
      var fromText = data.from ? ('S láskou, ' + data.from) : 'S láskou';

      if (giftTo) giftTo.textContent = toText;
      if (giftMsg) giftMsg.textContent = msgText;
      if (giftFrom) giftFrom.textContent = fromText;

      if (inputTo) inputTo.value = data.to;
      if (inputMsg) inputMsg.value = data.msg;
      if (inputFrom) inputFrom.value = data.from;
    }

    function showCard() {
      if (giftWrap) giftWrap.classList.add('visible');
    }

    function showToast(text) {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add('show');
      setTimeout(function () {
        toast.classList.remove('show');
      }, 2400);
    }

    function copyShareLink() {
      var url = new URL(window.location.href);
      var toVal = inputTo ? inputTo.value.trim() : '';
      var msgVal = inputMsg ? inputMsg.value.trim() : '';
      var fromVal = inputFrom ? inputFrom.value.trim() : '';

      if (toVal) url.searchParams.set('to', toVal); else url.searchParams.delete('to');
      if (msgVal) url.searchParams.set('msg', msgVal); else url.searchParams.delete('msg');
      if (fromVal) url.searchParams.set('from', fromVal); else url.searchParams.delete('from');

      applyDedication({ to: toVal, msg: msgVal, from: fromVal });
      showCard();

      var finalUrl = url.toString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(finalUrl).then(function () {
          showToast('Odkaz skopírovaný do schránky');
          if (shareModal) shareModal.classList.remove('open');
        }).catch(function () {
          fallbackPrompt(finalUrl);
        });
      } else {
        fallbackPrompt(finalUrl);
      }
    }

    function fallbackPrompt(finalUrl) {
      window.prompt('Skopírujte si odkaz na kyticu:', finalUrl);
      if (shareModal) shareModal.classList.remove('open');
    }

    // Inicializácia pri načítaní
    var initial = getParams();
    applyDedication(initial);
    if (initial.to || initial.msg || initial.from) {
      showCard();
    }

    return {
      getParams: getParams,
      applyDedication: applyDedication,
      showCard: showCard,
      copyShareLink: copyShareLink,
      showToast: showToast
    };
  }

  return {
    initGift: initGift
  };
}));

