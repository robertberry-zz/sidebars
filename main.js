
var STATIC = 0;
var TOP_ANCHOR = 1;
var BOTTOM_ANCHOR = 2;

var SIDEBAR_TOP_OFFSET = 8;
var BOTTOM_OFFSET = 45;

var $window = $(window);
var $document = $(document);

function AnchoredSidebar($element) {
  this.$element = $element;

  // actually if there's enough room in viewport for entire sidebar it should be top anchored
  this.state = STATIC;
  this.staticPosition = 0;
}

AnchoredSidebar.prototype.updateDOM = function() {
  var top = 0;

  if (this.state === TOP_ANCHOR) {
    top = SIDEBAR_TOP_OFFSET;
  } else if (this.state === BOTTOM_ANCHOR) {
    top = $window.height() - this.$element.height() - BOTTOM_OFFSET;
  } else if (this.state === STATIC && this.staticPosition) {
    top = this.staticPosition;
  }

  this.$element.css({
    position: this.state === STATIC ? 'absolute' : 'fixed',
    transform: 'translateY(' + top + 'px)'
  });
};

AnchoredSidebar.prototype.updateSidebar = function() {
  var scrollTop = Math.max(0, this.scrollTop);
  var scrollVelocity = scrollTop - this.lastScrollTop;

  if (scrollVelocity < 0) {
    scrollVelocity = Math.min(scrollVelocity, -10);
  } else if (scrollVelocity > 0) {
    scrollVelocity = Math.max(scrollVelocity, 10);
  }

  if (scrollTop === this.lastScrollTop) {
    return;
  }

  if (this.state === STATIC) {
    var top = this.staticPosition;

    // offsets
    if (scrollTop + scrollVelocity <= top - SIDEBAR_TOP_OFFSET) {
      this.state = TOP_ANCHOR;
    } else if (scrollTop + $window.height() + scrollVelocity >= top + this.$element.outerHeight() + BOTTOM_OFFSET) {
      this.state = BOTTOM_ANCHOR;
    }
  } else if (this.state === TOP_ANCHOR) {
    if (scrollTop > this.lastScrollTop) {
      this.staticPosition = scrollTop + SIDEBAR_TOP_OFFSET; //- SIDEBAR_TOP_OFFSET;
      this.state = STATIC;
    }
  } else if (this.state == BOTTOM_ANCHOR) {
    if (scrollTop < this.lastScrollTop) {
      this.staticPosition = scrollTop + $window.height() - this.$element.outerHeight() - BOTTOM_OFFSET;
      this.state = STATIC;
    }
  }

  this.updateDOM();

  this.lastScrollTop = scrollTop;
};

AnchoredSidebar.prototype.onRequestAnimationFrame = function() {
  this.updateSidebar();
  this.enqueueRaf();
};

AnchoredSidebar.prototype.enqueueRaf = function() {
  this.rafRef = requestAnimationFrame(this.boundOnRequestAnimationFrame);
};

AnchoredSidebar.prototype.recordScrollTop = function() {
  this.scrollTop = $document.scrollTop();
};

AnchoredSidebar.prototype.attach = function() {
  this.recordScrollTop();
  this.lastScrollTop = this.scrollTop;
  $document.on('scroll', this.recordScrollTop.bind(this));
  this.boundOnRequestAnimationFrame = this.onRequestAnimationFrame.bind(this);
  this.enqueueRaf();
};

new AnchoredSidebar($('.js-anchoredSidebar')).attach();
