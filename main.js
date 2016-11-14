
var STATIC = 0;
var TOP_ANCHOR = 1;
var BOTTOM_ANCHOR = 2;

var SIDEBAR_TOP_OFFSET = 8;
var BOTTOM_OFFSET = 45;

var $window = $(window);
var $document = $(document);

function AnchoredSidebar($element, centerOffset) {
  this.$element = $element;

  // actually if there's enough room in viewport for entire sidebar it should be top anchored
  this.state = STATIC;
  this.staticPosition = 0;
  this.centerOffset = centerOffset;
}

AnchoredSidebar.prototype.updateDOM = function() {
  var isStatic = this.state === STATIC;

  var top = '';

  if (this.state === TOP_ANCHOR) {
    top = SIDEBAR_TOP_OFFSET;
  } else if (this.state === STATIC && this.staticPosition) {
    top = this.staticPosition;
  }

  var transform = '';

  if (this.state !== STATIC) {
    transform = 'translateZ(0)';
  }

  this.$element.css({
    position: isStatic ? 'absolute' : 'fixed',
    bottom: this.state === BOTTOM_ANCHOR ? BOTTOM_OFFSET : '',
    top: top,
    left: isStatic ? '' : '50%',
    marginLeft: isStatic ? '' : this.centerOffset,
    transform: transform
  });
};

AnchoredSidebar.prototype.onScroll = function() {
  var scrollTop = Math.max(0, $document.scrollTop());

  if (scrollTop === this.lastScrollTop) {
    this.enqueueRaf();
    return;
  }

  if (this.state === STATIC) {
    var top = this.staticPosition;

    // offsets
    if (scrollTop < top) {
      this.state = TOP_ANCHOR;
      this.updateDOM();
    } else if (scrollTop + $window.height() > top + this.$element.outerHeight() + SIDEBAR_TOP_OFFSET + BOTTOM_OFFSET) {
      this.state = BOTTOM_ANCHOR;
      this.updateDOM();
    }
  } else if (this.state === TOP_ANCHOR) {
    if (scrollTop > this.lastScrollTop) {
      this.staticPosition = scrollTop; //- SIDEBAR_TOP_OFFSET;
      this.state = STATIC;
      this.updateDOM();
    }
  } else if (this.state == BOTTOM_ANCHOR) {
    if (scrollTop < this.lastScrollTop) {
      this.staticPosition = scrollTop + $window.height() - this.$element.height() - SIDEBAR_TOP_OFFSET - BOTTOM_OFFSET;
      this.state = STATIC;
      this.updateDOM();
    }
  }

  this.lastScrollTop = scrollTop;
  this.enqueueRaf();
};

AnchoredSidebar.prototype.enqueueRaf = function() {
  this.rafRef = requestAnimationFrame(this.boundOnScroll);
};

AnchoredSidebar.prototype.attach = function() {
  this.lastScrollTop = $document.scrollTop();
  this.boundOnScroll = this.onScroll.bind(this);
  this.enqueueRaf();
};

AnchoredSidebar.prototype.unattach = function() {
  cancelAnimationFrame(this.rafRef);
};

new AnchoredSidebar($('.js-anchoredSidebar'), -600).attach();
//new AnchoredSidebar($('.js-anchoredSidebarRight'), 283).attach();