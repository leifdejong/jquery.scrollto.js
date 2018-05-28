const ScrollTo = ($ => {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  const NAME = 'scrollTo';
  const VERSION = '1.0.0';
  const DATA_KEY = 'jquery.scrollTo.js';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const Selector = {
    DATA_TOGGLE: '[data-toggle="scrollTo"]',
  };

  const Default = {
    animate: true,
    window: 'html, body',
    speed: 1000,
    easing: 'swing',
    offset: 0,
    offsetParent: false,
  };

  const Event = { 
    CLICK: `click${EVENT_KEY}`,
    SCROLL: `scroll${EVENT_KEY}`,
    SCROLLED: `scrolled${EVENT_KEY}`,
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */
  class ScrollTo {
    constructor(element, config) {
      this._element = element;
      this._children = [];
      this._config = $.extend({}, Default, config);
      this._addEventListeners();
    }

    // Getters
    static get VERSION() {
      return VERSION;
    }

    static get Default() {
      return Default;
    }

    _addEventListeners() {
      const $element = $(this._element);
      const $children = $.makeArray(
        $element.find('a'),
        $element.find('button')
      );

      if ($children.length) {
        for (let i = $children.length; i--; ) {
          this._children.push($children[i]); // cache
          $($children[i]).on(Event.CLICK, event => {
            this._onClick(event);
          });
        }
      } else {
        $(this._element).on(Event.CLICK, event => {
          this._onClick(event);
        });
      }
    }

    _onClick(event) {
      if (event.target.tagName === 'A') event.preventDefault();
      const target = this._getTarget(event.target);
      if (target) this.scrollTo(target, this._config);
    }

    scrollTo(target, config) {
      if (target) {
        const scrollEvent = $.Event(Event.SCROLL, { target });
        const scrolledEvent = $.Event(Event.SCROLLED, { target });
        const $scrollWindow = $(config.window);
        const $triggerElement = this._element ? $(this._element) : document;

        const offset =
          (config.offsetParent
            ? target.offsetParent.offsetTop
            : $(target).offset().top) - config.offset;

        $triggerElement.trigger(scrollEvent);

        if (config.animate) {
          $scrollWindow
            .stop()
            .animate(
              {
                scrollTop: offset,
              },
              config.speed,
              config.easing
            )
            .promise()
            .then(() => {
              $triggerElement.trigger(scrolledEvent);
            });
        } else {
          $scrollWindow.scrollTop(offset);
          $triggerElement.trigger(scrolledEvent);
        }
      }

      return this;
    }

    dispose() {
      $.removeData(this._element, DATA_KEY);

      $(this._element).off(EVENT_KEY);
      for (let i = this._children.length; i--; ) {
        $(this._children[i]).off(EVENT_KEY);
      }

      this._element = null;
      this._children = null;
      this._config = null;
    }

    _getTarget(element) {
      let selector = element.getAttribute('data-target');

      if (!selector || selector === '#') {
        selector = element.getAttribute('href') || '';
      }

      try {
        const $selector = $(document).find(
          `${selector}, [name="${selector.replace('#', '')}"]`
        );
        return $selector.length > 0 ? $selector[0] : null;
      } catch (err) {
        return null;
      }
    }

    // Static
    static _jQueryInterface(config, options) {
      return this.each(function() {
        let data = $(this).data(DATA_KEY);
        const _config = typeof config === 'object' && config;

        if (!data) {
          data = new ScrollTo(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config](options);
        }
      });
    }
  }

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */
  $(window).on(Event.LOAD_DATA_API, () => {
    const $triggers = $(Selector.DATA_TOGGLE);

    for (let i = $triggers.length; i--; ) {
      const $trigger = $($triggers[i]);
      ScrollTo._jQueryInterface.call($trigger, $trigger.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  $.fn[NAME] = ScrollTo._jQueryInterface;
  $.fn[NAME].Constructor = ScrollTo;
  $.fn[NAME].noConflict = function() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return ScrollTo._jQueryInterface;
  };

  return ScrollTo;
})($);

export default ScrollTo;
