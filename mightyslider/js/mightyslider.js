/**
 * jQuery mightySlider - Mighty Responsive Slider
 * http://mightyslider.com
 * 
 * @version:  2.0.2
 * @released: June 05, 2014
 * 
 * @author:   Hemn Chawroka
 *            http://iprodev.com/
 * 
 */
(function ($, window, undefined) {
	'use strict';

	var namespace = 'mightySlider',
		minnamespace  = 'mS',
		videoRegularExpressions = [
			{
				reg:    /youtu\.be\//i,
				split:  '/',
				index:  3,
				iframe: 1,
				url:    "https://www.youtube.com/embed/{id}?autoplay=1&fs=1&rel=0&enablejsapi=1&wmode=opaque"
			},
			{
				reg:    /youtube\.com\/watch/i,
				split:  '=',
				index:  1,
				iframe: 1,
				url:    "https://www.youtube.com/embed/{id}?autoplay=1&fs=1&rel=0&enablejsapi=1&wmode=opaque"
			},
			{
				reg:    /vimeo\.com\//i,
				split:  '/',
				index:  3,
				iframe: 1,
				url:    "https://player.vimeo.com/video/{id}?hd=1&autoplay=1&show_title=1&show_byline=1&show_portrait=0&color=&fullscreen=1&api=1"
			},
			{
				reg:   /metacafe\.com\/watch/i,
				split: '/',
				index: 4,
				url:   "http://www.metacafe.com/fplayer/{id}/.swf?playerVars=autoPlay=yes"
			},
			{
				reg:   /dailymotion\.com\/video/i,
				split: '/',
				index: 4,
				url:   "http://www.dailymotion.com/swf/video/{id}?additionalInfos=0&autoStart=1"
			},
			{
				reg:   /gametrailers\.com/i,
				split: '/',
				index: 5,
				url:   "http://www.gametrailers.com/remote_wrap.php?mid={id}"
			},
			{
				reg:   /collegehumor\.com\/video\//i,
				split: 'video/',
				index: 1,
				url:   "http://www.collegehumor.com/moogaloop/moogaloop.jukebox.swf?autostart=true&fullscreen=1&use_node_id=true&clip_id={id}"
			},
			{
				reg:   /collegehumor\.com\/video:/i,
				split: 'video:',
				index: 1,
				url:   "http://www.collegehumor.com/moogaloop/moogaloop.swf?autoplay=true&fullscreen=1&clip_id={id}"
			},
			{
				reg:   /ustream\.tv/i,
				split: '/',
				index: 4,
				url:   "http://www.ustream.tv/flash/video/{id}?loc=%2F&autoplay=true&vid={id}&disabledComment=true&beginPercent=0.5331&endPercent=0.6292&locale=en_US"
			},
			{
				reg:   /twitvid\.com/i,
				split: '/',
				index: 3,
				url:   "http://www.twitvid.com/player/{id}"
			},
			{
				reg:   /v\.wordpress\.com/i,
				split: '/',
				index: 3,
				url:   "http://s0.videopress.com/player.swf?guid={id}&v=1.01"
			},
			{
				reg:   /google\.com\/videoplay/i,
				split: '=',
				index: 1,
				url:   "http://video.google.com/googleplayer.swf?autoplay=1&hl=en&docId={id}"
			},
			{
				reg:   /vzaar\.com\/videos/i,
				split: '/',
				index: 4,
				url:   "http://view.vzaar.com/{id}.flashplayer?autoplay=true&border=none"
			}
		],
		JSONReader = 'http://mightyslider.com/getJSON.php?url={URL}',
		photoRegularExpressions = [
			{
				reg:     /vimeo\.com\//i,
				oembed:  'https://vimeo.com/api/oembed.json?url={URL}',
				inJSON:  'thumbnail_url'
			},
			{
				reg:     /youtube\.com\/watch/i,
				oembed:  'https://www.youtube.com/oembed?url={URL}&format=json',
				inJSON:  'thumbnail_url',
				replace: {
					from: 'hqdefault.jpg',
					to:   'maxresdefault.jpg'
				}
			},
			{
				reg:    /dailymotion\.com\/video/i,
				oembed: 'http://www.dailymotion.com/services/oembed?format=json&url={URL}',
				inJSON: 'url'
			},
			{
				reg:     /500px\.com\/photo\/([0-9]+)/i,
				oembed:  '{URL}/oembed.json',
				inJSON:  'thumbnail_url',
				replace: {
					from: '3.jpg',
					to:   '5.jpg'
				}
			},
			{
				reg:    /flickr\.com\/photos\/([^\/]+)\/([0-9]+)/i,
				oembed: 'https://www.flickr.com/services/oembed?url={URL}&format=json',
				inJSON: 'url'
			},
			{
				reg:    /instagram\.com\/p\//i,
				oembed: 'http://api.instagram.com/oembed?url={URL}',
				inJSON: 'url'
			},
			{
				reg:    /deviantart\.com\/p\//i,
				oembed: 'http://backend.deviantart.com/oembed?url={URL}',
				inJSON: 'url'
			}
		],
		videoTypes = {
			'avi' : 'video/msvideo',
			'mov' : 'video/quicktime',
			'mpg' : 'video/mpeg',
			'mpeg': 'video/mpeg',
			'mp4' : 'video/mp4',
			'webm': 'video/webm',
			'ogv' : 'video/ogg',
			'3gp' : 'video/3gpp',
			'm4v' : 'video/x-m4v'
		},
		extensions = {
			flash: 'swf',
			image: 'bmp gif jpeg jpg png tiff tif jfif jpe',
			video: 'avi mov mpg mpeg mp4 webm ogv 3gp m4v'
		},
		tmpArray = [],
		interactiveElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'],
		time,

		// HTML5 video tag default attributes
		videoDefaultAttributes = {
			width: '100%',
			height: '100%',
			preload: 'preload',
			autoplay: 'autoplay',
			controls: 'controls'
		},

		// iframe tag default attributes
		iframeDefaultAttributes = {
			width: '100%',
			height: '100%',
			frameborder: 0,
			webkitAllowFullScreen: true,
			mozallowfullscreen: true,
			allowFullScreen: true
		},

		// embed tag default attributes
		embedDefaultAttributes = {
			width: '100%',
			height: '100%',
			bgcolor: '#000000',
			quality: 'high',
			play: true,
			loop: true,
			menu: true,
			wmode: 'transparent',
			scale: 'showall',
			allowScriptAccess: 'always',
			allowFullScreen: true,
			fullscreen: 'yes'
		},

		captionResponsiveStyles = [
			// captions scale able styles
			'width',
			'height',
			'fontSize',
			'fontSize',
			'top',
			'left',
			'paddingTop',
			'paddingLeft',
			'paddingBottom',
			'paddingRight'
		],

		// Global DOM elements
		$win = $(window),
		$doc = $(document),

		// Events
		clickEvent = 'click.' + namespace + ' tap.' + namespace,
		mouseDownEvent = 'touchstart.' + namespace + ' mousedown.' + namespace,
		mouseScrollEvent = ($.fn.mousewheel) ? 'mousewheel.' + namespace : 'DOMMouseScroll.' + namespace + ' mousewheel.' + namespace,
		dragInitEvents = 'touchstart.' + namespace + ' mousedown.' + namespace,
		dragMouseEvents = 'mousemove.' + namespace + ' mouseup.' + namespace,
		dragTouchEvents = 'touchmove.' + namespace + ' touchend.' + namespace,
		hoverEvent = 'mouseenter.' + namespace + ' mouseleave.' + namespace,

		// Local WindowAnimationTiming interface
		requestAnimationFrame = window.requestAnimationFrame,
		cancelAnimationFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame,

		// Support indicators
		browser, transform, gpuAcceleration, performance, browserPlugins, fullScreenApi, visibilityEvent, visibilityHidden,
		isTouch  = !!('ontouchstart' in window),
		orientation = typeof window.orientation !== 'undefined' ? window.orientation : ($win.height() > $win.width() ? 0 : 90),
		orientationSupport = !!window.DeviceOrientationEvent;

	/**
	 * mightySlider.
	 *
	 * @class
	 *
	 * @param {Element} frame       DOM element of mightySlider container.
	 * @param {Object}  options     Object with options.
	 * @param {Object}  callbackMap Callbacks map.
	 */
	function mightySlider(frame, options, callbackMap) {
		var self = this;

		// Merge options deeply
		var o = $.extend(true, {}, mightySlider.defaults, options),

			// Frame
			$frame = $(frame),
			$parent = $(frame).parent(),
			$slideElement = $frame.children().eq(0),
			frameInlineOptions = getInlineOptions($frame),
			autoScale = o.autoScale && ( frameInlineOptions.height && { width: frameInlineOptions.width, height: frameInlineOptions.height } || { width: $parent.width(), height: $parent.height() }) || null,
			frameSize = 0,
			frameRatio = 1,
			slideElementSize = 0,
			pos = {
				current: 0,
				start: 0,
				center: 0,
				end: 0,
				destination: 0
			},

			// Slides
			$slides = 0,
			items = [],
			rel = {
				activeSlide: -1,
				firstSlide: 0,
				centerSlide: 0,
				lastSlide: 0,
				activePage: 0
			},

			// Navigation
			basicNav = o.navigation.navigationType === 'basic',
			forceCenteredNav = o.navigation.navigationType === 'forceCentered',
			centeredNav = o.navigation.navigationType === 'centered' || forceCenteredNav,
			navigationType = (basicNav || centeredNav || forceCenteredNav),

			// Scrollbar
			$scrollbar = $(o.scrollBar.scrollBarSource).eq(0),
			$handle = $scrollbar.children().eq(0),
			scrollbarSize = 0,
			handleSize = 0,
			hPos = {
				start: 0,
				end: 0,
				current: 0
			},

			// Pagesbar
			$pagesBar = o.pages.pagesBar && $(o.pages.pagesBar) || {},
			$pages = 0,
			pages = [],

			// Thumbnails bar
			$thumbnailsBar = o.thumbnails.thumbnailsBar && $(o.thumbnails.thumbnailsBar) || {},
			$thumbnails = 0,
			thumbnails = [],
			thumbnailNav = null,
			thumbnailNavOptions = {},

			// Scrolling and Dragging
			$scrollSource = o.scrolling.scrollSource && $(o.scrolling.scrollSource) || $frame,
			$dragSource = o.dragging.dragSource && $(o.dragging.dragSource) || $frame,
			dragging = {
				released: 1
			},

			// Buttons
			$forwardButton = $(o.buttons.forward),
			$backwardButton = $(o.buttons.backward),
			$prevButton = $(o.buttons.prev),
			$nextButton = $(o.buttons.next),
			$prevPageButton = $(o.buttons.prevPage),
			$nextPageButton = $(o.buttons.nextPage),
			$fullScreenButton = $(o.buttons.fullScreen),

			// Miscellaneous
			inserted = 0,
			hashLock = 0,
			callbacks = {},
			last = {},
			animation = {},
			move = {},
			captionParallax = {},
			parallax = {},
			scrolling = {
				last: 0,
				delta: 0,
				resetTime: 200
			},
			renderID = 0,
			historyID = 0,
			cycleID = 0,
			continuousID = 0,
			resizeID = 0,
			captionID = 0,
			captionParallaxID = 0,
			captionHistory = [],
			mediaEnabled = null,
			uniqId = uniqid(namespace),
			i, l,
			
			// Events
			resizeEvent = 'resize.' + uniqId + ' orientationchange.' + uniqId,
			hashChangeEvent = 'hashchange.' + uniqId,
			keyDownEvent = 'keydown.' + uniqId,
			mouseEnterEvent = 'mouseenter.' + uniqId,
			mouseLeaveEvent = 'mouseleave.' + uniqId,
			mouseMoveEvent = 'mousemove.' + uniqId,
			deviceOrientationEvent = 'deviceorientation.' + uniqId,
			visibilityChangeEvent = visibilityEvent + '.' + uniqId;

		// Expose properties
		self.initialized = 0,
		self.options = o,
		self.frame = $frame[0],
		self.slideElement = $slideElement[0],
		self.slides = items,
		self.position = pos,
		self.relative = rel,
		self.pages = pages,
		self.thumbnails = thumbnails,
		self.handlePosition = hPos,
		self.isFullScreen = 0,
		self.isPaused = 0,
		self.progressElapsed = 0,
		self.uniqId = uniqId;

		/**
		 * (Re)Loading function.
		 *
		 * Populate arrays, set sizes, bind events, ...
		 * @param {Bool} immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		function load(immediate) {
			// Local variables
			var lastSlidesCount = 0,
				lastPagesCount = pages.length,
				matchMedia = 0;

			// Auto scale slider if options.autoScale is enabled
			if (o.autoScale) {
				scaleSlider();
			}

			// Save old position
			pos.old = $.extend({}, pos),

			// Reset global variables
			frameSize = $frame[o.navigation.horizontal ? 'width' : 'height'](),
			scrollbarSize = $scrollbar[o.navigation.horizontal ? 'width' : 'height'](),
			slideElementSize = $slideElement[o.navigation.horizontal ? 'outerWidth' : 'outerHeight'](),
			pages.length = 0,

			// Set position limits & relatives
			pos.start = 0,
			pos.end = Math.max(slideElementSize - frameSize, 0);

			// Sizes & offsets for slide based navigations
			if (navigationType) {
				// Save the number of current slides
				var lastSlidesCount = items.length;

				// Reset navigationType related variables
				$slides = $slideElement.children(o.navigation.slideSelector);
				items.length = 0;

				// Needed variables
				var paddingStart = getPixel($slideElement, o.navigation.horizontal ? 'paddingLeft' : 'paddingTop'),
					paddingEnd = getPixel($slideElement, o.navigation.horizontal ? 'paddingRight' : 'paddingBottom'),
					borderBox = $($slides).css('boxSizing') === 'border-box',
					areFloated = $slides.css('float') !== 'none',
					ignoredMargin = 0,
					lastSlideIndex = $slides.length - 1,
					lastSlide;

				// Reset slideElementSize
				slideElementSize = 0;

				var $slide, slideOptions, slideType, property, slideMarginStart, slideMarginEnd, slideSizeFull, slideSize, singleSpaced, slide, $caption, captionOptions, captionType, captionAnimation, captionStyles, captionData;

				// Iterate through slides
				$slides.each(function (i, element) {
					// Slide
					$slide = $(element),
					slideOptions = getInlineOptions($slide),
					slideType = getSlideType(slideOptions),
					property = slideOptions.size || o.navigation.slideSize,
					slideMarginStart = getPixel($slide, o.navigation.horizontal ? 'marginLeft' : 'marginTop'),
					slideMarginEnd = getPixel($slide, o.navigation.horizontal ? 'marginRight' : 'marginBottom'),
					slideSize = getSlideSize($slide, property),
					slideSizeFull = slideSize + slideMarginStart + slideMarginEnd,
					singleSpaced = !slideMarginStart || !slideMarginEnd,
					slide = {};

					slide.element = element,
					slide.options = slideOptions,
					slide.type = slideType,
					slide.captions = [],
					slide.ID = slideOptions.ID && rawurlencode(slideOptions.ID) || i,
					slide.size = singleSpaced ? slideSize : slideSizeFull,
					slide.half = slide.size / 2,
					slide.start = slideElementSize + (singleSpaced ? slideMarginStart : 0),
					slide.center = slide.start - Math.round(frameSize / 2 - slide.size / 2),
					slide.end = slide.start - frameSize + slide.size,
					slide.isParallax = 0;

					// Add captions to slide object
					$('.' + minnamespace + 'Caption', $slide).each(function (index, caption) {
						$caption = $(caption),
						captionOptions = getInlineOptions($caption),
						captionType = getSlideType(captionOptions),
						captionAnimation = getCaptionKeyFrames($caption),
						captionStyles = $caption.data(minnamespace + 'styles'),
						captionData = {
							element: caption,
							type: captionType,
							options: captionOptions,
							animation: captionAnimation
						};

						if (captionStyles && resizeID && o.autoScale) {
							// Set necessary caption styles
							$caption.css(normalizeStyles($.extend({}, captionStyles, captionAnimation[captionAnimation.length - 1] && captionAnimation[captionAnimation.length - 1].style || {}), captionResponsiveStyles, frameRatio));
						}

						// Set isParallax value to slide if any captions has parallaxLevel options
						if (captionOptions.parallaxLevel) {
							slide.isParallax = 1;
						}

						// Set hasCaptionMediaEnabled value to slide if any captions has media options
						if (captionOptions.cover || captionOptions.video || captionOptions.source) {
							slide.hasCaptionMediaEnabled = 1;
						}

						slide.captions.push(captionData);

						$caption = captionOptions = captionType = captionAnimation = captionStyles = captionData = null;
					});

					// Normalize slide size for responsive purpose
					if(property) {
						$slide[0].style[o.navigation.horizontal ? 'width' : 'height'] = slideSize + 'px';
					}

					// Account for slideElementSize padding
					if (!i) {
						slideElementSize += paddingStart;
					}

					// Increment slideElement size for size of the active element
					slideElementSize += slideSizeFull;

					// Try to account for vertical margin collapsing in vertical mode
					// It's not bulletproof, but should work in 99% of cases
					if (!o.navigation.horizontal && !areFloated) {
						// Subtract smaller margin, but only when top margin is not 0, and this is not the first element
						if (slideMarginEnd && slideMarginStart && i > 0) {
							slideElementSize -= Math.min(slideMarginStart, slideMarginEnd);
						}
					}

					// Things to be done on last slide
					if (i === lastSlideIndex) {
						slide.end += paddingEnd;
						slideElementSize += paddingEnd;
						ignoredMargin = singleSpaced ? slideMarginEnd : 0;
					}

					// If is necessary to use matchMedia
					if ($.isArray(slideOptions.cover)) {
						matchMedia = 1;
					}

					// Add slide object to slides array
					items.push(slide);
					lastSlide = slide;

					$slide = slideOptions = slideType = property = slideMarginStart = slideMarginEnd = slideSizeFull = slideSize = singleSpaced = slide = null;
				});

				// Resize slideElement to fit all slides
				$slideElement[0].style[o.navigation.horizontal ? 'width' : 'height'] = (borderBox ? slideElementSize : slideElementSize - paddingStart - paddingEnd) + 'px';

				// Adjust internal slideElement size for last margin
				slideElementSize -= ignoredMargin;

				var slidesLength = items.length;

				// Set limits
				if (slidesLength) {
					pos.start =  items[0][forceCenteredNav ? 'center' : 'start'];
					pos.end = forceCenteredNav ? lastSlide.center : frameSize < slideElementSize ? lastSlide.end : pos.start;
				} else {
					pos.start = pos.end = 0;
				}
			}

			// Calculate slideElement center position
			pos.center = Math.round(pos.end / 2 + pos.start / 2);

			// Update relative positions
			updateRelatives();

			// Scrollbar
			if ($handle[0] && scrollbarSize > 0) {
				// Stretch scrollbar handle to represent the visible area
				if (o.scrollBar.dynamicHandle) {
					handleSize = pos.start === pos.end ? scrollbarSize : Math.round(scrollbarSize * frameSize / slideElementSize);
					handleSize = within(handleSize, o.scrollBar.minHandleSize, scrollbarSize);
					$handle[0].style[o.navigation.horizontal ? 'width' : 'height'] = handleSize + 'px';
				} else {
					handleSize = $handle[o.navigation.horizontal ? 'outerWidth' : 'outerHeight']();
				}

				hPos.end = scrollbarSize - handleSize;

				if (!renderID) {
					syncScrollbar();
				}
			}

			// Pages
			if (frameSize > 0) {
				var tempPagePos = pos.start,
					pagesHtml = '';

				// Populate pages array
				if (navigationType) {
					for (var i = 0, slide; i < slidesLength; i++) {
						slide = items[i];

						if (forceCenteredNav) {
							pages.push(slide.center);
						} else if (slide.start + slide.size > tempPagePos && tempPagePos <= pos.end) {
							tempPagePos = slide.start;
							pages.push(tempPagePos);
							tempPagePos += frameSize;
							if (tempPagePos > pos.end && tempPagePos < pos.end + frameSize) {
								pages.push(pos.end);
							}
						}
					}
				} else {
					while (tempPagePos - frameSize < pos.end) {
						pages.push(tempPagePos);
						tempPagePos += frameSize;
					}
				}

				// Pages bar
				var pagesLength = pages.length;
				if ($pagesBar[0] && lastPagesCount !== pagesLength) {
					for (var i = 0; i < pagesLength; i++) {
						pagesHtml += o.pages.pageBuilder.call(self, i);
					}
					$pages = $pagesBar.html(pagesHtml).children();
					$pages.eq(rel.activePage).addClass(o.classes.activeClass);
				}
			}

			// Thumbnails
			if (slidesLength > 0 && (!self.initialized || (self.initialized && inserted))) {
				syncThumbnailsbar();
			}

			// Extend relative variables object with some useful info
			rel.slideElementSize = slideElementSize;
			rel.frameSize = frameSize;
			rel.scrollbarSize = scrollbarSize;
			rel.handleSize = handleSize;

			// Activate requested position
			if (navigationType) {
				if (!self.initialized) {
					activate(o.startAt, 1);
					self[centeredNav ? 'toCenter' : 'toStart'](o.startAt, 1);
				} else if (rel.activeSlide >= slidesLength || lastSlidesCount === 0 && slidesLength > 0 && (self.initialized && inserted)) {
					// Activate last slide if previous active has been removed, or first slide
					// when there were no slides before, and new got appended.
					activate(rel.activeSlide >= slidesLength ? slidesLength - 1 : 0, !lastSlidesCount, immediate);
				}
				// Fix possible overflowing
				slideTo(centeredNav && slidesLength ? items[rel.activeSlide].center : within(pos.destination, pos.start, pos.end), immediate);
			} else {
				if (!self.initialized) {
					slideTo(o.startAt, 1);
				} else {
					// Fix possible overflowing
					slideTo(within(pos.destination, pos.start, pos.end));
				}
			}

			// Set slides cover & icons
			if(!self.initialized || (resizeID && matchMedia) || (self.initialized && inserted)) {
				setSlidesCovers();
				if(!resizeID) {
					setSlidesIcons();
				}
			}

			if (o.autoResize) {
				resizeFrame(within(rel.activeSlide, rel.firstSlide, rel.lastSlide), 1);
			}

			// Reposition slides contents
			if(self.initialized) {
				repositionCovers();
			}

			// Trigger :load event
			trigger('load');
		}
		self.reload = load;

		/**
		 * Animate to a position.
		 *
		 * @param {Int}  newPos    New position.
		 * @param {Bool} immediate Reposition immediately without an animation.
		 * @param {Bool} dontAlign Do not align slides, use the raw position passed in first argument.
		 *
		 * @return {Void}
		 */
		function slideTo(newPos, immediate, dontAlign) {
			// Align slides
			if (navigationType && dragging.released && !dontAlign) {
				var tempRel = getRelatives(newPos),
					isNotBordering = newPos > pos.start && newPos < pos.end;

				if (centeredNav) {
					if (isNotBordering) {
						newPos = items[tempRel.centerSlide].center;
					}
					if (forceCenteredNav && o.navigation.activateMiddle) {
						activate(tempRel.centerSlide);
					}
				} else if (isNotBordering) {
					newPos = items[tempRel.firstSlide].start;
				}
			}

			// Handle overflowing position limits
			if (dragging.init && dragging.slideElement && o.dragging.elasticBounds) {
				if (newPos > pos.end) {
					newPos = pos.end + (newPos - pos.end) / 6;
				} else if (newPos < pos.start) {
					newPos = pos.start + (newPos - pos.start) / 6;
				}
			} else {
				newPos = within(newPos, pos.start, pos.end);
			}

			// Update the animation object
			animation.start = performance.now();
			animation.time = 0;
			animation.from = pos.current;
			animation.to = newPos;
			animation.delta = newPos - pos.current;
			animation.tweesing = dragging.tweese || dragging.init && !dragging.slideElement;
			animation.immediate = !animation.tweesing && (immediate || dragging.init && dragging.slideElement || !o.speed);

			// Reset dragging tweesing request
			dragging.tweese = 0;

			// Start animation rendering
			if (newPos !== pos.destination) {
				pos.destination = newPos;
				// Trigger :change event
				trigger('change');
				if (!renderID) {
					render();
				}

				if (o.autoResize) {
					resizeFrame(rel.activeSlide, immediate);
				}
			}

			// Reset next cycle timeout
			resetCycle();

			// Synchronize states
			updateRelatives();
			updateButtonsState();
			syncPagesbar();
		}

		/**
		 * Render animation frame.
		 *
		 * @return {Void}
		 */
		function render() {
			// If first render call, wait for next animationFrame
			if (!renderID) {
				renderID = requestAnimationFrame(render);
				if (dragging.released) {
					// Trigger :moveStart event
					trigger('moveStart');
				}
				return;
			}

			// If immediate repositioning is requested, don't animate.
			if (animation.immediate) {
				pos.current = animation.to;
			}
			// Use tweesing for animations without known end point
			else if (animation.tweesing) {
				animation.tweeseDelta = animation.to - pos.current;
				// Fuck Zeno's paradox
				if (Math.abs(animation.tweeseDelta) < 0.1) {
					pos.current = animation.to;
				} else {
					pos.current += animation.tweeseDelta * (dragging.released ? o.dragging.swingSpeed : o.dragging.syncSpeed);
				}
			}
			// Use tweening for basic animations with known end point
			else {
				animation.time = Math.min(performance.now() - animation.start, o.speed);
				pos.current = animation.from + animation.delta * jQuery.easing[o.easing](animation.time/o.speed, animation.time, 0, 1, o.speed);
			}

			// If there is nothing more to render break the rendering loop, otherwise request new animation frame.
			if (animation.to === pos.current) {
				pos.current = animation.to;
				dragging.tweese = renderID = 0;
			} else {
				renderID = requestAnimationFrame(render);
			}

			// Trigger :move event
			trigger('move');

			// Update slideElement position
			if (transform) {
				$slideElement[0].style[transform] = gpuAcceleration + (o.navigation.horizontal ? 'translateX' : 'translateY') + '(' + (-pos.current) + 'px)';
			} else {
				$slideElement[0].style[o.navigation.horizontal ? 'left' : 'top'] = -Math.round(pos.current) + 'px';
			}

			// When animation reached the end, and dragging is not active, trigger moveEnd
			if (!renderID && dragging.released) {
				// Set slides covers
				setSlidesCovers();

				// Trigger :moveEnd event
				trigger('moveEnd');
			}

			syncScrollbar();
		}

		/**
		 * Synchronizes scrollbar with the SLIDEELEMENT.
		 *
		 * @return {Void}
		 */
		function syncScrollbar() {
			if ($handle.length) {
				hPos.current = pos.start === pos.end ? 0 : (((dragging.init && !dragging.slideElement) ? pos.destination : pos.current) - pos.start) / (pos.end - pos.start) * hPos.end;
				hPos.current = within(Math.round(hPos.current), hPos.start, hPos.end);
				if (last.hPos !== hPos.current) {
					last.hPos = hPos.current;
					if (transform) {
						$handle[0].style[transform] = gpuAcceleration + (o.navigation.horizontal ? 'translateX' : 'translateY') + '(' + hPos.current + 'px)';
					} else {
						$handle[0].style[o.navigation.horizontal ? 'left' : 'top'] = hPos.current + 'px';
					}
				}
			}
		}

		/**
		 * Synchronizes pagesbar with slideElement.
		 *
		 * @return {Void}
		 */
		function syncPagesbar() {
			if ($pages[0] && last.page !== rel.activePage) {
				last.page = rel.activePage;
				$pages.removeClass(o.classes.activeClass).eq(rel.activePage).addClass(o.classes.activeClass);
				// Trigger :activePage event
				trigger('activePage', last.page);
			}
		}

		/**
		 * Synchronizes thumbnailsbar.
		 *
		 * @return {Void}
		 */
		function syncThumbnailsbar() {
			var thumbnailsHtml = '';

			// Populate thumbnails array
			for (var i = 0, len = items.length, slide, thumbnail; i < len; i++) {
				slide = items[i],
				thumbnail = slide.options.thumbnail || slide.options.cover || 1;

				thumbnails.push(thumbnail);
				if ($thumbnailsBar[0] && thumbnail) {
					thumbnailsHtml += o.thumbnails.thumbnailBuilder.call(self, i, thumbnail);
				}
			}

			// Thumbnails bar
			if ($thumbnailsBar[0]) {
				$thumbnails = $thumbnailsBar.html(thumbnailsHtml).children();

				if (o.thumbnails.thumbnailNav) {
					if (thumbnailNav) {
						thumbnailNav.destroy();
					}
					else {
						$.extend(true, thumbnailNavOptions, {
							moveBy: o.moveBy,
							speed: typeof o.thumbnails.speed !== 'undefined' ? o.thumbnails.speed : o.speed,
							easing: o.easing,
							startAt: o.startAt,

							// Navigation options
							navigation: {
								horizontal: o.thumbnails.horizontal,
								navigationType: o.thumbnails.thumbnailNav,
								slideSize: o.thumbnails.thumbnailSize,
								activateOn: o.thumbnails.activateOn
							},

							// Scrolling options
							scrolling: {
								scrollBy: o.thumbnails.scrollBy
							},

							// Dragging options
							dragging: {
								mouseDragging: o.thumbnails.mouseDragging,
								touchDragging: o.thumbnails.touchDragging,
								swingSpeed: o.dragging.swingSpeed,
								elasticBounds: o.dragging.elasticBounds
							}
						});
						
						thumbnailNav = new mightySlider($thumbnailsBar.parent(), thumbnailNavOptions, {
							active: function(name, index) {
								self.activate(index);
							}
						});
					}

					// Preload thumbnails then initialize thumbnails slider
					if (o.thumbnails.preloadThumbnails) {
						preloadimages(thumbnails).done(function() {
							thumbnailNav.init();
							thumbnailNav.reload();
						});
					}
					else {
						thumbnailNav.init();
						thumbnailNav.reload();
					}
				}
			}
		}

		/**
		 * Scale slider
		 *
		 * @return {Void}
		 */
		function scaleSlider() {
			var parentSize = $parent.width(),
				ratio = parentSize / autoScale.width;

			// Remember frame ratio
			frameRatio = ratio;

			$frame.height(autoScale.height * ratio);
		}

		/**
		 * Returns the position object.
		 *
		 * @param {Mixed} slide
		 *
		 * @return {Object}
		 */
		self.getPosition = function (slide) {
			if (navigationType) {
				var index = getIndex(slide);
				return index !== -1 ? items[index] : false;
			} else {
				var $slide = $slideElement.find(slide).eq(0);

				if ($slide[0]) {
					var offset = o.navigation.horizontal ? $slide.offset().left - $slideElement.offset().left : $slide.offset().top - $slideElement.offset().top;
					var size = $slide[o.navigation.horizontal ? 'outerWidth' : 'outerHeight']();

					return {
						start: offset,
						center: offset - frameSize / 2 + size / 2,
						end: offset - frameSize + size,
						size: size
					};
				} else {
					return false;
				}
			}
		};

		/**
		 * Continuous move in a specified direction.
		 *
		 * @param  {Bool} forward True for forward movement, otherwise it'll go backwards.
		 * @param  {Int}  speed   Movement speed in pixels per frame. Overrides options.moveBy value.
		 *
		 * @return {Void}
		 */
		self.moveBy = function (speed) {
			move.speed = speed;
			// If already initiated, or there is nowhere to move, abort
			if (dragging.init || !move.speed || pos.current === (move.speed > 0 ? pos.end : pos.start)) {
				return;
			}
			// Initiate move object
			move.lastTime = performance.now();
			move.startPos = pos.current;
			// Set dragging as initiated
			continuousInit('button');
			dragging.init = 1;
			// Start movement
			// Trigger :moveStart event
			trigger('moveStart');
			cancelAnimationFrame(continuousID);
			moveLoop();
		};

		/**
		 * Continuous movement loop.
		 *
		 * @return {Void}
		 */
		function moveLoop() {
			// If there is nowhere to move anymore, stop
			if (!move.speed || pos.current === (move.speed > 0 ? pos.end : pos.start)) {
				self.stop();
			}
			// Request new move loop if it hasn't been stopped
			continuousID = dragging.init ? requestAnimationFrame(moveLoop) : 0;
			// Update move object
			move.now = performance.now();
			move.pos = pos.current + (move.now - move.lastTime) / 1000 * move.speed;
			// Slide
			slideTo(dragging.init ? move.pos : Math.round(move.pos));
			// Normally, this is triggered in render(), but if there
			// is nothing to render, we have to do it manually here.
			if (!dragging.init && pos.current === pos.destination) {
				// Trigger :moveEnd event
				trigger('moveEnd');
			}
			// Update times for future iteration
			move.lastTime = move.now;
		}

		/**
		 * Stops continuous movement.
		 *
		 * @return {Void}
		 */
		self.stop = function () {
			if (dragging.source === 'button') {
				dragging.init = 0;
				dragging.released = 1;
			}
		};

		/**
		 * Activate previous slide.
		 *
		 * @param {Bool}  immediate Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.prev = function (immediate) {
			self.activate(rel.activeSlide - 1, immediate);
		};

		/**
		 * Activate next slide.
		 *
		 * @param {Bool}  immediate Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.next = function (immediate) {
			self.activate(rel.activeSlide + 1, immediate);
		};

		/**
		 * Activate previous page.
		 *
		 * @param {Bool}  immediate Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.prevPage = function (immediate) {
			self.activatePage(rel.activePage - 1, immediate);
		};

		/**
		 * Activate next page.
		 *
		 * @param {Bool}  immediate Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.nextPage = function (immediate) {
			self.activatePage(rel.activePage + 1, immediate);
		};

		/**
		 * Slide slideElement by amount of pixels.
		 *
		 * @param {Int}  delta     Difference in position. Positive means forward, negative means backward.
		 * @param {Bool} immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.slideBy = function (delta, immediate) {
			if (!delta) {
				return;
			}
			if (navigationType) {
				self[centeredNav ? 'toCenter' : 'toStart'](
					within((centeredNav ? rel.centerSlide : rel.firstSlide) + o.scrolling.scrollBy * delta, 0, items.length)
				);
			} else {
				slideTo(pos.destination + delta, immediate);
			}
		};

		/**
		 * Animate slideElement to a specific position.
		 *
		 * @param {Int}  position       New position.
		 * @param {Bool} immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.slideTo = function (position, immediate) {
			slideTo(position, immediate);
		};

		/**
		 * Core method for handling `toLocation` methods.
		 *
		 * @param  {String} location
		 * @param  {Mixed}  slide
		 * @param  {Bool}   immediate
		 *
		 * @return {Void}
		 */
		function to(location, slide, immediate) {
			// Optional arguments logic
			if (type(slide) === 'boolean') {
				immediate = slide;
				slide = undefined;
			}

			if (slide === undefined) {
				slideTo(pos[location], immediate);
			}
			else {
				// You can't align slides to sides of the frame
				// when centered navigation type is enabled
				if (centeredNav && location !== 'center') {
					return;
				}

				var slideObj = self.getPosition(slide);
				if (slideObj) {
					slideTo(slideObj[location], immediate, !centeredNav);
				}
			}
		}

		/**
		 * Animate element or the whole slideElement to the start of the frame.
		 *
		 * @param {Mixed} slide      Slide DOM element, or index starting at 0. Omitting will animate slideElement.
		 * @param {Bool}  immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.toStart = function (slide, immediate) {
			to('start', slide, immediate);
		};

		/**
		 * Animate element or the whole slideElement to the end of the frame.
		 *
		 * @param {Mixed} slide      Slide DOM element, or index starting at 0. Omitting will animate slideElement.
		 * @param {Bool}  immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.toEnd = function (slide, immediate) {
			to('end', slide, immediate);
		};

		/**
		 * Animate element or the whole slideElement to the center of the frame.
		 *
		 * @param {Mixed} slide      Slide DOM element, or index starting at 0. Omitting will animate slideElement.
		 * @param {Bool}  immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.toCenter = function (slide, immediate) {
			to('center', slide, immediate);
		};

		/**
		 * Get the index of an slide in slideElement.
		 *
		 * @param {Mixed} slide     Slide DOM element.
		 *
		 * @return {Int}  Slide     index, or -1 if not found.
		 */
		function getIndex(slide) {
			return type(slide) !== 'undefined' ?
					is_numeric(slide) ?
						slide >= 0 && slide < items.length ? slide : -1 :
						$slides.index(slide) :
					-1;
		}
		// Expose getIndex without lowering the compressibility of it,
		// as it is used quite often throughout mightySlider.
		self.getIndex = getIndex;

		/**
		 * Get index of an slide in slideElement based on a variety of input types.
		 *
		 * @param  {Mixed} slide   DOM element, positive or negative integer.
		 *
		 * @return {Int}   Slide   index, or -1 if not found.
		 */
		function getRelativeIndex(slide) {
			return getIndex(is_numeric(slide) && slide < 0 ? slide + items.length : slide);
		}

		/**
		 * Activates an slide.
		 *
		 * @param  {Mixed} slide       Slide DOM element, or index starting at 0.
		 *
		 * @return {Mixed} Activated   slide index or false on fail.
		 */
		function activate(slide) {
			var index = getIndex(slide),
				lastActive = rel.activeSlide;

			if (!navigationType || index < 0) {
				return false;
			}

			// Update classes, last active index, and trigger active event only when there
			// has been a change. Otherwise just return the current active index.
			if (last.active !== index) {
				var slideData = items[index];

				// Reset cycling progress time elapsed
				if (!resizeID) {
					self.progressElapsed = 0;
				}

				// Prevent cycling loop
				if (!o.cycling.loop && index >= items.length - 1) {
					self.pause();
				}

				// Update classes
				$slides.eq(rel.activeSlide).removeClass(o.classes.activeClass);
				$slides.eq(index).addClass(o.classes.activeClass);

				// If captions in active slide are parallax
				if (items[rel.activeSlide] && items[rel.activeSlide].isParallax) {
					$parent.off('.' + uniqId);
					$win.off(deviceOrientationEvent);
				}

				if (slideData.isParallax) {
					// Find alowed parallax captions
					parallax.parallaxCaptions = slideData.captions.filter(function (e, i, arr) {
						return !!e.options.parallaxLevel;
					});

					if (!isTouch) {
						// Add :mouseenter event to the $parent
						$parent.on(mouseEnterEvent, function (event) {
							// Cancel the animation for backing to original position
							cancelAnimationFrame(captionParallaxID);

							parallax.source = 'mouse';

							// Local variables
							var offset = $parent.offset(),
								offsetTop = offset.top,
								offsetLeft = offset.left,
								startX = event.isTrigger ? 0 : event.pageX - offsetLeft,
								startY = event.isTrigger ? 0 : event.pageY - offsetTop;

							// Add :mousemove event to the $parent
							$parent.off(mouseLeaveEvent).on(mouseMoveEvent, function (e) {
								// Calculate the X & Y differences from started axises
								parallax.X = (e.pageX - offsetLeft) - startX,
								parallax.Y = (e.pageY - offsetTop) - startY;

								// Handle parallax effect for captions
								parallaxCaptions();
							}).one(mouseLeaveEvent, function () {
								$parent.off(mouseMoveEvent);

								// Normalize parallax effect for captions
								if (o.parallax.revert) {
									revertParallax();
								}
							});
						}).trigger(mouseEnterEvent);
					}
					else if (orientationSupport) {
						$win.on(deviceOrientationEvent, function(e) {
							var event = e.originalEvent;

							// Validate event properties.
							if (typeof event !== 'undefined' && event.beta !== null && event.gamma !== null) {
								parallax.source = 'orientation';

								// Extract Rotation
								switch (orientation) {
									case 0:
									parallax.X = event.gamma,
									parallax.Y = event.beta;
									break;

									case 180:
									parallax.X = -event.gamma,
									parallax.Y = -event.beta;
									break;

									case -90:
									parallax.X = -event.beta,
									parallax.Y = event.gamma;
									break;

									case 90:
									parallax.X = event.beta,
									parallax.Y = -event.gamma;
									break;
								}

								parallax.X = parallax.X * 8,
								parallax.Y = parallax.Y * 8;

								// Handle parallax effect for captions
								parallaxCaptions();
							}
						});
					}
				}
				else {
					parallax = {}
				}

				// Clear previous slide captions
				if (!resizeID) {
					clearCaptions(last.active);
				}

				last.active = rel.activeSlide = index;

				updateButtonsState();

				// Remove previous media content
				if (!resizeID && mediaEnabled) {
					removeContent();
				}

				// Clear caption timing if available
				if (captionID) {
					clearTimeout(captionID);
				}

				// Render captions in the current active slide
				if (slideData.captions.length && !resizeID) {
					self.one('slideLoaded', function(event, slideIndex) {
						if (slideIndex === index) {
							captionID = setTimeout(function () {
								renderCaptions(index);
								clearTimeout(captionID);
							}, lastActive < 0 ? 0 : o.speed + 20);
						}
					});
				}

				// Change Hashtag
				if (o.deeplinking.linkID && !resizeID && !hashLock && self.initialized) {
					changeHashtag(index);
				}

				// Load all slide inner contents
				if (!resizeID) {
					loadSlide(index);
				}

				// Trigger :active event
				trigger('active', index);
			}

			return index;
		}

		/**
		 * Activates an slide and helps with further navigation when options.navigation.smart is enabled.
		 *
		 * @param {Mixed} slide      Slide DOM element, or index starting at 0.
		 * @param {Bool}  immediate  Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.activate = function (slide, immediate) {
			var index = activate(slide);

			// Smart navigation
			if (o.navigation.smart && index !== false) {
				// When centeredNav is enabled, center the element.
				// Otherwise, determine where to position the element based on its current position.
				// If the element is currently on the far end side of the frame, assume that user is
				// moving forward and animate it to the start of the visible frame, and vice versa.
				if (centeredNav) {
					self.toCenter(index, immediate);
				}
				else if (index >= rel.lastSlide) {
					self.toStart(index, immediate);
				}
				else if (index <= rel.firstSlide) {
					self.toEnd(index, immediate);
				}
				else {
					resetCycle();
				}
			}
		};

		/**
		 * Activates a page.
		 *
		 * @param {Int}  index     Page index, starting from 0.
		 * @param {Bool} immediate Whether to reposition immediately without animation.
		 *
		 * @return {Void}
		 */
		self.activatePage = function (index, immediate) {
			if (is_numeric(index)) {
				// Reset cycling progress time elapsed
				if (!resizeID) {
					self.progressElapsed = 0;
				}

				// Prevent cycling loop
				if (!o.cycling.loop && index >= pages.length - 1) {
					self.pause();
				}

				slideTo(pages[within(index, 0, pages.length - 1)], immediate);
			}
		};

		/**
		 * Return relative positions of slides based on their visibility within FRAME.
		 *
		 * @param {Int} slideElementPos Position of slideElement.
		 *
		 * @return {Void}
		 */
		function getRelatives(slideElementPos) {
			slideElementPos = within(is_numeric(slideElementPos) ? slideElementPos : pos.destination, pos.start, pos.end);

			var relatives = {},
				centerOffset = forceCenteredNav ? 0 : frameSize / 2;

			// Determine active page
			for (var p = 0, pl = pages.length; p < pl; p++) {
				if (slideElementPos >= pos.end || p === pages.length - 1) {
					relatives.activePage = pages.length - 1;
					break;
				}

				if (slideElementPos <= pages[p] + centerOffset) {
					relatives.activePage = p;
					break;
				}
			}

			// Relative slide indexes
			if (navigationType) {
				var first = false,
					last = false,
					center = false;

				// From start
				for (var i = 0, il = items.length; i < il; i++) {
					// First slide
					if (first === false && slideElementPos <= items[i].start + items[i].half) {
						first = i;
					}

					// Center slide
					if (center === false && slideElementPos <= items[i].center + items[i].half) {
						center = i;
					}

					// Last slide
					if (i === il - 1 || slideElementPos <= items[i].end + items[i].half) {
						last = i;
						break;
					}
				}

				// Safe assignment, just to be sure the false won't be returned
				relatives.firstSlide = is_numeric(first) ? first : 0;
				relatives.centerSlide = is_numeric(center) ? center : relatives.firstSlide;
				relatives.lastSlide = is_numeric(last) ? last : relatives.centerSlide;
			}

			return relatives;
		}

		/**
		 * Update object with relative positions.
		 *
		 * @param {Int} newPos
		 *
		 * @return {Void}
		 */
		function updateRelatives(newPos) {
			$.extend(rel, getRelatives(newPos));
		}

		/**
		 * Disable navigation buttons when needed.
		 *
		 * Adds disabledClass, and when the button is <button> or <input>, activates :disabled state.
		 *
		 * @return {Void}
		 */
		function updateButtonsState() {
			var isStart = pos.destination <= pos.start,
				isEnd = pos.destination >= pos.end,
				slideElementPosState = isStart ? 1 : isEnd ? 2 : 3;

			// Update paging buttons only if there has been a change in slideElement position
			if (last.slideElementPosState !== slideElementPosState) {
				last.slideElementPosState = slideElementPosState;

				$prevPageButton.prop('disabled', isStart).add($backwardButton)[isStart ? 'addClass' : 'removeClass'](o.classes.disabledClass);
				$nextPageButton.prop('disabled', isEnd).add($forwardButton)[isEnd ? 'addClass' : 'removeClass'](o.classes.disabledClass);
			}

			// Forward & Backward buttons need a separate state caching because we cannot "property disable"
			// them while they are being used, as disabled buttons stop emitting mouse events.
			if (last.fwdbwdState !== slideElementPosState && dragging.released) {
				last.fwdbwdState = slideElementPosState;

				$backwardButton.prop('disabled', isStart);
				$forwardButton.prop('disabled', isEnd);
			}

			// Slide navigation
			if (navigationType) {
				var isFirst = rel.activeSlide === 0,
					isLast = rel.activeSlide >= items.length - 1,
					slidesButtonState = isFirst ? 1 : isLast ? 2 : 3;

				if (last.slidesButtonState !== slidesButtonState) {
					last.slidesButtonState = slidesButtonState;

					$prevButton[isFirst ? 'addClass' : 'removeClass'](o.classes.disabledClass).prop('disabled', isFirst);
					$nextButton[isLast ? 'addClass' : 'removeClass'](o.classes.disabledClass).prop('disabled', isLast);
				}
			}
		}

		/**
		 * Resume cycling.
		 *
		 * @param {Int} priority Resume pause with priority lower or equal than this. Used internally for pauseOnHover.
		 *
		 * @return {Void}
		 */
		self.resume = function (priority) {
			if (!o.cycling.cycleBy || !o.cycling.pauseTime || o.cycling.cycleBy === 'slides' && !items[0] || priority < self.isPaused) {
				return;
			}

			self.isPaused = 0;

			if (cycleID) {
				cycleID = cancelAnimationFrame(cycleID);
			}
			else {
				// Trigger :resume event
				trigger('resume');
			}

			var timeOut = items[rel.activeSlide].options.pauseTime || o.cycling.pauseTime,
				lastTime = performance.now(), timestamp,
				requestHandler = function () {
					timestamp = performance.now();

					// Calculate progress elapsed time
					self.progressElapsed += timestamp - lastTime,
					lastTime = timestamp;

					// Trigger :progress event
					trigger('progress', within(self.progressElapsed / timeOut * 1, 0, 1));

					if (self.progressElapsed >= timeOut) {

						switch (o.cycling.cycleBy) {
							case 'slides':
								self.activate(rel.activeSlide >= items.length - 1 ? 0 : rel.activeSlide + 1);
								break;

							case 'pages':
								self.activatePage(rel.activePage >= pages.length - 1 ? 0 : rel.activePage + 1);
								break;
						}

						requestHandler = null;
					}
					else {
						cycleID = requestAnimationFrame(requestHandler);
					}
				};

			cycleID = requestAnimationFrame(requestHandler);
		};

		/**
		 * Pause cycling.
		 *
		 * @param {Int} priority Pause priority. 100 is default. Used internally for pauseOnHover.
		 *
		 * @return {Void}
		 */
		self.pause = function (priority) {
			if (priority < self.isPaused) {
				return;
			}

			self.isPaused = priority || 100;

			if (cycleID) {
				cycleID = cancelAnimationFrame(cycleID);
				// Trigger :pause event
				trigger('pause');
			}
		};

		/**
		 * Toggle cycling.
		 *
		 * @return {Void}
		 */
		self.toggleCycling = function () {
			self[cycleID ? 'pause' : 'resume']();
		};

		/**
		 * Enter fullscreen.
		 *
		 * @return {Void}
		 */
		self.enterFullScreen = function () {
			if (!self.isFullScreen) {
				$parent.addClass(o.classes.isInFullScreen);

				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen($parent[0]);
				}
				else {
					$win.triggerHandler('resize');
				}
				self.isFullScreen = 1;

				// Trigger :enterFullScreen event
				trigger('enterFullScreen');
			}
		};

		/**
		 * Exit from fullscreen.
		 *
		 * @return {Void}
		 */
		self.exitFullScreen = function () {
			if (self.isFullScreen) {
				$parent.removeClass(o.classes.isInFullScreen);

				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.cancelFullScreen($parent[0]);
				}
				else {
					$win.triggerHandler('resize');
				}
				self.isFullScreen = 0;

				// Trigger :exitFullScreen event
				trigger('exitFullScreen');
			}
		};

		/**
		 * Toggle fullscreen.
		 *
		 * @return {Void}
		 */
		self.toggleFullScreen = function () {
			self[self.isFullScreen ? 'exitFullScreen' : 'enterFullScreen']();
		};

		/**
		 * Updates a signle or multiple option values.
		 *
		 * @param {Mixed} name  Name of the option that should be updated, or object that will extend the options.
		 * @param {Mixed} value New option value.
		 *
		 * @return {Void}
		 */
		self.set = function (name, value) {
			if ($.isPlainObject(name)) {
				$.extend(true, o, name);
			}
			else if (o.hasOwnProperty(name)) {
				o[name] = value;
			}

			// Set thumbnails options if thumbnail navigation is available
			if (thumbnailNav) {
				$.extend(true, thumbnailNavOptions, {
					moveBy: o.moveBy,
					speed: typeof o.thumbnails.speed !== 'undefined' ? o.thumbnails.speed : o.speed,
					easing: o.easing,
					startAt: o.startAt,

					// Navigation options
					navigation: {
						horizontal: o.thumbnails.horizontal,
						navigationType: o.thumbnails.thumbnailNav,
						slideSize: o.thumbnails.thumbnailSize,
						activateOn: o.thumbnails.activateOn
					},

					// Scrolling options
					scrolling: {
						scrollBy: o.thumbnails.scrollBy
					},

					// Dragging options
					dragging: {
						mouseDragging: o.thumbnails.mouseDragging,
						touchDragging: o.thumbnails.touchDragging,
						swingSpeed: o.dragging.swingSpeed,
						elasticBounds: o.dragging.elasticBounds
					}
				});

				thumbnailNav.set(thumbnailNavOptions);
			}

			// Reload
			load();
		};

		/**
		 * Add one or multiple slides to the slideElement end, or a specified position index.
		 *
		 * @param {Mixed} element Node element, or HTML string.
		 * @param {Int}   index   Index of a new slide position. By default slide is appended at the end.
		 *
		 * @return {Void}
		 */
		self.add = function (element, index) {
			var $element = $(element);

			if (navigationType) {
				// Insert the element(s)
				if (type(index) === 'undefined' || !items[0]) {
					$element.appendTo($slideElement);
				}
				else if (items.length) {
					$element.insertBefore(items[index].element);
				}

				$element.addClass(minnamespace + 'Slide');

				// Adjust the activeSlide index
				if (index <= rel.activeSlide) {
					last.active = rel.activeSlide += $element.length;
				}
			} else {
				$slideElement.append($element);
			}

			// Mark as inserted for load new slide content
			inserted = 1;

			// Reload
			load();

			// Unmark inserted
			inserted = 0;
		};

		/**
		 * Remove an slide from slideElement.
		 *
		 * @param {Mixed} element Slide index, or DOM element.
		 * @param {Int}   index   Index of a new slide position. By default slide is appended at the end.
		 *
		 * @return {Void}
		 */
		self.remove = function (element) {
			if (navigationType) {
				var index = getRelativeIndex(element);

				if (index > -1) {
					// Remove the element
					$slides.eq(index).remove();

					// If the current slide is being removed, activate new one after reload
					var reactivate = index === rel.activeSlide && !(forceCenteredNav && o.navigation.activateMiddle);

					// Adjust the activeSlide index
					if (index < rel.activeSlide || rel.activeSlide >= items.length - 1) {
						last.active = --rel.activeSlide;
					}

					// Reload
					load();

					// Activate new slide at the removed position if the current active got removed
					if (reactivate) {
						self.activate(rel.activeSlide);
					}
				}
			} else {
				$(element).remove();
				load();
			}
		};

		/**
		 * Helps re-arranging slides.
		 *
		 * @param  {Mixed} slide     Slide DOM element, or index starting at 0. Use negative numbers to select slides from the end.
		 * @param  {Mixed} position Slide insertion anchor. Accepts same input types as slide argument.
		 * @param  {Bool}  after    Insert after instead of before the anchor.
		 *
		 * @return {Void}
		 */
		function move(slide, position, after) {
			slide = getRelativeIndex(slide);
			position = getRelativeIndex(position);

			// Move only if there is an actual change requested
			if (slide > -1 && position > -1 && slide !== position && (!after || position !== slide - 1) && (after || position !== slide + 1)) {
				$slides.eq(slide)[after ? 'insertAfter' : 'insertBefore'](items[position].element);

				var shiftStart = slide < position ? slide : (after ? position : position - 1),
					shiftEnd = slide > position ? slide : (after ? position + 1 : position),
					shiftsUp = slide > position;

				// Update activeSlide index
				if (slide === rel.activeSlide) {
					last.active = rel.activeSlide = after ? (shiftsUp ? position + 1 : position) : (shiftsUp ? position : position - 1);
				}
				else if (rel.activeSlide > shiftStart && rel.activeSlide < shiftEnd) {
					last.active = rel.activeSlide += shiftsUp ? 1 : -1;
				}

				// Reload
				load();
			}
		}

		/**
		 * Move slide after the target anchor.
		 *
		 * @param  {Mixed} slide     Slide to be moved. Can be DOM element or slide index.
		 * @param  {Mixed} position Target position anchor. Can be DOM element or slide index.
		 *
		 * @return {Void}
		 */
		self.moveAfter = function (slide, position) {
			move(slide, position, 1);
		};

		/**
		 * Move slide before the target anchor.
		 *
		 * @param  {Mixed} slide     Slide to be moved. Can be DOM element or slide index.
		 * @param  {Mixed} position Target position anchor. Can be DOM element or slide index.
		 *
		 * @return {Void}
		 */
		self.moveBefore = function (slide, position) {
			move(slide, position);
		};

		/**
		 * Registers callbacks to be executed only once.
		 *
		 * @param  {Mixed} name  Event name, or callbacks map.
		 * @param  {Mixed} fn    Callback, or an array of callback functions.
		 *
		 * @return {Void}
		 */
		self.one = function (name, fn) {
			function proxy() {
				fn.apply(self, arguments);
				self.off(name, proxy);
			}
			self.on(name, proxy);
		};

		/**
		 * Registers callbacks.
		 *
		 * @param  {Mixed} name  Event name, or callbacks map.
		 * @param  {Mixed} fn    Callback, or an array of callback functions.
		 *
		 * @return {Void}
		 */
		self.on = function (name, fn) {
			// Callbacks map
			if (type(name) === 'object') {
				for (var key in name) {
					if (name.hasOwnProperty(key)) {
						self.on(key, name[key]);
					}
				}
			// Callback
			}
			else if (type(fn) === 'function') {
				var names = name.split(' ');
				for (var n = 0, nl = names.length; n < nl; n++) {
					callbacks[names[n]] = callbacks[names[n]] || [];
					if (callbackIndex(names[n], fn) === -1) {
						callbacks[names[n]].push(fn);
					}
				}
			// Callbacks array
			}
			else if (type(fn) === 'array') {
				for (var f = 0, fl = fn.length; f < fl; f++) {
					self.on(name, fn[f]);
				}
			}
		};

		/**
		 * Remove one or all callbacks.
		 *
		 * @param  {String} name Event name.
		 * @param  {Mixed}  fn   Callback, or an array of callback functions. Omit to remove all callbacks.
		 *
		 * @return {Void}
		 */
		self.off = function (name, fn) {
			if (fn instanceof Array) {
				for (var f = 0, fl = fn.length; f < fl; f++) {
					self.off(name, fn[f]);
				}
			}
			else {
				var names = name.split(' ');
				for (var n = 0, nl = names.length; n < nl; n++) {
					callbacks[names[n]] = callbacks[names[n]] || [];
					if (type(fn) === 'undefined') {
						callbacks[names[n]].length = 0;
					}
					else {
						var index = callbackIndex(names[n], fn);
						if (index !== -1) {
							callbacks[names[n]].splice(index, 1);
						}
					}
				}
			}
		};

		/**
		 * Returns callback array index.
		 *
		 * @param  {String}   name Event name.
		 * @param  {Function} fn   Function
		 *
		 * @return {Int} Callback array index, or -1 if isn't registered.
		 */
		function callbackIndex(name, fn) {
			for (var i = 0, l = callbacks[name].length; i < l; i++) {
				if (callbacks[name][i] === fn) {
					return i;
				}
			}
			return -1;
		}

		/**
		 * Reset next cycle timeout.
		 *
		 * @return {Void}
		 */
		function resetCycle() {
			if (dragging.released && !self.isPaused) {
				self.resume();
			}
		}

		/**
		 * Calculate SLIDEELEMENT representation of handle position.
		 *
		 * @param  {Int} handlePos
		 *
		 * @return {Int}
		 */
		function handleToSlideElement(handlePos) {
			return Math.round(within(handlePos, hPos.start, hPos.end) / hPos.end * (pos.end - pos.start)) + pos.start;
		}

		/**
		 * Keeps track of a dragging delta history.
		 *
		 * @return {Void}
		 */
		function draggingHistoryTick() {
			// Looking at this, I know what you're thinking :) But as we need only 4 history states, doing it this way
			// as opposed to a proper loop is ~25 bytes smaller (when minified with GCC), a lot faster, and doesn't
			// generate garbage. The loop version would create 2 new variables on every tick. Unexaptable!
			dragging.history[0] = dragging.history[1];
			dragging.history[1] = dragging.history[2];
			dragging.history[2] = dragging.history[3];
			dragging.history[3] = dragging.delta;
		}

		/**
		 * Initialize continuous movement.
		 *
		 * @return {Void}
		 */
		function continuousInit(source) {
			dragging.released = 0;
			dragging.source = source;
			dragging.slideElement = source === 'slideElement';
		}

		/**
		 * Dragging initiator.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function dragInit(event) {
			// Ignore when already in progress
			if (dragging.init || mediaEnabled || isInteractive(event.target)) {
				return;
			}

			var isTouch = event.type === 'touchstart',
				source = event.data.source,
				isSlideElement = source === 'slideElement';

			// Handle dragging conditions
			if (source === 'handle' && (!o.scrollBar.dragHandle || hPos.start === hPos.end)) {
				return;
			}

			// slideElement dragging conditions
			if (isSlideElement && !(isTouch ? o.dragging.touchDragging : o.dragging.mouseDragging && event.which < 2)) {
				return;
			}

			if (!isTouch) {
				stopDefault(event, 1);
			}

			// Reset dragging object
			continuousInit(source);

			// Properties used in dragHandler
			dragging.init = 1;
			dragging.$source = $(event.target);
			dragging.touch = isTouch;
			dragging.pointer = isTouch ? event.originalEvent.touches[0] : event;
			dragging.initX = dragging.pointer.pageX;
			dragging.initY = dragging.pointer.pageY;
			dragging.initPos = isSlideElement ? pos.current : hPos.current;
			dragging.initPage = rel.activePage;
			dragging.start = performance.now();
			dragging.time = 0;
			dragging.path = 0;
			dragging.delta = 0;
			dragging.locked = 0;
			dragging.history = [0, 0, 0, 0];
			dragging.pathToLock = isSlideElement ? isTouch ? $win.width() / window.outerWidth * 10 : 10 : 0;
			dragging.initLoc = dragging[o.navigation.horizontal ? 'initX' : 'initY'];
			dragging.deltaMin = isSlideElement ? -dragging.initLoc : -hPos.current;
			dragging.deltaMax = isSlideElement ? document[o.navigation.horizontal ? 'width' : 'height'] - dragging.initLoc : hPos.end - hPos.current;

			// Bind dragging events
			$doc.on(isTouch ? dragTouchEvents : dragMouseEvents, dragHandler);

			// Pause ongoing cycle
			self.pause(1);

			// Add dragging class
			(isSlideElement ? $slideElement : $handle).addClass(o.classes.draggedClass);

			// Trigger :moveStart event
			trigger('moveStart');

			// Keep track of a dragging path history. This is later used in the
			// dragging release swing calculation when dragging slideElement.
			if (isSlideElement) {
				historyID = setInterval(draggingHistoryTick, 10);
			}
		}

		/**
		 * Handler for dragging scrollbar handle or SLIDEELEMENT.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function dragHandler(event) {
			dragging.released = event.type === 'mouseup' || event.type === 'touchend';
			dragging.pointer = dragging.touch ? event.originalEvent[dragging.released ? 'changedTouches' : 'touches'][0] : event;
			dragging.pathX = dragging.pointer.pageX - dragging.initX;
			dragging.pathY = dragging.pointer.pageY - dragging.initY;
			dragging.path = Math.sqrt(Math.pow(dragging.pathX, 2) + Math.pow(dragging.pathY, 2));
			dragging.delta = within(o.navigation.horizontal ? dragging.pathX : dragging.pathY, dragging.deltaMin, dragging.deltaMax);

			if (!dragging.locked && dragging.path > dragging.pathToLock) {
				dragging.locked = 1;
				if (o.navigation.horizontal ? Math.abs(dragging.pathX) < Math.abs(dragging.pathY) : Math.abs(dragging.pathX) > Math.abs(dragging.pathY)) {
					// If path has reached the pathToLock distance, but in a wrong direction, cancel dragging
					dragging.released = 1;
				} else if (dragging.slideElement) {
					// Disable click on a source element, as it is unwelcome when dragging SLIDEELEMENT
					dragging.$source.on(clickEvent, disableOneEvent);
				}
			}

			// Cancel dragging on release
			if (dragging.released) {
				if (!dragging.touch) {
					stopDefault(event);
				}

				dragEnd();

				// Adjust path with a swing on mouse release
				if (o.dragging.releaseSwing && dragging.slideElement) {
					dragging.swing = (dragging.delta - dragging.history[0]) * o.dragging.swingSync;
					dragging.delta += dragging.swing;
					dragging.tweese = Math.abs(dragging.swing) > 10;
				}
			} else if (dragging.locked || !dragging.touch) {
				stopDefault(event);
			}

			slideTo(dragging.slideElement ? (dragging.tweese && o.dragging.onePage ? pages[within(dragging.delta < 0 ? dragging.initPage + 1 : dragging.initPage - 1, 0, pages.length - 1)] : Math.round(dragging.initPos - dragging.delta)) : handleToSlideElement(dragging.initPos + dragging.delta));
		}

		/**
		 * Stops dragging and cleans up after it.
		 *
		 * @return {Void}
		 */
		function dragEnd() {
			clearInterval(historyID);
			$doc.off(dragging.touch ? dragTouchEvents : dragMouseEvents, dragHandler);
			(dragging.slideElement ? $slideElement : $handle).removeClass(o.classes.draggedClass);

			// Make sure that disableOneEvent is not active in next tick.
			setTimeout(function () {
				dragging.$source.off(clickEvent, disableOneEvent);
			});

			// Resume ongoing cycle
			self.resume(1);

			// Normally, this is triggered in render(), but if there
			// is nothing to render, we have to do it manually here.
			if (pos.current === pos.destination && dragging.init) {
				trigger('moveEnd');
			}

			dragging.init = 0;
		}

		/**
		 * Check whether element is interactive.
		 *
		 * @return {Boolean}
		 */
		function isInteractive(element) {
			return ~$.inArray(element.nodeName, interactiveElements) || $(element).is(o.dragging.interactive);
		}

		/**
		 * Continuous movement cleanup on mouseup.
		 *
		 * @return {Void}
		 */
		function movementReleaseHandler() {
			self.stop();
			$doc.off('mouseup.' + namespace, movementReleaseHandler);
		}

		/**
		 * Buttons navigation handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function buttonsHandler(event) {
			stopDefault(event);

			switch (this) {
				case $forwardButton[0]:
				case $backwardButton[0]:
					self.moveBy($forwardButton.is(this) ? o.moveBy : -o.moveBy);
					$doc.on('mouseup.' + namespace, movementReleaseHandler);
					break;

				case $prevButton[0]:
					self.prev();
					break;

				case $nextButton[0]:
					self.next();
					break;

				case $prevPageButton[0]:
					self.prevPage();
					break;

				case $nextPageButton[0]:
					self.nextPage();
					break;

				case $fullScreenButton[0]:
					self.toggleFullScreen();
					break;
			}
		}

		/**
		 * Mouse wheel delta normalization.
		 *
		 * @param  {Event} event
		 *
		 * @return {Int}
		 */
		function normalizeWheelDelta(event) {
			// event.deltaY needed only for compatibility with jQuery mousewheel plugin in FF & IE
			scrolling.curDelta = event.wheelDelta ? -event.wheelDelta / 120 : (event.detail || event.deltaY) / 3;
			if (!navigationType) {
				return scrolling.curDelta;
			}
			time = performance.now();
			if (scrolling.last < time - scrolling.resetTime) {
				scrolling.delta = 0;
			}
			scrolling.last = time;
			scrolling.delta += scrolling.curDelta;
			if (Math.abs(scrolling.delta) < 1) {
				scrolling.finalDelta = 0;
			} else {
				scrolling.finalDelta = Math.round(scrolling.delta / 1);
				scrolling.delta %= 1;
			}
			return scrolling.finalDelta;
		}

		/**
		 * Mouse scrolling handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function scrollHandler(event) {
			// Ignore if there is no scrolling to be done
			if (!o.scrolling.scrollBy || pos.start === pos.end) {
				return;
			}
			stopDefault(event, 1);
			self.slideBy(o.scrolling.scrollBy * normalizeWheelDelta(event.originalEvent));
		}

		/**
		 * Scrollbar click handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function scrollbarHandler(event) {
			// Only clicks on scroll bar. Ignore the handle.
			if (o.scrollBar.clickBar && event.target === $scrollbar[0]) {
				stopDefault(event);
				// Calculate new handle position and sync SLIDEELEMENT to it
				slideTo(handleToSlideElement((o.navigation.horizontal ? event.pageX - $scrollbar.offset().left : event.pageY - $scrollbar.offset().top) - handleSize / 2));
			}
		}

		/**
		 * Keyboard input handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function keyboardHandler(event) {
			if (!o.navigation.keyboardNavBy) {
				return;
			}

			switch (event.which) {
				// Left or Up
				case o.navigation.horizontal ? 37 : 38:
					stopDefault(event);
					self[o.navigation.keyboardNavBy === 'pages' ? 'prevPage' : 'prev']();
					break;

				// Right or Down
				case o.navigation.horizontal ? 39 : 40:
					stopDefault(event);
					self[o.navigation.keyboardNavBy === 'pages' ? 'nextPage' : 'next']();
					break;
			}
		}

		/**
		 * Slides icons click handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function iconsHandler(event) {
			var $this = $(this);

			if ($this.hasClass(minnamespace + 'Close')) {
				// Remove media content
				removeContent();
			}
			else {
				// Insert media content
				insertContent($this.parent()[0]);
			}

			return false;
		}

		/**
		 * Window resize handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function winResizeHandler() {
			if (resizeID) {
				resizeID = clearTimeout(resizeID);
			}

			// Trigger :beforeResize event
			trigger('beforeResize');

			resizeID = setTimeout(function () {
				self.reload(true);

				if (thumbnailNav) {
					thumbnailNav.reload(true);
				}

				if (typeof window.orientation !== 'undefined') {
					orientation = window.orientation;
				}
				else {
					orientation = $win.height() > $win.width() ? 0 : 90;
				}

				// Trigger :resize event
				trigger('resize');
				resizeID = clearTimeout(resizeID);
			}, 100);
		}

		/**
		 * Page visibility change handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function visibilityChangeHandler() {
			var index = rel.activeSlide,
				hasCaption = items[index].captions.length > 0;

			// Check for: is visibility state hidden?
			var isHidden = visibilityHidden();

			if (isHidden) {
				// Pause cycling
				if (cycleID) {
					cycleID = cancelAnimationFrame(cycleID);
				}

				if (hasCaption) {
					// Reset cycling progress time elapsed
					self.progressElapsed = 0;

					// Clear caption history
					clearCaptions(index);
					// Clear captions styles and classes by triggering :moveEnd event
					trigger('moveEnd');
				}
			}
			else {
				// Reset cycling
				if (o.cycling.loop || !o.cycling.loop && index !== items.length - 1) {
					resetCycle();
				}

				if (hasCaption) {
					// Render captions with 10 microseconds delay
					setTimeout(function(){
						renderCaptions(index);
					}, 10);
				}
			}
		}

		/**
		 * Window fullscreen change handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function winfullScreenHandler() {
			if (!fullScreenApi.isFullScreen()) {
				self.exitFullScreen();
			}
		}

		/**
		 * Click on slide activation handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function activateHandler(event) {
			/*jshint validthis:true */
			// Ignore clicks on interactive elements.
			if (isInteractive(this)) {
				event.stopPropagation();
				return;
			}

			// Accept only events from direct slideElement children.
			if (this.parentNode === $slideElement[0]) {
				self.activate(this);
			}
		}

		/**
		 * Click on page button handler.
		 *
		 * @param {Event} event
		 *
		 * @return {Void}
		 */
		function activatePageHandler() {
			/*jshint validthis:true */
			// Accept only events from direct pages bar children.
			if (this.parentNode === $pagesBar[0]) {
				self.activatePage($pages.index(this));
			}
		}

		/**
		 * Pause on hover handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function pauseOnHoverHandler(event) {
			if (o.cycling.pauseOnHover) {
				self[event.type === 'mouseenter' ? 'pause' : 'resume'](2);
			}
		}

		/**
		 * Trigger callbacks for event.
		 *
		 * @param  {String} name Event name.
		 * @param  {Mixed}  argX Arguments passed to callbacks.
		 *
		 * @return {Void}
		 */
		function trigger(name, arg1) {
			if (callbacks[name]) {
				l = callbacks[name].length;
				// Callbacks will be stored and executed from a temporary array to not
				// break the execution queue when one of the callbacks unbinds itself.
				tmpArray.length = 0;
				for (i = 0; i < l; i++) {
					tmpArray.push(callbacks[name][i]);
				}
				// Execute the callbacks
				for (i = 0; i < l; i++) {
					tmpArray[i].call(self, name, arg1);
				}
			}
		}

		/**
		 * Get slide size in pixels.
		 *
		 * @param {Object}   $slide    jQuery object with element.
		 * @param {Mixed}    property
		 *
		 * @return {Int}
		 */
		function getSlideSize($slide, property) {
			return parseInt(property ?
					property.indexOf('%') !== -1 ? percentToValue(property.replace('%', ''), frameSize) : property :
					$slide[o.navigation.horizontal ? 'outerWidth' : 'outerHeight']());
		}

		/**
		 * Load slide contents.
		 *
		 * @param  {Mixed} slide       Slide DOM element, or index starting at 0.
		 *
		 * @return {Void}
		 */
		function loadSlide(slide) {
			var index = getIndex(slide),
				slideData = items[index],
				element = slideData.element,
				slideLoaded = element.hasAttribute(minnamespace + 'slideloaded');

			// Trigger :beforeSlideLoad event
			trigger('beforeSlideLoad', index);

			// If slide loaded before then prevent pre-loading and trigger :slideLoaded
			if (slideLoaded) {
				// Trigger :slideLoaded event
				trigger('slideLoaded', index);

				return false;
			}

			var $slide = $(element),
			loaderFunc = function() {
				// Find all images urls in element and its children
				var images = findAllImages(element),
					len = images.length;

				// If slide has no images for pre-load then prevent pre-loading and trigger :slideLoaded
				if (len <= 0) {
					// set slideLoaded to the slide to remember that this slide has been preloaded before
					element.setAttribute(minnamespace + 'slideloaded', '1');

					// Trigger :slideLoaded event
					trigger('slideLoaded', index);

					return false;
				}

				// Show loader
				var loader = showLoader($slide);

				preloadimages(images).done(function() {
					// Hide loader
					hideLoader(loader);

					// set slideLoaded to the slide to remember that this slide has been preloaded before
					element.setAttribute(minnamespace + 'slideloaded', '1');

					loaderFunc = loader = images = null;

					// Trigger :slideLoaded event
					trigger('slideLoaded', index);
				});
			};

			if (slideData.hasCaptionMediaEnabled) {
				// Find media inserted captions
				var mediaCaptions = slideData.captions.filter(function (e, i, arr) {
					return (e.options.cover || e.options.video || e.options.source);
				}),
				inserted = mediaCaptions.length;

				for (var i = 0, len = mediaCaptions.length, caption, captionElement, $layerContainer, cover, icon, coverURL, isVideo, parsed; i < len; i++) {
					caption = mediaCaptions[i],
					captionElement = caption.element,
					$layerContainer = $('<div class="' + minnamespace + 'LayerContainer"></div>'),
					cover = caption.options.cover,

					// Detect caption icon
					icon = caption.type,

					// Set layer cover image URL
					coverURL = cover || parsePhotoURL(caption.options.video) && caption.options.video,
					isVideo = $.isPlainObject(coverURL) || getTypeByExtension(coverURL) == 'video',
					parsed = parsePhotoURL(coverURL);
						
					$layerContainer.prependTo(captionElement);

					// If cover needed to be parsed
					if (parsed) {
						// Show loader
						var loader = showLoader($slide);

						// Parse OEmbed URL via AJAX
						doAjax(parsed.oembed, function (data) {
							// Hide loader
							hideLoader(loader);

							if (data) {
								// Set cover URL
								coverURL = data[parsed.inJSON];

								// If replace is needed
								if (parsed.replace) {
									coverURL = coverURL.replace(parsed.replace.from, parsed.replace.to);
								}

								// Set cover image
								setCover({
									cover: coverURL,
									slideEl: $slide,
									insertEl: $layerContainer,
									callback: function() {
										inserted--;

										if (inserted <= len) {
											loaderFunc();
										}
									}
								});
							}
						});
					}
					else {
						// Set cover image
						setCover({
							cover: coverURL,
							isVideo: isVideo,
							slideEl: $slide,
							insertEl: $layerContainer,
							callback: function() {
								inserted--;

								if (inserted <= len) {
									loaderFunc();
								}
							}
						});
					}

					// Set layer icon if slide type is not image
					if (icon !== 'image') {
						var $icon = createSlideIcon($layerContainer, icon);

						// Layer icon click event
						if (icon !== 'link') {
							$icon.bind(clickEvent, iconsHandler);
						}
					}
				}
			}
			else {
				loaderFunc();
			}
		}

		/**
		 * Get slides between a rane.
		 *
		 * @param {Number}   start
		 * @param {Number}   end
		 *
		 * @return {Array}
		 */
		function slidesInRange(start, end) {
			var slides = [];

			for (var i = 0, len = items.length, slide, slideStart, slideEnd; i < len; i++) {
				slide = items[i],
				slideStart = slide.start,
				slideEnd = slideStart + slide.size;

				if ((slideStart >= start && slideEnd <= end) || (slideEnd >= start && slideStart <= start) || (slideStart <= end && slideEnd >= end)) {
					slides.push(slide);
				}
			}
			
			return slides;
		}

		/**
		 * Insert cover image.
		 *
		 * @param {Object}   obj
		 *
		 * @return {Void}
		 */
		function setCover(obj) {
			// Remove last inserted cover
			$('> .' + minnamespace + 'Cover, > .' + minnamespace + 'LayerCover', obj.insertEl).remove();

			if (!obj.cover) {
				return false;
			}

			if ($.isPlainObject(obj.cover) && obj.cover.poster && isTouch) {
				obj.isVideo = 0,
				obj.cover = obj.cover.poster;
			}
			
			if (obj.isVideo && !isTouch) {
				// Show loader
				var loader = showLoader(obj.slideEl);

				// Trigger :beforeCoverLoad event
				if (obj.slide) {
					trigger('beforeCoverLoad', obj.index);
				}

				var innerTags = [];

				if ($.isPlainObject(obj.cover)) {
					// delete poster property from cover object for inner tags
					if (obj.cover.poster) {
						obj.cover.poster = null;
					}

					$.each(obj.cover, function(key, value) {
						// Set sources to the video element
						innerTags.push({
							name: 'source',
							type: videoTypes[key],
							src: value
						});
					});
				}
				else {
					var videoURL = obj.cover,
						extension = pathinfo(videoURL, 'EXTENSION');

					// Normalize extension
					extension = ($.isPlainObject(extension)) ? null : extension.toLowerCase();

					innerTags = [
						{
							name: 'source',
							type: videoTypes[extension],
							src: videoURL
						}
					];
				}

				// Generate video element and cover holder
				var $videoEl = $(createElement('video', { autoplay: 'autoplay', muted: 'muted', loop: 'loop', controls: false }, innerTags)).addClass(minnamespace + 'CoverImage').hide(),
					$cover = $('<div class="' + minnamespace + 'Cover"></div>').append($videoEl);

				// Insert the cover into slide
				obj.insertEl.prepend($cover);

				// Trigger :coverInserted event
				trigger('coverInserted', $cover[0]);
				
				$videoEl.one('loadedmetadata', function() {
					var videoEl = $videoEl[0];

					// Store cover natural width and height
					$videoEl.show().data({ naturalWidth: videoEl.videoWidth, naturalHeight: videoEl.videoHeight });

					// Reposition slides covers
					repositionCovers(obj.slide);

					// Hide loader
					hideLoader(loader);

					// Trigger :coverLoaded event
					trigger('coverLoaded', obj.index);
				});
			}
			else {
				// Show loader
				var loader = showLoader(obj.slideEl);

				// Trigger :beforeCoverLoad event
				if (obj.slide) {
					trigger('beforeCoverLoad', obj.index);
				}

				// Preload the cover
				preloadimages(obj.cover).done(function(img) {
					// Trigger :coverLoaded event
					if (obj.slide) {
						trigger('coverLoaded', obj.index);
					}

					var $cover = $('<div class="' + (minnamespace + ((obj.slide) ? 'Cover' : 'LayerCover')) + '"><img src="' + obj.cover + '" class="' + (minnamespace + ((obj.slide) ? 'CoverImage' : 'LayerCoverImage')) + '" ondragstart="return false" /></div>'),
					$image = $('img', $cover);

					// Hide loader
					hideLoader(loader);

					// Store cover natural width and height
					$image.data({ naturalWidth: img[0].width, naturalHeight: img[0].height });

					// Insert the cover into slide
					obj.insertEl.prepend($cover);

					// Trigger callback
					if (obj.callback) {
						obj.callback.call(this, $image);
					}

					// Trigger :coverInserted event
					if (obj.slide) {
						trigger('coverInserted', $cover[0]);
					}

					// Reposition slides covers
					if (obj.slide) {
						repositionCovers(obj.slide);
					}
				});
			}
		}


		/**
		 * Set slides covers.
		 *
		 * @return {Void}
		 */
		function setSlidesCovers() {
			var start, end;

			switch (o.preloadMode) {
				// Select all slides
				case 'all':
					start = 0,
					end = slideElementSize;
					break;

				// Select nearby slides
				case 'nearby':
					start = within(pos.current - frameSize, pos.start, pos.end),
					end = within(pos.current + (frameSize * 2) - 5, pos.start, pos.end + (frameSize * 2));
					break;

				// Select instant slide
				case 'instant':
					start = within(pos.current + 5 , pos.start, pos.end),
					end = within(pos.current + frameSize - 5, pos.start, pos.end + frameSize);
					break;
			}

			var slides = slidesInRange(start, end);

			var eachHandler = function (slide, i) {
					if (slide.type === 'content') {
						return true;
					}

					var slideEl = slide.element,
						$slide = $(slideEl),
						processed = slideEl.hasAttribute(minnamespace + 'processed'),
						lastCover = slideEl.getAttribute(minnamespace + 'lastcover');

					if (processed && !resizeID) {
						return true;
					}

					var cover = slide.options.cover;

					// If the cover has rules then find right cover image
					if ($.isArray(cover)) {
						for (var i = 0, len = cover.length, element; i < len; i++) {
							element = cover[i];

							// if the rule matched
							if (element[1] && window.matchMedia(element[1]).matches) {
								cover = element[0];
								break;
							}
						}

						// If there is no cover image for rules then automatically
						if ($.isArray(cover)) {
							cover = cover[0][0];
						}
					}

					var coverURL = cover || parsePhotoURL(slide.options.video) && slide.options.video,
						isVideo = $.isPlainObject(coverURL) || getTypeByExtension(coverURL) == 'video',
						parsed = parsePhotoURL(coverURL),
						coverUN = $.isPlainObject(coverURL) ? rawurlencode(JSON.stringify(coverURL)) : coverURL;

					if (lastCover === coverUN) {
						return true;
					}

					// If cover needed to be parsed
					if (parsed) {
						// Show loader
						var loader = showLoader($slide);

						// Parse OEmbed URL via AJAX
						doAjax(parsed.oembed, function (data) {
							// Hide loader
							hideLoader(loader);

							if (data) {
								// Set cover URL
								coverURL = data[parsed.inJSON];

								// If replace is needed
								if (parsed.replace) {
									coverURL = coverURL.replace(parsed.replace.from, parsed.replace.to);
								}

								// Set cover image
								setCover({
									cover: coverURL,
									slide: slide,
									slideEl: $slide,
									insertEl: $slide,
									index: getIndex(slideEl)
								});
							}
						});
					}
					else {
						// Set cover image
						setCover({
							cover: coverURL,
							isVideo: isVideo,
							slide: slide,
							slideEl: $slide,
							insertEl: $slide,
							index: getIndex(slideEl)
						});
					}

					slideEl.setAttribute(minnamespace + 'processed', '1');
					slideEl.setAttribute(minnamespace + 'lastcover', coverUN);
				};

			slides.forEach(eachHandler);
		}

		/**
		 * Set slides icons.
		 *
		 * @return {Void}
		 */
		function setSlidesIcons() {
			for (var i = 0, len = items.length, slide, $slide, icon, $icon; i < len; i++) {
				slide = items[i];

				if (slide.type === 'content') {
					continue;
				}

				$slide = $(slide.element),
				icon = slide.options.icon || slide.type;

				if ($('.' + minnamespace + ucfirst(icon), $slide)[0]) {
					continue;
				}

				// Set slide icon if slide type is not content and image
				if (icon !== 'content' && icon !== 'image') {
					$icon = createSlideIcon($slide, icon);

					// Slides icons click event
					if (icon !== 'link') {
						$icon.bind(clickEvent, iconsHandler);
					}
				}
			}
		}

		/**
		 * Create slide icon.
		 *
		 * @param {Object}   $slide    jQuery object with element.
		 * @param {String}   icon
		 *
		 * @return {Object}    jQuery object with element.
		 */
		function createSlideIcon($slide, icon) {
			var iconName = minnamespace + ucfirst(icon);

			// Return blank if icon is exists
			if ($('.' + iconName, $slide).length) {
				return;
			}

			var $icon = $('<a class="' + minnamespace + 'Icon ' + iconName + '"></a>');

			if (icon === 'link') {
				var index = getIndex($slide),
					slide = items[index],
					href = slide.options.link.url && absolutizeURI(slide.options.link.url) || window.location.href,
					target = slide.options.link.target || null,
					attributes = $.extend(true, { 'href': href, 'target': target }, slide.options.link);

					if (attributes.url) {
						attributes.url = null;
					}

				$icon[$.fn.attr ? 'attr' : 'prop'](attributes);
			}

			// Append icon into $slide
			$slide.append($icon);

			return $icon;
		}

		/**
		 * Insert media content.
		 *
		 * @param {DOM}    element    Dom element.
		 *
		 * @return {Void}
		 */
		function insertContent(element) {
			var index = getIndex(element);

			// Remove previous media content
			if (mediaEnabled) {
				removeContent();
			}

			var $container = $(element);

			if (index !== -1) {
				// Reset and get slide data
				var object = items[index];
			}
			else {
				var $caption = $container.parent(),
					options = getInlineOptions($caption),
					object = {
						type: getSlideType(options),
						options: options
					};

				$caption.addClass(minnamespace + 'Media');
			}

			$container.children().hide();

			// Generate media content
			var mediaContent = generateContent({ type: object.type, options: object.options }),
				closeButton = $('<a class="' + minnamespace + 'Icon ' + minnamespace + 'Close"></a>');

			// Insert mediaContent and closeButton
			$container.prepend(mediaContent).prepend(closeButton);

			// Bind closeButton handler
			closeButton.bind(clickEvent, iconsHandler);

			if (index !== -1) {
				$parent.addClass(minnamespace + 'Media');

				// Clear captions
				clearCaptions(rel.activeSlide);
			}

			// Pause cycling
			self.pause(3);

			mediaEnabled = mediaContent;
		}

		/**
		 * Remove media content.
		 *
		 * @return {Void}
		 */
		function removeContent() {
			var $container = mediaEnabled.parent();

			// Remove media content from DOM
			mediaEnabled.remove();
			mediaEnabled = null;
			$('.' + minnamespace + 'Close', $container).unbind(clickEvent).remove();

			if ($container.hasClass(minnamespace + 'LayerContainer')) {
				$container.parent().removeClass(minnamespace + 'Media');
			}
			else {
				$parent.removeClass(minnamespace + 'Media');
			}

			// Show childs
			$container.children().show();

			// Reset cycling
			if (o.cycling.loop || !o.cycling.loop && index !== items.length - 1) {
				self.isPaused = 0;
				resetCycle();
			}

			// Render captions
			if (!captionID) {
				renderCaptions(rel.activeSlide);
			}
		}

		/**
		 * Generate slide media content.
		 *
		 * @param {Mixed}     obj      Slide object
		 *
		 * @return {Object}            jQuery DOM element
		 */
		function generateContent(obj) {
			// Get type
			var type = obj.type,
				options = obj.options,
				URL = options.mp4 || options.video || options.source,
				$content;

			// Trigger :beforeGenerateMedia event
			trigger('beforeGenerateMedia');

			switch (type) {
				case 'video':
					var extension = pathinfo(URL, 'EXTENSION'),
						videoFrame = options.videoFrame,
						mp4 = options.mp4,
						webm = options.webm,
						ogv = options.ogv,
						localVideo = mp4 || webm || ogv || 0,
						parsedVideo = parseVideoURL(URL);

					// Normalize extension
					extension = ($.isPlainObject(extension)) ? null : extension.toLowerCase();

					// Check video URL, is video file?
					if ((/^(avi|mov|mpg|mpeg|mp4|webm|ogv|3gp|m4v)$/i).test(extension) || videoFrame || mp4 || webm || ogv) {
						// Use videoFrame if available
						if (videoFrame || (localVideo && o.videoFrame)) {
							var source = videoFrame || o.videoFrame,
							mediaFiles = [];

							// Add MP4 Video to mediaFiles
							if (mp4) {
								mediaFiles.push({
									type: videoTypes['mp4'],
									src: absolutizeURI(mp4)
								});
							}

							// Add WebM Video to mediaFiles
							if (webm) {
								mediaFiles.push({
									type: videoTypes['webm'],
									src: absolutizeURI(webm)
								});
							}

							// Add OGV Video to mediaFiles
							if (ogv) {
								mediaFiles.push({
									type: videoTypes['ogv'],
									src: absolutizeURI(ogv)
								});
							}

							if (mediaFiles.length > 0) {
								source += (parse_url(source, 'QUERY') ? '&' : '?') + minnamespace.toLowerCase() + 'videos=' + rawurlencode(JSON.stringify(mediaFiles));

								// Set cover image to the video frame
								if (options.cover) {
									source += '&' + minnamespace.toLowerCase() + 'cover=' + rawurlencode(absolutizeURI(options.cover));
								}
							}

							$content = $(createElement('iframe', { src: source, scrolling: 'no' }));
						}

						// Check that HTML5 can play this type of video file
						else if (canPlayType(videoTypes[extension]) || (mp4 && canPlayType(videoTypes['mp4'])) || (webm && canPlayType(videoTypes['webm'])) || (ogv && canPlayType(videoTypes['ogv']))) {
							var innerTags = [
								{
									name: 'source',
									type: mp4 && videoTypes['mp4'] || videoTypes[extension],
									src: URL
								}
							];

							// Add WebM Video to HTML5 video tag
							if (webm) {
								innerTags.push({
									name: 'source',
									type: videoTypes['webm'],
									src: webm
								});
							}

							// Add ogv Video to HTML5 video tag
							if (ogv) {
								innerTags.push({
									name: 'source',
									type: videoTypes['ogv'],
									src: ogv
								});
							}

							// Add HTML5 Video other inner tags
							if (options.HTML5Video) {
								$.each(options.HTML5Video, function(key, value) {
									innerTags.push($.extend({}, {
										name: key
									}, value));
								});
							}

							$content = $(createElement('video', {}, innerTags));
						}

						// Warn user that video is not supported
						else {
							throw "Video not supported!";
						}
					}
					// Check video URL, is video from social video sharing?
					else if (parsedVideo) {
						$content = $(createElement(parsedVideo.type, { src: parsedVideo.source, scrolling: 'no' }));
					}
					// Warn user that video is not supported
					else {
						throw "Video not supported!";
					}
					break;

				case 'iframe':
					$content = $(createElement('iframe', { src: URL }));
					break;

				case 'flash':
					$content = $(createElement('embed', { src: URL, flashvars: options.flashvars || null }));
					break;
			}

			// Trigger :mediaGenerated event
			trigger('mediaGenerated', $content[0]);

			return $content;
		}

		/**
		 * Reposition slides covers.
		 *
		 * @param {Object}     slide    Slide data object.
		 *
		 * @return {Void}
		 */
		function repositionCovers(slide) {
			var newSlides = (slide) ? [slide] : items;

			for (var i = 0, len = newSlides.length, slide, $slide, $cover, viewport, coverData, slideWidth, slideHeight, width, height, marginLeft, marginTop, newDimensions; i < len; i++) {
				slide = newSlides[i];

				if (slide.type === 'content') {
					continue;
				}

				$slide = $(slide.element),
				$cover = $('.' + minnamespace + 'CoverImage', $slide);

				if (!$cover[0]) {
					continue;
				}

				viewport = (slide.options.viewport || o.viewport).toLowerCase(),
				coverData = $cover.data(),
				slideWidth = $slide.width(),
				slideHeight = $slide.height(),
				width = slideWidth,
				height = slideHeight,
				marginLeft = 0,
				marginTop = 0;

				if (viewport === 'fit') {
					newDimensions = calculateDimensions(width, height, coverData.naturalWidth, coverData.naturalHeight);

					width = newDimensions.width,
					height = newDimensions.height;
				}
				else if (viewport === 'fill') {
					height = (width / coverData.naturalWidth) * coverData.naturalHeight;

					if (height < slideHeight) {
						width = (slideHeight / coverData.naturalHeight) * coverData.naturalWidth,
						height = slideHeight;
					}
				}
				else if (viewport === 'center') {
					newDimensions = calculateDimensions(width, height, coverData.naturalWidth, coverData.naturalHeight, 1);

					width = coverData.naturalWidth,
					height = coverData.naturalHeight;
				}

				marginTop = ((slideHeight > height) ? slideHeight - height : -(height - slideHeight)) / 2,
				marginLeft = ((slideWidth > width) ? slideWidth - width : -(width - slideWidth)) / 2;
				
				$cover.css({ width: width, height: height, marginTop: marginTop, marginLeft: marginLeft });
			}
		}

		/**
		 * Resize frame equal to slide size.
		 *
		 * @param  {Mixed}   slide        Slide DOM element, or index starting at 0.
		 * @param  {Bool}    immediate    Resize immediately without an animation.
		 *
		 * @return {Void}
		 */
		function resizeFrame(slide, immediate) {
			var index = getIndex(slide),
			slideSize = $(items[index].element)[o.navigation.horizontal ? 'outerHeight' : 'outerWidth'](),
			properties = {};

			properties[o.navigation.horizontal ? 'height' : 'width'] = slideSize;

			$frame.stop().animate(properties, immediate ? 0 : o.speed, o.easing);
		}

		/**
		 * Normalize slider global elements.
		 *
		 * @return {Void}
		 */
		function normalizeElements() {
			// Normalizing $thumbnailsBar if thumbnails available in commands options but thumbnails bar DOM element is not available
			if (o.commands.thumbnails && !$thumbnailsBar[0]) {
				// Create $thumbnailsBar DOM element
				$thumbnailsBar = $('<ul></ul>');

				// Append thumbnails into $parent
				$parent.append($('<div class="' + minnamespace + 'Thumbnails"></div>').html($thumbnailsBar));
			}

			// Normalizing $pagesBar if pages available in commands options but pages bar DOM element is not available
			if (o.commands.pages && !$pagesBar[0]) {
				// Create $pagesBar DOM element
				$pagesBar = $('<ul class="' + minnamespace + 'Pages"></ul>');

				// Append pages into $parent
				$parent.append($pagesBar);
			}

			// Normalizing $nextPageButton if buttons available in commands options but $nextPageButton DOM element is not available
			if (o.commands.buttons && navigationType && !$nextPageButton[0]) {
				// Create $nextPageButton DOM element
				$nextPageButton = $('<a class="' + minnamespace + 'Buttons ' + minnamespace + 'Next"></a>');

				// Append $nextPageButton into $parent
				$parent.prepend($nextPageButton);
			}

			// Normalizing $prevPageButton if buttons available in commands options but $prevPageButton DOM element is not available
			if (o.commands.buttons && navigationType && !$prevPageButton[0]) {
				// Create $prevPageButton DOM element
				$prevPageButton = $('<a class="' + minnamespace + 'Buttons ' + minnamespace + 'Prev"></a>');

				// Append $prevPageButton into $parent
				$parent.prepend($prevPageButton);
			}

			// Normalizing $forwardButton if buttons available in commands options but $forwardButton DOM element is not available
			if (o.commands.buttons && !navigationType && !$forwardButton[0]) {
				// Create $forwardButton DOM element
				$forwardButton = $('<a class="' + minnamespace + 'Buttons ' + minnamespace + 'Next"></a>');

				// Append $forwardButton into $parent
				$parent.prepend($forwardButton);
			}

			// Normalizing $backwardButton if buttons available in commands options but $backwardButton DOM element is not available
			if (o.commands.buttons && !navigationType && !$backwardButton[0]) {
				// Create $backwardButton DOM element
				$backwardButton = $('<a class="' + minnamespace + 'Buttons ' + minnamespace + 'Prev"></a>');

				// Append $backwardButton into $parent
				$parent.prepend($backwardButton);
			}
		}

		/**
		 * Render captions.
		 *
		 * @param {Object}     slide       Slide DOM element, or index starting at 0.
		 *
		 * @return {Void}
		 */
		function renderCaptions(slide) {
			var index = getIndex(slide),
				slide = items[index],
				captions = slide.captions;

			// Prevent if last slides captions not cleared
			if (captionHistory.length > 0) {
				return false;
			}

			for (var i = 0, len = captions.length, caption, $caption, captionData, css; i < len; i++) {
				caption = captions[i],
				$caption = $(caption.element),
				captionData = $caption.data(minnamespace + 'styles');

				// Add animation frames to captionHistory
				captionHistory[i] = {
					frames: caption.animation.length,
					timeOut: null
				};

				// Show caption & set necessary caption styles
				css = { 'position': 'absolute' };
				$caption.show().addClass(o.classes.showedLayersClass).css(css);

				if (!captionData) {
					captionData = getCaptionStyles($caption);
					$caption.data(minnamespace + 'styles', captionData);
				}

				// Set necessary caption styles
				if (o.autoScale) {
					css = $.extend({}, css, normalizeStyles(captionData, captionResponsiveStyles, frameRatio));
					$caption.css(css);
				}

				// Animate the caption
				animateCaption($caption, i);
			}
		}

		/**
		 * Clear captions.
		 *
		 * @param {Mixed} slide       Slide DOM element, or index starting at 0.
		 *
		 * @return {Void}
		 */
		function clearCaptions(slide) {
			var index = getIndex(slide);

			if (items[index] && items[index].captions.length) {
				var $captions = $slides.eq(index).find('.' +  minnamespace + 'Caption');

				$captions.msStop(true);

				self.one('moveEnd', function() {
					$captions.removeAttr('style').removeClass(o.classes.showedLayersClass);
				});

				// Clear captionHistory timeout`s
				for (var i = 0, len = captionHistory.length; i < len; i++) {
					clearTimeout(captionHistory[i].timeOut);
				}

				// Reset captions animation history
				captionHistory = [];
			}
		}

		/**
		 * Animate caption.
		 *
		 * @param {Object}     $caption
		 * @param {Number}     i
		 * @param {Boolean}    repeated
		 *
		 * @return {Void}
		 */
		function animateCaption($caption, i, repeated) {
			var slide = items[rel.activeSlide],
				caption = slide.captions[i],
				options = caption.options,
				startAt = repeated && options.startAtOnRepeat || 0;

			if(startAt && caption.animation.length === captionHistory[i].frames) {
				captionHistory[i].frames = caption.animation.length - startAt;
			}
				
			var animationFrame = caption.animation.length - captionHistory[i].frames,
				animation = caption.animation[animationFrame] || {},
				style = animation.style && $.extend({}, animation.style, normalizeStyles(animation.style, captionResponsiveStyles, frameRatio)) || {};

			captionHistory[i].timeOut = setTimeout(function () {
				$caption.msStop().msAnimate(style, animation.speed || 0, animation.easing || 'swing', function () {
					captionHistory[i].frames--;

					if (captionHistory[i].frames > 0 || options.loop) {
						// Handle the loop
						if (options.loop && captionHistory[i].frames === 0) {
							captionHistory[i].frames = caption.animation.length;

							repeated = 1;
						}

						// Animate the caption
						animateCaption($caption, i, repeated);
					}
				});
			}, (repeated && options.dontDelayOnRepeat && animationFrame === startAt) ? 0 : animation.delay || 0);
		}

		/**
		 * Handle parallax effect for captions
		 *
		 * @return {Void}
		 */
		function parallaxCaptions() {
			// Parallax options
			var parallaxOptions = o.parallax;

			parallax.originals = [];

			// Loop the parallax compatible captions
			for(var i = 0, len = parallax.parallaxCaptions.length; i < len; i++) {
				var caption = parallax.parallaxCaptions[i],
					captionEl = caption.element,
					// Parallax effect level
					level = caption.options.parallaxLevel,
					// Alowed parallax effect axises
					parallaxAxises = caption.options.parallaxAxises || parallaxOptions;

				// Normalize parallax original values
				parallax.originals[i] = {};

				// Calculate X parallax axis
				if (parallaxAxises.x) {
					parallax.originals[i].x = parseInt((parallaxOptions.invertX ? -parallax.X : parallax.X) / 100 * level);

					// Set style to caption element
					captionEl.style['marginLeft'] = parallax.originals[i].x + 'px';
				}

				// Calculate Y parallax axis
				if (parallaxAxises.y) {
					parallax.originals[i].y = parseInt((parallaxOptions.invertY ? -parallax.Y : parallax.Y) / 100 * level);

					// Set style to caption element
					captionEl.style['marginTop'] = parallax.originals[i].y + 'px';
				}

				// Calculate Z parallax axis
				if (parallaxAxises.z && gpuAcceleration) {
					parallax.originals[i].x = parseInt((parallaxOptions.invertX ? -parallax.X : parallax.X) / 100 * level),
					parallax.originals[i].y = parseInt((parallaxOptions.invertY ? -parallax.Y : parallax.Y) / 100 * level),
					parallax.originals[i].rX = -parallax.originals[i].y / 2 % 180,
					parallax.originals[i].rY = parallax.originals[i].x / 2 % 180;

					// Set style to caption element
					captionEl.style[transform] = 'rotateX(' + parallax.originals[i].rX + 'deg) rotateY(' + parallax.originals[i].rY + 'deg)';
				}
			}
		}

		/**
		 * Revert parallax effect for captions
		 *
		 * @return {Void}
		 */
		function revertParallax() {
			var timeOut = o.parallax.revertDuration;

			var progress, time, delta, caption, captionEl, parallaxAxises, x, y, rX, rY,
				moveCaptions = function (timestamp) {
					if(!captionParallax.start) captionParallax.start = captionParallax.lastTime = timestamp;
					captionParallax.now = timestamp;

					progress = captionParallax.now - captionParallax.start,
					time = Math.min(timestamp - captionParallax.start, timeOut),
					delta = progress - (captionParallax.now - captionParallax.lastTime);

					// Loop the parallax compatible captions
					for(var i = 0, len = parallax.parallaxCaptions.length; i < len; i++) {
						caption = parallax.parallaxCaptions[i],
						captionEl = caption.element,
						// Alowed parallax effect axises
						parallaxAxises = caption.options.parallaxAxises || o.parallax;

						// Calculate X parallax axis to original value
						if (parallaxAxises.x) {
							x = (parallax.originals[i].x - (parallax.originals[i].x / timeOut) * delta);

							// Set style to caption element
							captionEl.style['marginLeft'] = x + 'px';
						}

						// Calculate Y parallax axis to original value
						if (parallaxAxises.y) {
							y = (parallax.originals[i].y - (parallax.originals[i].y / timeOut) * delta);

							// Set style to caption element
							captionEl.style['marginTop'] = y + 'px';
						}

						// Calculate Z parallax axis
						if (parallaxAxises.z && gpuAcceleration) {
							rX = parallax.originals[i].rX - ((parallax.originals[i].rX / timeOut) * delta),
							rY = parallax.originals[i].rY - ((parallax.originals[i].rY / timeOut) * delta);

							// Set style to caption element
							captionEl.style[transform] = 'rotateX(' + rX + 'deg) rotateY(' + rY + 'deg)';
						}
					}

					// Remember last animation frame time
					captionParallax.lastTime = captionParallax.now;

					// Loop the timer until the time has finished
					if (progress < timeOut) {
						// Run next animation frame
						captionParallaxID = requestAnimationFrame(moveCaptions);
					}
					else {
						// Normalize caption parallax animation object
						captionParallax = {};
					}
				};

			// Run first animation frame
			captionParallaxID = requestAnimationFrame(moveCaptions);
		}

		/**
		 * Change Hashtag.
		 *
		 * @param {Number}  index
		 *
		 * @return {Void}
		 */
		function changeHashtag(index) {
			var slide = items[index];

			hashLock = 1;
			window.location.hash = o.deeplinking.linkID.toLowerCase() + o.deeplinking.separator + slide.ID.toLowerCase();
			hashLock = 0;
		}

		/**
		 * Get slide by ID.
		 *
		 * @param {String}     ID
		 *
		 * @return {Void}
		 */
		function getSlideById(ID) {
			var index = 0;

			for (var i = 0, len = items.length; i < len; i++) {
				if (ID == items[i].ID) {
					index = i;
				}
			}

			return index;
		}

		/**
		 * Handle Hashtag.
		 *
		 * @param {Event}     event
		 *
		 * @return {Void}
		 */
		function hashtagHandler(event) {
			var hash = window.location.hash.replace("#", ""),
				split = hash.toLowerCase().split(o.deeplinking.separator);

			if (hashLock) {
				return;
			}

			if (event) {
				hashLock = 1;
			}

			if (split[0] === o.deeplinking.linkID.toLowerCase()) {
				var index = getSlideById(split[1]);
				if (self.initialized) {
					self.activate(index);
				}
				else {
					o.startRandom = 0;
					o.startAt = index;
				}
			}
			else if (event && hash.length === 0) {
				self.activate(o.startAt);
			}

			if (event) {
				hashLock = 0;
			}
		}

		/**
		 * Destroys instance and everything it created.
		 *
		 * @return {Void}
		 */
		self.destroy = function () {
			// Unbind all events
			var $unbinds = $scrollSource
				.add($handle)
				.add($scrollbar)
				.add($pagesBar)
				.add($forwardButton)
				.add($backwardButton)
				.add($prevButton)
				.add($nextButton)
				.add($prevPageButton)
				.add($nextPageButton)
				.add($fullScreenButton)
				.add($('.' + minnamespace + 'Icon', $frame));

			$unbinds.unbind('.' + namespace);

			$doc.add($win).unbind('.' + uniqId);

			// Remove classes
			$prevButton
				.add($nextButton)
				.add($prevPageButton)
				.add($nextPageButton)
				.removeClass(o.classes.disabledClass);

			if ($slides[0]) {
				$slides.removeAttr('style').removeClass(minnamespace + 'Slide').eq(rel.activeSlide).removeClass(o.classes.activeClass);

				// Remove slides covers and icons
				$('.' + minnamespace + 'Cover, .' + minnamespace + 'Icon', $slides).remove();
			}

			// Remove page slides
			if ($pagesBar[0]) {
				$pagesBar.empty();
			}

			// Remove thumbnails
			if ($thumbnailsBar[0]) {
				$thumbnailsBar.empty();
			}

			var removeEls = [];

			if (!o.buttons.forward && $forwardButton[0]) {
				removeEls.push($forwardButton[0]);
			}
			if (!o.buttons.backward && $backwardButton[0]) {
				removeEls.push($backwardButton[0]);
			}
			if (!o.buttons.prev && $prevButton[0]) {
				removeEls.push($prevButton[0]);
			}
			if (!o.buttons.next && $nextButton[0]) {
				removeEls.push($nextButton[0]);
			}
			if (!o.buttons.prevPage && $prevPageButton[0]) {
				removeEls.push($prevPageButton[0]);
			}
			if (!o.buttons.nextPage && $nextPageButton[0]) {
				removeEls.push($nextPageButton[0]);
			}
			if (!o.buttons.fullScreen && $fullScreenButton[0]) {
				removeEls.push($fullScreenButton[0]);
			}

			if (!o.pages.pagesBar && $pagesBar[0]) {
				removeEls.push($pagesBar[0]);
			}
			else if($pagesBar[0]) {
				$pagesBar.empty();
			}

			if (!o.thumbnails.thumbnailsBar && $thumbnailsBar[0]) {
				removeEls.push($thumbnailsBar[0]);
			}
			else if($thumbnailsBar[0]) {
				$thumbnailsBar.empty();
			}

			// Remove mightySlider created elements
			$(removeEls).remove();

			// Unbind events from frame
			$frame.unbind('.' + namespace);
			// Remove horizontal/vertical and mightySlider class
			$parent.removeClass(o.navigation.horizontal ? o.classes.horizontalClass : o.classes.verticalClass).removeClass(namespace);
			// Reset slideElement and handle positions
			$slideElement.add($handle).css(transform || (o.navigation.horizontal ? 'left' : 'top'), transform ? 'none' : 0).removeClass(minnamespace + 'SlideElement ' + minnamespace + 'ScrollbarHandle');
			// Remove the instance from element data storage
			$.removeData(frame, namespace);
			// Remove the classes from FRAME and scrollbar elements
			$frame.add($scrollbar).removeClass(minnamespace + 'Frame ' + minnamespace + 'MouseDraggable ' + minnamespace + 'TouchDraggable ' + minnamespace + 'Scrollbar');

			// Clean up collections
			items.length = pages.length = 0;
			last = {};

			// Reset initialized status and return the instance
			self.initialized = 0;

			// Trigger :destroy event
			trigger('destroy');

			return self;
		};

		/**
		 * Initialize.
		 *
		 * @return {Object}
		 */
		self.init = function () {
			if (self.initialized) {
				return;
			}

			syncThumbnailsbar();

			// Register callbacks map
			self.on(callbackMap);

			// Set required styles to elements
			var $movables = $slideElement.add($handle);
			$frame.css('overflow', 'hidden').addClass(minnamespace + 'Frame');
			if (!transform && $frame.css('position') === 'static') {
				$frame.css('position', 'relative');
			}
			if (transform) {
				if (gpuAcceleration) {
					$movables.css(transform, gpuAcceleration);
				}
			}
			else {
				if ($scrollbar.css('position') === 'static') {
					$scrollbar.css('position', 'relative');
				}
				$movables.css({ position: 'absolute' });
			}

			if (o.dragging.mouseDragging && !isTouch) {
				$frame.addClass(minnamespace + 'MouseDraggable');
			}
			if (o.dragging.touchDragging && isTouch) {
				$frame.addClass(minnamespace + 'TouchDraggable');
			}

			$slideElement.addClass(minnamespace + 'SlideElement');
			$scrollbar.addClass(minnamespace + 'Scrollbar');
			$handle.addClass(minnamespace + 'ScrollbarHandle');

			// Normalize slider global elements
			normalizeElements();

			// Load
			load();

			// Activate thumbnail for requested position
			if (thumbnailNav) {
				self.on('active', function(name, index) {
					thumbnailNav.activate(index);
				});
			}

			// Handle Hashtag
			if (o.deeplinking.linkID) {
				hashtagHandler();
			}

			// Add '.mSSlide' class to $slides
			$slides.addClass(minnamespace + 'Slide');
			
			// If startRandom
			o.startAt = o.startRandom ? Math.floor(Math.random() * items.length) : o.startAt;

			// Activate requested position
			self.activate(o.startAt, 1);

			// Navigation buttons
			if ($forwardButton[0]) {
				$forwardButton.on(mouseDownEvent, buttonsHandler);
			}
			if ($backwardButton[0]) {
				$backwardButton.on(mouseDownEvent, buttonsHandler);
			}
			if ($prevButton[0]) {
				$prevButton.on(clickEvent, buttonsHandler);
			}
			if ($nextButton[0]) {
				$nextButton.on(clickEvent, buttonsHandler);
			}
			if ($prevPageButton[0]) {
				$prevPageButton.on(clickEvent, buttonsHandler);
			}
			if ($nextPageButton[0]) {
				$nextPageButton.on(clickEvent, buttonsHandler);
			}
			if ($fullScreenButton[0]) {
				$fullScreenButton.on(clickEvent, buttonsHandler);
			}

			// Scrolling navigation
			$scrollSource.on(mouseScrollEvent, scrollHandler);

			// Clicking on scrollbar navigation
			if ($scrollbar[0]) {
				$scrollbar.on(clickEvent, scrollbarHandler);
			}

			// Click on slides navigation
			if (navigationType && o.navigation.activateOn) {
				$frame.on(o.navigation.activateOn + '.' + namespace, '*', activateHandler);
			}

			// Pages navigation
			if ($pagesBar[0] && o.pages.activateOn) {
				$pagesBar.on(o.pages.activateOn + '.' + namespace, '*', activatePageHandler);
			}

			// Dragging navigation
			$dragSource.on(dragInitEvents, { source: 'slideElement' }, dragInit);

			// Scrollbar dragging navigation
			if ($handle[0]) {
				$handle.on(dragInitEvents, { source: 'handle' }, dragInit);
			}

			// Keyboard navigation and Page Visibility Change Handler
			$doc.bind(keyDownEvent, keyboardHandler).bind(visibilityChangeEvent, visibilityChangeHandler);

			// Window resize, fullscreen and hashchange events
			$win.bind(resizeEvent, winResizeHandler).bind(hashChangeEvent, hashtagHandler);

			if (fullScreenApi.supportsFullScreen) {
				$win.bind(fullScreenApi.fullScreenEventName + '.' + uniqId, winfullScreenHandler);
			}

			// Pause on hover
			$frame.on(hoverEvent, pauseOnHoverHandler);
			// Reset native FRAME element scroll
			$frame.on('scroll.' + namespace, resetScroll);

			// Add horizontal/vertical and mightySlider class
			$parent.addClass(o.navigation.horizontal ? o.classes.horizontalClass : o.classes.verticalClass).addClass(isTouch ? o.classes.isTouchClass : '').addClass(namespace);

			// Initiate automatic cycling
			if (o.cycling.cycleBy) {
				self[o.cycling.startPaused ? 'pause' : 'resume']();
			}

			// Mark instance as initialized
			self.initialized = 1;

			// Trigger :initialize event
			trigger('initialize');

			// Return instance
			return self;
		};
	}

	/**
	 * Return type of the value.
	 *
	 * @param  {Mixed} value
	 *
	 * @return {String}
	 */
	function type(value) {
		if (value === null) {
			return String(value);
		}

		if (typeof value === 'object' || typeof value === 'function') {
			return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
		}

		return typeof value;
	}

	/**
	 * Get slide type.
	 *
	 * @param {Object}   options
	 *
	 * @return {String}
	 */
	function getSlideType(options) {
		var type = 'content',
		cover = options.cover,
		source = options.source,
		video = options.mp4 || options.webm || options.ogv || options.video;

		if (options.type) {
			return options.type;
		}
		else if (parseVideoURL(source)) {
			return 'video';
		}

		if (cover) {
			type = 'image';
		}
		if (source) {
			type = 'iframe';
		}
		if (video) {
			type = 'video';
		}
		if (options.link) {
			type = 'link';
		}
		
		return type;
	}

	/**
	 * Get element inline options.
	 *
	 * @param {Object}   $element    jQuery object with element.
	 *
	 * @return {Object}
	 */
	function getInlineOptions($element) {
		var data = $element.data(namespace.toLowerCase());
		return data && eval("({" + data + "})") || {};
	}

	/**
	 * Get caption keyframes.
	 *
	 * @param {Object}   $caption    jQuery object with element.
	 *
	 * @return {Object}
	 */
	function getCaptionKeyFrames($caption) {
		var data = $caption.data(minnamespace.toLowerCase() + 'animation');
		return data && eval("([" + data + "])") || {};
	}

	/**
	 * Get caption default styles.
	 *
	 * @param {Object}   $caption    jQuery object with element.
	 *
	 * @return {Object}
	 */
	function getCaptionStyles($caption) {
		var styles = {};

		for (var i = 0, len = captionResponsiveStyles.length, property, pixel; i < len; i++) {
			property = captionResponsiveStyles[i],
			pixel = getPixel($caption, property);

			if (pixel) {
				styles[property] = pixel;
			}
		}

		return styles;
	}

	/**
	 * Normalize styles.
	 *
	 * @param {Object}   styles
	 * @param {Object}   properties
	 * @param {Number}   ratio
	 *
	 * @return {Object}
	 */
	function normalizeStyles(styles, properties, ratio) {
		var newStyles = {};

		$.each(styles, function(property, value) {
			if (properties.indexOf(property) === -1) {
				return true;
			}
			var pixel = value * ratio;
			newStyles[property] = pixel;
		});

		return newStyles;
	}

	/**
	 * Event preventDefault & stopPropagation helper.
	 *
	 * @param {Event} event     Event object.
	 * @param {Bool}  noBubbles Cancel event bubbling.
	 *
	 * @return {Void}
	 */
	function stopDefault(event, noBubbles) {
		event.preventDefault();
		if (noBubbles) {
			event.stopPropagation();
		}
	}

	/**
	 * Disables an event it was triggered on and unbinds itself.
	 *
	 * @param  {Event} event
	 *
	 * @return {Void}
	 */
	function disableOneEvent(event) {
		/*jshint validthis:true */
		stopDefault(event, 1);
		$(this).off(event.type, disableOneEvent);
	}

	/**
	 * Resets native element scroll values to 0.
	 *
	 * @return {Void}
	 */
	function resetScroll() {
		/*jshint validthis:true */
		this.scrollLeft = 0;
		this.scrollTop = 0;
	}

	/**
	 * A JavaScript equivalent of PHP’s is_numeric.
	 *
	 * @param {Mixed} value
	 *
	 * @return {Boolean}
	 */
	function is_numeric(value) {
		return (typeof(value) === 'number' || typeof(value) === 'string') && value !== '' && !isNaN(value);
	}

	/**
	 * Parse style to pixels.
	 *
	 * @param {Object}   $element   jQuery object with element.
	 * @param {Property} property   CSS property to get the pixels from.
	 *
	 * @return {Int}
	 */
	function getPixel($element, property) {
		return parseInt($element.css(property), 10) || 0;
	}

	/**
	 * Make sure that number is within the limits.
	 *
	 * @param {Number} number
	 * @param {Number} min
	 * @param {Number} max
	 *
	 * @return {Number}
	 */
	function within(number, min, max) {
		return number < min ? min : number > max ? max : number;
	}

	/**
	 * Return value from percent of a number.
	 *
	 * @param {Number} percent
	 * @param {Number} total
	 *
	 * @return {Number}
	 */
	function percentToValue(percent, total) {
		return parseInt((total / 100) * percent);
	}

	/**
	 * Show slide loader.
	 *
	 * @param {Object}   $slide    jQuery object with element.
	 *
	 * @return {Object} jQuery DOM element
	 */
	function showLoader($slide) {
		var $loader = $('<div class="' + minnamespace + 'Icon ' + minnamespace + 'Loader"></div>'),
			loaderExists = $('.' + minnamespace + 'Loader', $slide);

		if (!loaderExists[0]) {
			$slide.prepend($loader);
		} else {
			$loader = loaderExists;
		}

		// Set instances number for loader icon
		var instancesAttr = $loader[0].getAttribute(minnamespace + 'instances'),
			instances = instancesAttr && parseInt(instancesAttr) || 0;

		// Set last show loader instance
		instances++;
		$loader[0].setAttribute(minnamespace + 'instances', instances);

		return $loader;
	}

	/**
	 * Hide slide loader.
	 *
	 * @param {Object}   $loader    jQuery object with element.
	 *
	 * @return {Void}
	 */
	function hideLoader($loader) {
		var instancesAttr = $loader[0].getAttribute(minnamespace + 'instances'),
			instances = instancesAttr && parseInt(instancesAttr) || 1;

		// Set last hide loader instance
		instances--;
		$loader[0].setAttribute(minnamespace + 'instances', instances);

		if (instances <= 0) {
			return $loader.remove();
		}
	}

	/**
	 * Calculate new dimensions from old dimensions.
	 *
	 * @param {Number}   width
	 * @param {Number}   height
	 * @param {Number}   width_old
	 * @param {Number}   height_old
	 * @param {Number}   factor
	 *
	 * @return {Object}
	 */
	function calculateDimensions(width, height, width_old, height_old, factor) {
		if (!factor) {
			if (!width) {
				factor = height / height_old;
			}
			else if (!height) {
				factor = width / width_old;
			}
			else {
				factor = Math.min( width / width_old, height / height_old );
			}
		}

		return {
			width: Math.round( width_old * factor ),
			height: Math.round( height_old * factor ),
			ratio:factor
		};
	}

	/**
	 * Parse video url
	 *
	 * @param {String}   url
	 *
	 * @return {Object}
	 */
	function parseVideoURL(url) {
		var result = null;

		for (var i = 0, len = videoRegularExpressions.length, object, split; i < len; i++) {
			object = videoRegularExpressions[i];

			// Test url if can be parsed
			if (object.reg.test(url)) {
				split = url.split(object.split);
				result = {
					source: object.url.replace(/\{id\}/g, split[object.index]),
					type: object.iframe && 'iframe' || 'flash'
				};

				break;
			}
		}

		return result;
	}

	/**
	 * Parse photo url
	 *
	 * @param {String}   url
	 *
	 * @return {Object}
	 */
	function parsePhotoURL(url) {
		var result = null;

		for (var i = 0, len = photoRegularExpressions.length, object; i < len; i++) {
			object = photoRegularExpressions[i];

			// Test url if can be parsed
			if (object.reg.test(url)) {
				result = $.extend(true, {}, object, {});
				result.oembed = absolutizeURI(object.oembed.replace(/\{URL\}/g, url), url);

				break;
			}
		}

		return result;
	}

	/**
	 * Create DOM element
	 *
	 * @param {String}   type
	 * @param {Object}   params
	 * @param {Object}   innerTags
	 *
	 * @return {Object}  DOM element
	 */
	function createElement(type, params, innerTags) {
		var el;

		params = params || {};
		innerTags = innerTags || {};

		switch (type) {
			case 'video':
				// Create video DOM element
				el = document.createElement( "video" );

				// Set default video attributes
				params = $.extend(true, videoDefaultAttributes, params);
				break;
			case 'iframe':
				// Create iframe DOM element
				el = document.createElement( "iframe" );

				// Set default iframe attributes
				params = $.extend(true, iframeDefaultAttributes, params);
				break;
			case 'flash':
				// Create embed DOM element
				el = document.createElement( "embed" );

				// Set default embed attributes
				params = $.extend(true, embedDefaultAttributes, params);
				break;
			default :
				el = document.createElement( type );
				break;
		}

		// Insert element attributes
		insertTag(el, params);

		// Insert innerTags
		$.each(innerTags, function(i, attributes) {
			if (!attributes.name) {
				return true;
			}
			// Insert tags into el
			var newEl = document.createElement( attributes.name );

			attributes.name = null;

			// Insert element attributes
			insertTag(newEl, attributes);
			
			// Append inner tags into el
			el.appendChild(newEl);
		});

		return el;
	}

	/**
	 * Insert attributes to DOM elements
	 *
	 * @param {Object}   el                 HTML DOM element
	 * @param {String}   attributes
	 *
	 * @return {Void}
	 */
	function insertTag(el, attributes) {
		$.each(attributes, function(key, value) {
			if (!is_numeric(value) && !value) {
				return true;
			}

			// Insert attribute into el
			insertAttribute(el, key, value);
		});
	}

	/**
	 * Insert an attribute into DOM element
	 *
	 * @param {Object}   el                 HTML DOM element
	 * @param {String}   attributeName
	 * @param {Mixed}    value
	 *
	 * @return {Void}
	 */
	function insertAttribute(el, attributeName, value) {
		var nodeValue = ($.isPlainObject(value)) ? (function(){
				var query = "",
					i = 0;

				$.each(value, function(k, v) {
					if (i!==0) {
						query += "&";
					}
					query += k + "=" + rawurlencode(v);
					i++;
				});
			return query;
		}()) : value;
		el.setAttribute(attributeName, nodeValue);
	}

	/**
	 * Preload images with callback.
	 *
	 * @param {Array} arr
	 *
	 * @return {Object}
	 */
	function preloadimages(arr) {
		var newImages = [], loadedImages = 0,
			postAction = function(){};

		arr = (typeof arr !== "object") ? [arr] : arr;

		function imageLoadPost(){
			loadedImages++;
			if (loadedImages === arr.length) {
				// call postAction and pass in newImages array as parameter
				postAction(newImages);
			}
		}

		function handler() {
			imageLoadPost();
		}

		for (var i=0; i < arr.length; i++) {
			newImages[i] = new Image();
			newImages[i].onload = handler;
			newImages[i].onerror = handler;
			newImages[i].src = arr[i];
		}

		// return blank object with done() method
		return {
			done: function(f) {
				// remember user defined callback functions to be called when images load
				postAction = f || postAction;
			}
		};
	}

	/**
	 * Remove unwanted chars from background
	 *
	 * @param {String}  url
	 *
	 * @return {String}
	 */
	function stripUrl(url) {
		url = url.replace(/url\(\"/g, "");
		url = url.replace(/url\(/g, "");
		url = url.replace(/\"\)/g, "");
		url = url.replace(/\)/g, "");

		return url;
	};

	/**
	 * Find all images in a container with callback.
	 *
	 * @param {Object}  element  DOM element
	 *
	 * @return {Array}
	 */
	function findAllImages(element) {
		var url = "",
			$elements = $('*:not(script, style, .' + minnamespace + 'Cover, .' + minnamespace + 'CoverImage, .' + minnamespace + 'LayerCover, .' + minnamespace + 'LayerCoverImage, .' + minnamespace + 'Loader)', element),
			foundUrls = [];

		var el, obj, urls,
			eachHandler = function () {
				el = this,
				obj = $(el);

				if (el.nodeName.toLowerCase() === "img" && el.hasAttribute("src")) {
					//if is img and has src
					url = obj.prop("src");
				} else if (obj.css("background-image") !== "none") {
					//if object has background image
					url = obj.css("background-image");
				}

				//skip if gradient
				if (url.indexOf("gradient") === -1) {
					//remove unwanted chars
					url = stripUrl(url);

					//split urls
					urls = url.split(", ");

					for (var i = 0, len = urls.length, extra; i < len; i++) {
						if ((urls[i].length > 0 && !urls[i].match(/^(data:)/i)) && (foundUrls.indexOf(urls[i]) === -1)) {
							extra = "";

							if (browser.msie && browser.version < 9) {
								//filthy always no cache for IE, sorry peeps!
								extra = "?rand=" + Math.random();
							}

							//add image to found list
							foundUrls.push(urls[i]/*  + extra */);
						}
					}
				}
			};

		$elements.each(eachHandler);

		return foundUrls;
	}

	/**
	 * Check HTML5 video element can play given type.
	 *
	 * @param {String} type
	 *
	 * @return {String}
	 */
	function canPlayType(type) {
		var el = document.createElement( "video" );
		return !!(el.canPlayType && el.canPlayType(type).replace(/no/, ''))
	}

	/**
	 * Do the ajax requests with callback.
	 *
	 * @param {String}   url
	 * @param {Function} callback
	 *
	 * @return {Void}
	 */
	function doAjax(url, callback) {
		var url = JSONReader.replace(/\{URL\}/g, rawurlencode(url)),
		docMode = document.documentMode || browser.version,
		ieLT10 = browser.msie && docMode < 10,
		xhr = $.ajax({
			url: url,
			dataType: ieLT10 ? 'jsonp' : 'json',
			cache: !ieLT10
		});

		xhr.success(function(data){
			callback(data);
		}).error(function(){
			callback(false);
		});

		// IE's that are lower than 10 cannot proccess json urls so we need to use jsonp
		// but because of the 'use strict' mode it's will be an error and also 'use strict'
		// mode in not supported by IE's that are lower than 10 :|
		if (ieLT10) {
			mightySliderCallback = function(data) {
				callback(data);
			};
		}
	}

	/**
	 * A JavaScript equivalent of PHP’s rawurlencode.
	 *
	 * @param {String} str
	 *
	 * @return {String}
	 */
	function rawurlencode(str) {
		str = (str + '').toString();

		// Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
		// PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
		return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
		replace(/\)/g, '%29').replace(/\*/g, '%2A');
	}

	/**
	 * A JavaScript equivalent of PHP’s ucfirst.
	 *
	 * @param {String} str
	 *
	 * @return {String}
	 */
	function ucfirst(str) {
		str += '';
		var f = str.charAt(0).toUpperCase();
		return f + str.substr(1);
	}

	/**
	 * A JavaScript equivalent of PHP’s basename.
	 *
	 * @param {String} path
	 * @param {String} suffix
	 *
	 * @return {String}
	 */
	function basename(path, suffix) {
		var b = path.replace(/^.*[\/\\]/g, '');

		if (typeof(suffix) === 'string' && b.substr(b.length - suffix.length) === suffix) {
			b = b.substr(0, b.length - suffix.length);
		}

		return b;
	}

	/**
	 * A JavaScript equivalent of PHP’s dirname.
	 *
	 * @param {String} path
	 *
	 * @return {String}
	 */
	function dirname(path) {
		return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
	}

	/**
	 * A JavaScript equivalent of PHP’s parse_url.
	 *
	 * @param {String} url           The URL to parse.
	 * @param {String} component     Specify one of URL_SCHEME, URL_HOST, URL_PORT, URL_USER, URL_PASS, URL_PATH, URL_QUERY or URL_FRAGMENT to retrieve just a specific URL component as a string.
	 *
	 * @return {Mixed}
	 */
	function parse_url(url, component) {
		var query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
			'relative', 'path', 'directory', 'file', 'query', 'fragment'],
			mode = 'php',
			parser = {
				php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
			};

		var m = parser[mode].exec(url),
			uri = {},
			i = 14;
			while (i--) {
				if (m[i]) {
					uri[key[i]] = m[i];
				}
			}

		if (component) {
			return uri[component.replace('URL_', '').toLowerCase()];
		}
		if (mode !== 'php') {
			var name = 'queryKey';
			parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
			uri[name] = {};
			query = uri[key[12]] || '';
			query.replace(parser, function ($0, $1, $2) {
				if ($1) {uri[name][$1] = $2;}
			});
		}
		uri.source = null;
		return uri;
	}

	/**
	 * Gets the absolute URI.
	 *
	 * @param {String} href     The relative URL.
	 * @param {String} base     The base URL.
	 *
	 * @return {String}         The absolute URL.
	 */
	function absolutizeURI(href, base) {// RFC 3986
		function removeDotSegments(input) {
			var output = [];
			input.replace(/^(\.\.?(\/|$))+/, '')
				 .replace(/\/(\.(\/|$))+/g, '/')
				 .replace(/\/\.\.$/, '/../')
				 .replace(/\/?[^\/]*/g, function (p) {
				if (p === '/..') {
					output.pop();
				} else {
					output.push(p);
				}
			});
			return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
		}

		function URIComponents(url) {
			var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
			// authority = '//' + user + ':' + pass '@' + hostname + ':' port
			return (m ? {
				href     : m[0] || '',
				protocol : m[1] || '',
				authority: m[2] || '',
				host     : m[3] || '',
				hostname : m[4] || '',
				port     : m[5] || '',
				pathname : m[6] || '',
				search   : m[7] || '',
				hash     : m[8] || ''
			} : null);
		}

		href = URIComponents(href || '');
		base = URIComponents(base || window.location.href);

		return !href || !base ? null : (href.protocol || base.protocol) +
			(href.protocol || href.authority ? href.authority : base.authority) +
			removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
			(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
			href.hash;
	}

	/**
	 * A JavaScript equivalent of PHP’s pathinfo.
	 *
	 * @param {String} path
	 * @param {String} options
	 *
	 * @return {Array}
	 */
	function pathinfo(path, options) {
		var opt = '',
			optName = '',
			optTemp = 0,
			tmp_arr = {},
			cnt = 0,
			i = 0,
			have_basename = false,
			have_extension = false,
			have_filename = false;

		// Input defaulting & sanitation
		if (!path) {
			return false;
		}
		if (!options) {
			options = 'ALL';
		}

		// Initialize binary arguments. Both the string & integer (constant) input is
		// allowed
		var OPTS = {
			'DIRNAME': 1,
			'BASENAME': 2,
			'EXTENSION': 4,
			'FILENAME': 8,
			'ALL': 0
		};
		// ALL sums up all previously defined PATHINFOs (could just pre-calculate)
		for (optName in OPTS) {
			OPTS.ALL = OPTS.ALL | OPTS[optName];
		}
		if (typeof options !== 'number') { // Allow for a single string or an array of string flags
			options = [].concat(options);
			for (i = 0; i < options.length; i++) {
				// Resolve string input to bitwise e.g. 'EXTENSION' becomes 4
				if (OPTS[options[i]]) {
					optTemp = optTemp | OPTS[options[i]];
				}
			}
			options = optTemp;
		}

		// Internal Functions
		var __getExt = function (path) {
			var str = path + '';
			var dotP = str.lastIndexOf('.') + 1;
			return !dotP ? false : dotP !== str.length ? str.substr(dotP) : '';
		};


		// Gather path infos
		if (options & OPTS.DIRNAME) {
			var dirname = dirname(path);
			tmp_arr.dirname = dirname === path ? '.' : dirname;
		}

		if (options & OPTS.BASENAME) {
			if (false === have_basename) {
				have_basename = basename(path);
			}
			tmp_arr.basename = have_basename;
		}

		if (options & OPTS.EXTENSION) {
			if (false === have_basename) {
				have_basename = basename(path);
			}
			if (false === have_extension) {
				have_extension = __getExt(have_basename);
			}
			if (false !== have_extension) {
				tmp_arr.extension = have_extension;
			}
		}

		if (options & OPTS.FILENAME) {
			if (false === have_basename) {
				have_basename = basename(path);
			}
			if (false === have_extension) {
				have_extension = __getExt(have_basename);
			}
			if (false === have_filename) {
				have_filename = have_basename.slice(0, have_basename.length - (have_extension ? have_extension.length + 1 : have_extension === false ? 0 : 1));
			}

			tmp_arr.filename = have_filename;
		}


		// If array contains only 1 element: return string
		cnt = 0;
		for (opt in tmp_arr) {
			cnt++;
		}
		if (cnt === 1) {
			return tmp_arr[opt];
		}

		// Return full-blown array
		return tmp_arr;
	}

	/**
	 * Get type via extension.
	 *
	 * @param {String} URL
	 *
	 * @return {String}
	 */
	function getTypeByExtension(URL){
		var ext = pathinfo(URL, 'EXTENSION'),
			type;
		
		ext = ($.isPlainObject(ext)) ? null : ext.toLowerCase();
		
		if(extensions.image.indexOf(ext) >= 0) type = 'image';
		else if(extensions.flash.indexOf(ext) >= 0) type = 'flash';
		else if(extensions.video.indexOf(ext) >= 0) type = 'video';
		else type = 'iframe';
		
		return type;
	}

	/**
	 * A JavaScript equivalent of PHP’s uniqid.
	 *
	 * @param {String}  prefix
	 * @param {Boolean} more_entropy
	 *
	 * @return {String}
	 */
	function uniqid(prefix, more_entropy) {
		if (typeof prefix === 'undefined') {
			prefix = "";
		}

		var retId;
		var formatSeed = function (seed, reqWidth) {
			seed = parseInt(seed, 10).toString(16); // to hex str
			if (reqWidth < seed.length) { // so long we split
				return seed.slice(seed.length - reqWidth);
			}
			if (reqWidth > seed.length) { // so short we pad
				return Array(1 + (reqWidth - seed.length)).join('0') + seed;
			}
			return seed;
		};

		// BEGIN REDUNDANT
		var php_js = {};

		// END REDUNDANT
		if (!php_js.uniqidSeed) { // init seed with big random int
			php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
		}
		php_js.uniqidSeed++;

		retId = prefix; // start with prefix, add current milliseconds hex string
		retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
		retId += formatSeed(php_js.uniqidSeed, 5); // add seed hex string
		if (more_entropy) {
			// for more entropy we add a float lower to 10
			retId += (Math.random() * 10).toFixed(8).toString();
		}

		return retId;
	}

	/**
	 * A JavaScript equivalent of PHP’s version_compare.
	 *
	 * @param {String} v1
	 * @param {String} v2
	 * @param {String} operator
	 *
	 * @return {Boolean}
	 */
	function version_compare(v1, v2, operator) {
		// Important: compare must be initialized at 0.
		var i = 0,
		x = 0,
		compare = 0,
		// vm maps textual PHP versions to negatives so they're less than 0.
		// PHP currently defines these as CASE-SENSITIVE. It is important to
		// leave these as negatives so that they can come before numerical versions
		// and as if no letters were there to begin with.
		// (1alpha is < 1 and < 1.1 but > 1dev1)
		// If a non-numerical value can't be mapped to this table, it receives
		// -7 as its value.
		vm = {
			'dev': -6,
			'alpha': -5,
			'a': -5,
			'beta': -4,
			'b': -4,
			'RC': -3,
			'rc': -3,
			'#': -2,
			'p': 1,
			'pl': 1
		},
		// This function will be called to prepare each version argument.
		// It replaces every _, -, and + with a dot.
		// It surrounds any nonsequence of numbers/dots with dots.
		// It replaces sequences of dots with a single dot.
		//    version_compare('4..0', '4.0') == 0
		// Important: A string of 0 length needs to be converted into a value
		// even less than an unexisting value in vm (-7), hence [-8].
		// It's also important to not strip spaces because of this.
		//   version_compare('', ' ') == 1
		prepVersion = function (v) {
			v = ('' + v).replace(/[_\-+]/g, '.');
			v = v.replace(/([^.\d]+)/g, '.$1.').replace(/\.{2,}/g, '.');
			return (!v.length ? [-8] : v.split('.'));
		},
		// This converts a version component to a number.
		// Empty component becomes 0.
		// Non-numerical component becomes a negative number.
		// Numerical component becomes itself as an integer.
		numVersion = function (v) {
			return !v ? 0 : (isNaN(v) ? vm[v] || -7 : parseInt(v, 10));
		};
		v1 = prepVersion(v1);
		v2 = prepVersion(v2);
		x = Math.max(v1.length, v2.length);
		for (i = 0; i < x; i++) {
			if (v1[i] === v2[i]) {
				continue;
			}
			v1[i] = numVersion(v1[i]);
			v2[i] = numVersion(v2[i]);
			if (v1[i] < v2[i]) {
				compare = -1;
				break;
			}
			else if (v1[i] > v2[i]) {
				compare = 1;
				break;
			}
		}
		if (!operator) {
			return compare;
		}

		// "No operator" seems to be treated as "<."
		// Any other values seem to make the function return null.
		switch (operator) {
			case '>':
			return (compare > 0);
			case '>=':
			return (compare >= 0);
			case '<=':
			return (compare <= 0);
			case '==':
			return (compare === 0);
			case '!=':
			return (compare !== 0);
			case '<':
			return (compare < 0);
			default:
			return null;
		}
	}

	// Browser detect
	(function () {
		function uaMatch( ua ) {
			ua = ua.toLowerCase();

			var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
				[];

			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		}

		var matched = uaMatch( navigator.userAgent );
		browser = {};

		if ( matched.browser ) {
			browser[ matched.browser ] = true;
			browser.version = matched.version;
		}

		// Chrome is Webkit, but Webkit is also Safari.
		if ( browser.chrome ) {
			browser.webkit = true;
		}
		else if ( browser.webkit ) {
			browser.safari = true;
		}
	}());

	// Local WindowAnimationTiming interface polyfill
	(function () {
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		var lastTime = 0;

		// For a more accurate WindowAnimationTiming interface implementation, ditch the native
		// requestAnimationFrame when cancelAnimationFrame is not present (older versions of Firefox)
		for(var i = 0, l = vendors.length; i < l && !cancelAnimationFrame; ++i) {
			cancelAnimationFrame = window[vendors[i]+'CancelAnimationFrame'] || window[vendors[i]+'CancelRequestAnimationFrame'];
			requestAnimationFrame = cancelAnimationFrame && window[vendors[i]+'RequestAnimationFrame'];
		}

		if (!cancelAnimationFrame) {
			requestAnimationFrame = function (callback) {
				var currTime = +new Date();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				lastTime = currTime + timeToCall;
				return window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
			};

			cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}
	}());

	// Feature detects
	(function () {
		var prefixes = ['', 'webkit', 'moz', 'ms', 'o'];
		var el = document.createElement('div');

		function testProp(prop) {
			for (var p = 0, pl = prefixes.length, prefixedProp; p < pl; p++) {
				prefixedProp = prefixes[p] ? prefixes[p] + prop.charAt(0).toUpperCase() + prop.slice(1) : prop;
				if (el.style[prefixedProp] !== undefined) {
					return prefixedProp;
				}
			}
		}

		// Global support indicators
		transform = testProp('transform');
		gpuAcceleration = testProp('perspective') ? 'translateZ(0) ' : '';
	}());

	// PageVisibility API detects
	(function () {
		var prefixes = ['', 'webkit', 'moz', 'ms', 'o'], property, prefix;

		while ((prefix = prefixes.pop()) != undefined) {
			property = (prefix ? prefix + 'H': 'h') + 'idden';
			if (typeof document[property] === 'boolean') {
				visibilityEvent = prefix + 'visibilitychange';
				break;
			}
		}

		visibilityHidden = function() {
			return document[property]; 
		};
	}());

	// Polyfill for Array.prototype.filter function
	if (!Array.prototype.filter) {
		Array.prototype.filter = function (fun /*, thisArg */ ) {
			if (this === void 0 || this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun != "function")
				throw new TypeError();

			var res = [];
			var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			for (var i = 0, val; i < len; i++) {
				if (i in t) {
					val = t[i];

					// NOTE: Technically this should Object.defineProperty at
					//       the next index, as push can be affected by
					//       properties on Object.prototype and Array.prototype.
					//       But that method's new, and collisions should be
					//       rare, so use the more-compatible alternative.
					if (fun.call(thisArg, val, i, t))
						res.push(val);
				}
			}

			return res;
		};
	}

	// Polyfill for Array.prototype.forEach function
	if (!Array.prototype.forEach) {
		Array.prototype.forEach = function (fun /*, thisArg */ ) {
			if (this === void 0 || this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function")
				throw new TypeError();

			var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			for (var i = 0; i < len; i++) {
				if (i in t)
					fun.call(thisArg, t[i], i, t);
			}
		};
	}

	// Polyfill for Date.now function
	if (!Date.now) {
		Date.now = function now() {
			return new Date().getTime();
		};
	}

	// Polyfill for window.performance.now function
	(function(){
		// prepare base perf object
		if (typeof window.performance === 'undefined') {
			window.performance = {};
		}

		if (!window.performance.now) {
			var nowOffset = Date.now();

			window.performance.now = function now() {
				return Date.now() - nowOffset;
			}
		}

		performance = window.performance;
	})();
	
	/**
	 * matchMedia() polyfill - Test a CSS media type/query in JS.
	 * @Authors & @Copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight.
	 * @license: Dual MIT/BSD license
	 */
	window.matchMedia || (window.matchMedia = function () {
		// For browsers that support matchMedium api such as IE 9 and webkit
		var styleMedia = (window.styleMedia || window.media);

		// For those that don't support matchMedium
		if (!styleMedia) {
			var style = document.createElement('style'),
				script = document.getElementsByTagName('script')[0],
				info = null;

			style.type = 'text/css';
			style.id = 'matchmediajs-test';

			script.parentNode.insertBefore(style, script);

			// 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
			info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

			styleMedia = {
				matchMedium: function (media) {
					var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

					// 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
					if (style.styleSheet) {
						style.styleSheet.cssText = text;
					} else {
						style.textContent = text;
					}

					// Test if media query is true or false
					return info.width === '1px';
				}
			};
		}

		return function (media) {
			return {
				matches: styleMedia.matchMedium(media || 'all'),
				media: media || 'all'
			};
		};
	}());


	//Fullscreen API
	(function () {
		fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function() { return false; }, 
			requestFullScreen: function() {}, 
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		};
		var browserPrefixes = 'webkit moz o ms khtml'.split(' ');

		// check for native support
		if (typeof document.cancelFullScreen != 'undefined') {
			fullScreenApi.supportsFullScreen = true;
		} else {	 
			// check for fullscreen support by vendor prefix
			for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
				fullScreenApi.prefix = browserPrefixes[i];

				if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
					fullScreenApi.supportsFullScreen = true;
					break;
				}
			}
		}

		// update methods to do something useful
		if (fullScreenApi.supportsFullScreen) {
			fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

			fullScreenApi.isFullScreen = function() {
				switch (this.prefix) {	
					case '':
						return document.fullScreen;
						break;
					case 'webkit':
						return document.webkitIsFullScreen;
						break;
					default:
						return document[this.prefix + 'FullScreen'];
						break;
				}
			};
			fullScreenApi.requestFullScreen = function(el) {
				return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
			};
			fullScreenApi.cancelFullScreen = function(el) {
				return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
			};
		}
	}());



	// $.msAnimate and $.msStop functions for using TweenLite and callback to original jQuery $.animate and $.stop
	var	_animate = $.fn.animate,
		_stop = $.fn.stop,
		_enabled = true,
		TweenLite, CSSPlugin, _warned,
		_dequeue = function(func, next) {
			if (typeof(func) === "function") {
				this.each(func);
			}
			next();
		},
		_addCallback = function(type, func, obj, vars, next) {
			next = (typeof(next) === "function") ? next : null;
			func = (typeof(func) === "function") ? func : null;
			if (!func && !next) {
				return;
			}
			vars[type] = next ? _dequeue : obj.each;
			vars[type + "Scope"] = obj;
			vars[type + "Params"] = next ? [func, next] : [func];
		},
		_reserved = {overwrite:1, delay:1, useFrames:1, runBackwards:1, easeParams:1, yoyo:1, immediateRender:1, repeat:1, repeatDelay:1, autoCSS:1},
		_copyCriticalReserved = function(main, sub) {
			for (var p in _reserved) {
				if (_reserved[p] && main[p] !== undefined) {
					sub[p] = main[p];
				}
			}
		},
		_createEase = function(ease) {
			return function(p) {
				return ease.getRatio(p);
			};
		},
		_easeMap = {},
		_init = function() {
			var globals = window.GreenSockGlobals || window,
				version, stale, p;
			TweenLite = globals.TweenMax || globals.TweenLite; //we prioritize TweenMax if it's loaded so that we can accommodate special features like repeat, yoyo, repeatDelay, etc.
			if (TweenLite) {
				version = (TweenLite.version + ".0.0").split("."); //in case an old version of TweenLite is used that had a numeric version like 1.68 instead of a string like "1.6.8"
				stale = !(Number(version[0]) > 0 && Number(version[1]) > 7);
				globals = globals.com.greensock;
				CSSPlugin = globals.plugins.CSSPlugin;
				_easeMap = globals.easing.Ease.map || {}; //don't do just window.Ease or window.CSSPlugin because some other libraries like EaselJS/TweenJS use those same names and there could be a collision.
			}
			if (!TweenLite || !CSSPlugin || stale) {
				TweenLite = null;
				if (!_warned && window.console) {
					window.console.log("The jquery.gsap.js plugin requires the TweenMax (or at least TweenLite and CSSPlugin) JavaScript file(s)." + (stale ? " Version " + version.join(".") + " is too old." : ""));
					_warned = true;
				}
				return;
			}
		};

	$.fn.msAnimate = function(prop, speed, easing, callback) {
		prop = prop || {};
		if (_init) {
			_init();
			if (!TweenLite || !CSSPlugin) {
				return _animate.call(this, prop, speed, easing, callback);
			}
		}
		if (!_enabled || prop.skipGSAP === true || (typeof(speed) === "object" && typeof(speed.step) === "function") || prop.scrollTop != null || prop.scrollLeft != null) { //we don't support the "step" feature because it's too costly performance-wise, so fall back to the native animate() call if we sense one. Same with scrollTop and scrollLeft which are handled in a special way in jQuery.
			return _animate.call(this, prop, speed, easing, callback);
		}
		var config = $.speed(speed, easing, callback),
			vars = {ease:(_easeMap[config.easing] || ((config.easing === false) ? _easeMap.linear : _easeMap.swing))},
			obj = this,
			specEasing = (typeof(speed) === "object") ? speed.specialEasing : null,
			val, p, doAnimation, specEasingVars;

		for (p in prop) {
			val = prop[p];
			if (val instanceof Array && _easeMap[val[1]]) {
				specEasing = specEasing || {};
				specEasing[p] = val[1];
				val = val[0];
			}
			if (val === "toggle" || val === "hide" || val === "show") {
				return _animate.call(this, prop, speed, easing, callback);
			} else {
				vars[(p.indexOf("-") === -1) ? p : $.camelCase(p)] = val;
			}
		}

		if (specEasing) {
			specEasingVars = [];
			for (p in specEasing) {
				val = specEasingVars[specEasingVars.length] = {};
				_copyCriticalReserved(vars, val);
				val.ease = (_easeMap[specEasing[p]] || vars.ease);
				if (p.indexOf("-") !== -1) {
					p = $.camelCase(p);
				}
				val[p] = vars[p];
			}
			if (specEasingVars.length === 0) {
				specEasingVars = null;
			}
		}

		doAnimation = function(next) {
			if (specEasingVars) {
				var i = specEasingVars.length;
				while (--i > -1) {
					TweenLite.to(obj, $.fx.off ? 0 : config.duration / 1000, specEasingVars[i]);
				}
			}
			_addCallback("onComplete", config.old, obj, vars, next);
			TweenLite.to(obj, $.fx.off ? 0 : config.duration / 1000, vars);
			
		};

		if (config.queue !== false) {
			obj.queue(config.queue, doAnimation);
		} else {
			doAnimation();
		}

		return obj;
	};


	$.fn.msStop = function(clearQueue, gotoEnd) {
		_stop.call(this, clearQueue, gotoEnd);
		if (TweenLite) {
			if (gotoEnd) {
				var tweens = TweenLite.getTweensOf(this),
					i = tweens.length,
					progress;
				while (--i > -1) {
					progress = tweens[i].totalTime() / tweens[i].totalDuration();
					if (progress > 0 && progress < 1) {
						tweens[i].seek(tweens[i].totalDuration());
					}
				}
			}
			TweenLite.killTweensOf(this);
		}
		return this;
	};


	/*
		Customized jQuery hashchange event v1.3
		https://github.com/cowboy/jquery-hashchange
		Copyright (c) 2010 "Cowboy" Ben Alman
		Dual licensed under the MIT and GPL licenses.
	*/
	(function () {
		var str_hashchange = "hashchange", doc = document, fake_onhashchange, special = $.event.special, doc_mode = doc.documentMode, supports_onhashchange = "on" + str_hashchange in window && (doc_mode === undefined || doc_mode > 7);
		function get_fragment(url) {
			url = url || location.href;
			return "#" + url.replace(/^[^#]*#?(.*)$/, "$1");
		}
		$.fn[str_hashchange] = function(fn) {
			return fn ? this.bind(str_hashchange, fn) : this.trigger(str_hashchange);
		};
		$.fn[str_hashchange].delay = 50;
		special[str_hashchange] = $.extend(special[str_hashchange], {setup:function() {
			if(supports_onhashchange) {
				return false;
			}
			$(fake_onhashchange.start);
		}, teardown:function() {
			if(supports_onhashchange) {
				return false;
			}
			$(fake_onhashchange.stop);
		}});
		fake_onhashchange = function() {
			var self = {}, timeout_id, last_hash = get_fragment(), fn_retval = function(val) {
				return val;
			}, history_set = fn_retval, history_get = fn_retval;
			self.start = function() {
				timeout_id || poll();
			};
			self.stop = function() {
				timeout_id && clearTimeout(timeout_id);
				timeout_id = undefined;
			};
			function poll() {
				var hash = get_fragment(), history_hash = history_get(last_hash);
				if(hash !== last_hash) {
					history_set(last_hash = hash, history_hash);
					$(window).trigger(str_hashchange);
				}else {
					if(history_hash !== last_hash) {
						location.href = location.href.replace(/#.*/, "") + history_hash;
					}
				}
				timeout_id = setTimeout(poll, $.fn[str_hashchange].delay);
			}
			(browser.msie) && !supports_onhashchange && function() {
				var iframe, iframe_src;
				self.start = function() {
					if(!iframe) {
						iframe_src = $.fn[str_hashchange].src;
						iframe_src = iframe_src && iframe_src + get_fragment();
						iframe = $('<iframe tabindex="-1" title="empty"/>').hide().one("load", function() {
							iframe_src || history_set(get_fragment());
							poll();
						}).attr("src", iframe_src || "javascript:0").insertAfter("body")[0].contentWindow;
						doc.onpropertychange = function() {
							try {
								if(event.propertyName === "title") {
									iframe.document.title = doc.title;
								}
							}catch(e) {}
						};
					}
				};
				self.stop = fn_retval;
				history_get = function() {
					return get_fragment(iframe.location.href);
				};
				history_set = function(hash, history_hash) {
					var iframe_doc = iframe.document, domain = $.fn[str_hashchange].domain;
					if(hash !== history_hash) {
						iframe_doc.title = doc.title;
						iframe_doc.open();
						domain && iframe_doc.write('<script>document.domain="' + domain + '"\x3c/script>');
						iframe_doc.close();
						iframe.location.hash = hash;
					}
				};
			}();
			return self;
		}();
	}());

	// Expose class globally
	window.mightySlider = mightySlider;

	mightySlider.author  		= 'iProDev (Hemn Chawroka). (www.iprodev.com)';
	mightySlider.version 		= '2.0.0';
	mightySlider.releaseDate 	= 'April 2014';

	// Begin the plugin
	$.fn.mightySlider = function(options, callbackMap) {
		if (version_compare($.fn.jquery, '1.7', '>=')) {
			var method, methodArgs;

			// Attributes logic
			if (!$.isPlainObject(options)) {
				if (type(options) === 'string' || options === false) {
					method = options === false ? 'destroy' : options;
					methodArgs = Array.prototype.slice.call(arguments, 1);
				}
				options = {};
			}

			// Apply to all elements
			return this.each(function (i, element) {
				// Call with prevention against multiple instantiations
				var plugin = $.data(element, namespace);

				if (!plugin && !method) {
					// Create a new object if it doesn't exist yet
					plugin = $.data(element, namespace, new mightySlider(element, options, callbackMap).init());
				}
				else if (plugin && method) {
					// Call method
					if (plugin[method]) {
						plugin[method].apply(plugin, methodArgs);
					}
				}
			});
		}
		else {
			throw "The jQuery version that was loaded is too old. mightySlider requires jQuery 1.7+";
		}
	};

	// Default options
	mightySlider.defaults = {
		// Mixed options
		moveBy:             300,        // Speed in pixels per second used by forward and backward buttons.
		speed:              300,        // Animations speed in milliseconds. 0 to disable animations.
		easing:             'swing',    // Easing for duration based (tweening) animations.
		startAt:            0,          // Starting offset in slides.
		startRandom:        0,          // Starting offset in slides randomly, where: 1 = random, 0 = disable.
		viewport:           'fill',     // Sets the resizing method used to fit cover image within the viewport. Can be: 'center', 'fit', 'fill', 'stretch'.
		autoScale:          0,          // Automatically updates slider height based on base width.
		autoResize:         0,          // Auto resize the slider when active slide is bigger than slider FRAME.
		videoFrame:         null,       // The URL of the video frame to play videos with your custom player.
		preloadMode:        'nearby',   // Preloading mode for slides covers. Can be: 'all', 'nearby', 'instant'.

		// Navigation
		navigation: {
			horizontal:      1,               // Switch to horizontal mode.
			navigationType:  'forceCentered', // Slide navigation type. Can be: 'basic', 'centered', 'forceCentered'.
			slideSelector:   null,            // Select only slides that match this selector.
			smart:           1,               // Repositions the activated slide to help with further navigation.
			activateOn:      null,            // Activate an slide on this event. Can be: 'click', 'mouseenter', ...
			activateMiddle:  1,               // Always activate the slide in the middle of the FRAME. forceCentered only.
			slideSize:       0,               // Sets the slides size. Can be: Fixed(500) or Percent('100%') number.
			keyboardNavBy:   null             // Enable keyboard navigation by 'slides' or 'pages'.
		},

		// Deep-Linking
		deeplinking: {
			linkID:     null, // Sets the deeplinking id.
			scrollTo:   0,    // Enable scroll to slider when link changed.
			separator:  '/'   // Separator between linkID and slide ID.
		},

		// Scrolling
		scrolling: {
			scrollSource: null, // Selector or DOM element for catching the mouse wheel scrolling. Default is FRAME.
			scrollBy:     0     // Slides to move per one mouse scroll. 0 to disable scrolling.
		},

		// Dragging
		dragging: {
			dragSource:    null, // Selector or DOM element for catching dragging events. Default is FRAME.
			mouseDragging: 1,    // Enable navigation by dragging the SLIDEELEMENT with mouse cursor.
			touchDragging: 1,    // Enable navigation by dragging the SLIDEELEMENT with touch events.
			releaseSwing:  1,    // Ease out on dragging swing release.
			swingSync:     7.5,  // Swing synchronization.
			swingSpeed:    0.1,  // Swing synchronization speed, where: 1 = instant, 0 = infinite.
			elasticBounds: 1,    // Stretch SLIDEELEMENT position limits when dragging past FRAME boundaries.
			syncSpeed:     0.5,  // SLIDEELEMENT synchronization speed, where: 1 = instant, 0 = infinite.
			onePage:       0,    // Enable one page move per drag, where: 1 = enable, 0 = disable.
			interactive:   null  // Selector for special interactive elements.
		},

		// Scrollbar
		scrollBar: {
			scrollBarSource:   null, // Selector or DOM element for scrollbar container.
			dragHandle:        1,    // Whether the scrollbar handle should be draggable.
			dynamicHandle:     1,    // Scrollbar handle represents the ratio between hidden and visible content.
			minHandleSize:     50,   // Minimal height or width (depends on mightySlider direction) of a handle in pixels.
			clickBar:          1     // Enable navigation by clicking on scrollbar.
		},

		// Pages
		pages: {
			pagesBar:       null, // Selector or DOM element for pages bar container.
			activateOn:     null, // Event used to activate page. Can be: click, mouseenter, ...
			pageBuilder:          // Page item generator.
				function (index) {
					return '<li>' + (index + 1) + '</li>';
				}
		},

		// Thumbnails
		thumbnails: {
			thumbnailsBar:       null,    // Selector or DOM element for thumbnails bar container.
			horizontal:          1,       // Switch to horizontal mode.
			preloadThumbnails:   1,       // Enable preload thumbnails images.
			thumbnailNav:        'basic', // Thumbnail navigation type. Can be: 'basic', 'centered', 'forceCentered'.
			activateOn:          'click', // Event used to activate thumbnail. Can be: click, mouseenter, ...
			scrollBy:            1,       // Thumbnails to move per one mouse scroll. 0 to disable scrolling.
			mouseDragging:       1,       // Enable navigation by dragging the thumbnailsBar with mouse cursor.
			touchDragging:       1,       // Enable navigation by dragging the thumbnailsBar with touch events.
			thumbnailSize:       0,       // Set thumbnails size. Can be: 500 and '100%'.
			thumbnailBuilder:             // Thumbnail item generator.
				function (index, thumbnail) {
					return '<li><img src="' + thumbnail + '" /></li>';
				}
		},

		// Commands
		commands: {
			thumbnails:     0, // Enable thumbnails navigation.
			pages:          0, // Enable pages navigation.
			buttons:        0  // Enable navigation buttons.
		},

		// Navigation buttons
		buttons: {
			forward:    null, // Selector or DOM element for "forward movement" button.
			backward:   null, // Selector or DOM element for "backward movement" button.
			prev:       null, // Selector or DOM element for "previous slide" button.
			next:       null, // Selector or DOM element for "next slide" button.
			prevPage:   null, // Selector or DOM element for "previous page" button.
			nextPage:   null, // Selector or DOM element for "next page" button.
			fullScreen: null  // Selector or DOM element for "fullscreen" button.
		},

		// Automated cycling
		cycling: {
			cycleBy:       null, // Enable automatic cycling by 'slides' or 'pages'.
			pauseTime:     5000, // Delay between cycles in milliseconds.
			loop:          1,    // Repeat cycling when last slide/page is activated.
			pauseOnHover:  0,    // Pause cycling when mouse hovers over the FRAME.
			startPaused:   0     // Whether to start in paused sate.
		},

		// Parallax
		parallax: {
			x:               1,   // Move in X axis parallax layers. where: 1 = enable, 0 = disable.
			y:               1,   // Move in Y axis parallax layers. where: 1 = enable, 0 = disable.
			z:               0,   // Move in Z axis parallax layers. where: 1 = enable, 0 = disable.
			invertX:         1,   // Invert X axis movements. where: 1 = enable, 0 = disable.
			invertY:         1,   // Invert Y axis movements. where: 1 = enable, 0 = disable.
			revert:          1,   // Whether the layers should revert to theirs start position when mouse leaved the slider. where: 1 = enable, 0 = disable.
			revertDuration:  200  // The duration of the revert animation, in milliseconds.
		},

		// Classes
		classes: {
			isTouchClass:        'isTouch',        // Class for when device has touch ability.
			draggedClass:        'dragged',        // Class for dragged SLIDEELEMENT.
			activeClass:         'active',         // Class for active slides and pages.
			disabledClass:       'disabled',       // Class for disabled navigation elements.
			verticalClass:       'vertical',       // Class for vertical sliding mode.
			horizontalClass:     'horizontal',     // Class for horizontal sliding mode.
			showedLayersClass:   'showed',         // Class for showed layers.
			isInFullScreen:      'isInFullScreen'  // Class for when slider is in fullscreen
		}
	};
	
})(jQuery, this);