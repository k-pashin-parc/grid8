/**
 * Позволяет добавлять на любую страницу сетку 8x8 пикселей (квадратами
 * по 64 пикселя). Сетка управляемая, можно её двигать и всячески настраивать.
 */
;(function(document, options) {

	var documentBody = document.getElementsByTagName('body')[0];

	/**
	 * Объект сетки
	 */
	var Grid = function(container, options) {

		var Grid = function(container, options) {
			this.grid = null; // DOM-элемент сетки
			this.gridStyles = null; // DOM-элемент стилей сетки

			this.options = options || {};

			this.initialize.apply(this, [options]);
		};

		$.extend(Grid.prototype, {

			/**
			 * Координаты сетки
			 */
			coords: {
				x: 0,
				y: 0
			},

			/**
			 * Таблица соответствий кодов нажимаемых на клавиатуре клавиш
			 * предполагаемым действиям с таблицей
			 */
			keymap: {
				37: 'moveLeft',
				38: 'moveUp',
				39: 'moveRight',
				40: 'moveDown',
				27: 'removeGrid'
			},

			/**
			 * Конструктор
			 */
			initialize: function(options) {
				this
					.addGrid()
					.bindGrid();
			},

			/**
			 * Добавляет сетку на страницу
			 */
			addGrid: function() {
				if (!this.grid) {
					var gridContainer = document.createElement('div');

					gridContainer.className = 'da-grid';
					documentBody.appendChild(gridContainer);

					this.grid = gridContainer;

					this.appendStyles();
				}

				return this;
			},

			/**
			 * Перерисовывает сетку
			 */
			redrawGrid: function() {
				if (this.grid) {
					this.grid.style.backgroundPosition = this.coords.x + 'px ' + this.coords.y + 'px';
				}

				return this;
			},

			/**
			 * Добавляет стили для сетки
			 */
			appendStyles: function() {
				var head = document.getElementsByTagName('head'),
					stylesElement;

				if (!this.gridStyles) {
					if (this.options.styles) {
						stylesElement = document.createElement('style');
						stylesElement.type = 'text/css';
						if (stylesElement.styleSheet) {
							stylesElement.styleSheet.cssText = this.options.styles;
						} else {
							stylesElement.appendChild(document.createTextNode(this.options.styles));
						}

						if (head && head[0]) {
							head[0].appendChild(stylesElement);
						} else {
							documentBody.write('<style type="text/css">' + this.options.styles + '</styles>');
						}
					}

					this.gridStyles = stylesElement;
				}

				return this;
			},

			/**
			 * Навешивает события на сетку
			 */
			bindGrid: function() {
				$.attachEventHandler(document, 'keydown', function(event) {
					var keyCode = event.keyCode;

					$.preventDefault(event);

					if (this.keymap[keyCode] && typeof this[this.keymap[keyCode]] === 'function') {
						this[this.keymap[keyCode]]();
					}

					// Не могу разобраться почему обработчик на самом деле не детачится
					if (keyCode == 29) {
						$.detachEventHandler(document, 'keydown', arguments.callee);
					}
				}, this);

				return this;
			},

			/**
			 * Удаляет сетку
			 */
			removeGrid: function() {
				// Чистим DOM и память
				this.gridStyles && this.gridStyles.parentNode.removeChild(this.gridStyles);
				this.grid && container.removeChild(this.grid);

				this.gridStyles = this.grid = null;
			},

			/**
			 * 
			 * Управление сеткой
			 * 
			 */

			// TODO: Неплохо-бы тут впихнуть работу с координатами через сеттеры

			/**
			 * Двигает сетку влево на 1 пиксель
			 */
			moveLeft: function() {
				this.coords.x--;
				this.redrawGrid();
			},

			/**
			 * Двигает сетку вправо на 1 пиксель
			 */
			moveRight: function() {
				this.coords.x++;
				this.redrawGrid();
			},

			/**
			 * Двигает сетку вверх на 1 пиксель
			 */
			moveUp: function() {
				this.coords.y--;
				this.redrawGrid();
			},

			/**
			 * Двигает сетку вниз на 1 пиксель
			 */
			moveDown: function() {
				this.coords.y++;
				this.redrawGrid();
			},

		});

		return new Grid(container, options);

	};



	/**
	 * Наш собственный ручной "jQuery" с блекджеком и маркитантками
	 */
	var $ = function() {

		/**
		 * Применяет контекст к методу
		 * @param {!Object} obj - контекст
		 * @param {function(?Object)} method - метод
		 * @return {Object}
		 */
		var _contextOf = function(obj, method) {
				return function() {
					method.apply(obj, arguments);
				};
			},

			/**
			 * Итератор по объекту
			 * @param {!Object} obj - объект
			 * @param {function(?Object)} method - метод для итерирования
			 * @param {?Object} context - контекст выполнения итератора
			 */
			_each = function(obj, iterator, context) {
				var breaker = {};

				for (var key in obj) {
					if (hasOwnProperty.call(obj, key)) {
						if (iterator.call(context, obj[key], key, obj) === breaker) return;
					}
				}
			};

		return {

			/**
			 * Расширяет текущий объект данными объекта-источника
			 * @param {!Object} obj - источник
			 */
			extend: function(obj) {
				_each(Array.prototype.slice.call(arguments, 1), function(source) {
					for (var prop in source) {
						if (source[prop] !== void 0) obj[prop] = source[prop];
					}
				});

				return obj;
			},

			/**
			 * Навешивает событие, сохраняя контекст
			 * @param {!Object} element - элемент-источник события
			 * @param {string} eventString - имя события
			 * @param {function(?Object)} handler - обработчик события
			 * @param {?Object} - контекст выполнения обработчика
			 */
			attachEventHandler: function(element, eventString, handler, context) {
				if (typeof context != 'undefined' && context) {
					if (element.addEventListener) { // W3C DOM
						element.addEventListener(eventString, _contextOf(context, handler), false);
					} else if (element.attachEvent) {// IE DOM
						element.attachEvent('on' + eventString, _contextOf(context, handler));
					}
				} else {
					if (element.addEventListener) {// W3C DOM
						element.addEventListener(eventString, handler, false);
					} else if (element.attachEvent) {// IE DOM
						element.attachEvent('on' + eventString, handler);
					}
				}
			},

			/**
			 * Удаляет обработчик события с заданного элемента
			 * @param {!Object} element - элемент-источник события
			 * @param {string} eventString - имя события
			 * @param {function(?Object)} handler - обработчик события
			 */
			detachEventHandler: function(element, eventString, handler) {
				if (element.removeEventListener) {
					element.removeEventListener(eventString, handler, false);
				} else if (element.detachEvent) {
					element.detachEvent('on' + eventString, handler);
				}
			},

			/**
			 * Предотвращает стандартное действие события
			 * @param {!Object} e - событие
			 */
			preventDefault: function(e) {
				e = e || win.event;
				if (e.preventDefault) {
					e.preventDefault();
				}
				e.returnValue = false; // IE
			},

			/**
			 * Останавливает всплытие события
			 * @param {!Object} e - событие
			 */
			stopEventPropagation: function(e) {
				e = e || win.event;

				if (e.stopPropagation) {
					e.stopPropagation();
				}
				e.cancelBubble = true; // IE
			},

		}

	}();

	// Создадим новый объект сетки
	return new Grid(documentBody, options);

}(document,

	/**
	 * Объект настроек для букмарклета
	 */
	{
		// Стили для сетки
		styles: '.da-grid { background: url(data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RThBRjhBQkUxNkE1MTFFMkFFNEVBRTc4Q0U5NzVBNUQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RThBRjhBQkYxNkE1MTFFMkFFNEVBRTc4Q0U5NzVBNUQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFOEFGOEFCQzE2QTUxMUUyQUU0RUFFNzhDRTk3NUE1RCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFOEFGOEFCRDE2QTUxMUUyQUU0RUFFNzhDRTk3NUE1RCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv4pHmkAAADvSURBVHja7NnBDoIwEIRhajhrfP93VPEFsDXqrU0TaCrw7YHLFrb5k3YmQzhfrvPQsZ7TfYh76DZ/TI/pcQu5BSGEOVbTfoSQFnWZfxoOXgAAAAAAh67xKxWlRa37sea4psv8N4Ckk4UNpJdDafNb7jsCP0x5J5btrdXvOZ8KAACAS5AP2LPO8wE1R2CpTv97f7EPKH1gjX7r+VQAAADyd9xHJo5bFT9Gdt3nA2p8gDyACgAAgDxAHiAP4AP4ACoAAADyAHmAPIAP4AOoAAAAyAPkAfIAPoAPoAIAACAPkAfIA/gAPoAKAADAVuslwACDyTgEJQAEbwAAAABJRU5ErkJggg==; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999 }'
	}
));