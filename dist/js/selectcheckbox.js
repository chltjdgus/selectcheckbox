(function($) {
	var openSelectCheckbox = null;

	$.fn.selectcheckbox = function(options) {
		var defaultLocale = {
			"title"         : 'Select options',
			"selectedTitle" : "Selected",
			"AllSelect"     : 'All Select',
		};

		var locale   = options.locale || defaultLocale;
		var settings = $.extend({
			items   : [],
			name    : '',
			width   : 'auto',
			height  : 'auto',
			ajax    : null,
			icon    : '<i class="fa fa-caret-down"></i>',
			mapping : {
				label : 'label',
				value : 'value'
			}
		}, options);

		return this.each(function() {
			var $this  = $(this);
			var isOpen = false;

			// Create a wrapper div for $label and $dropdown
			var randomId = generateRandomId();
			var $wrapper = $(`<div class="selectcheckbox-wrapper" id="${options.name}-${randomId}"></div>`);
			$this.append($wrapper);

			var $label            = $(`<span class="selectcheckbox-label">${locale.title}</span>`);
			var $dropdown_wrapper = $('<div class="selectcheckbox-dropdown-wrapper"></div>');
			var $dropdown         = $('<div class="selectcheckbox-dropdown"></div>');
			var $icon             = $(`<span class="icon">${settings.icon}</span>`);
			var $selectAll        = $(`<label><input type="checkbox" class="select-all">${locale.AllSelect}</label>`);
			$wrapper.append($label, $icon, $dropdown_wrapper);

			$dropdown_wrapper.append($dropdown);
			// Set wrapper width
			$wrapper.css('width', settings.width);
			$wrapper.css('height', settings.height);

			if (settings.ajax) {
				// Fetch data via Ajax
				settings.ajax.processResults = settings.ajax.processResults || function(data) {
					return {
						results : data.items
					};
				};

				$.ajax({
					url      : settings.ajax.url,
					method   : 'GET',
					data     : settings.ajax.data,
					dataType : 'json',
					success  : function(response) {
						settings.items = settings.ajax.processResults(response);
						populateDropdown();
					},
					error    : function(error) {
						console.error('Error fetching data:', error);
					}
				});
			} else {
				populateDropdown();
			}

			function populateDropdown() {
				$.each(settings.items, function(index, item) {
					var label = typeof settings.mapping.label === 'function' ? settings.mapping.label(item, settings.mapping.label) : item[settings.mapping.label];
					var $item = $(`<label><input type="checkbox" name="${settings.name}[]" value="${item[settings.mapping.value]}">${label}</label>`);
					$dropdown.append($item);
				});

				$dropdown.prepend($selectAll);

				// Toggle dropdown on label click
				$wrapper.on('click', function(e) {
					e.stopPropagation();
					toggleDropdown();
				});

				// Close dropdown on outside click
				$(document).on('click', function() {
					hideDropdown();
				});

				// Prevent dropdown from closing when clicking on it
				$dropdown.on('click', function(e) {
					e.stopPropagation();
				});

				// Handle checkbox changes
				$dropdown.find('input[type="checkbox"]:not(.select-all)').on('change', function() {
					updateLabel();
					detectSelectAll();
				});

				// Handle "Select All" checkbox
				$selectAll.find('input[type="checkbox"]').on('change', function() {
					var isChecked = $(this).prop('checked');
					$dropdown.find('input[type="checkbox"]').prop('checked', isChecked);
					updateLabel();
				});

				detectSelectAll();
			}

			function detectSelectAll() {
				var selectedItems = $dropdown.find('input[type="checkbox"]:checked').not('.select-all').map(function() {
					return $(this).parent().text();
				}).get();

				if (selectedItems.length > 0 && selectedItems.length === settings.items.length) {
					$selectAll.find('input[type="checkbox"]').prop('checked', true);
				} else {
					$selectAll.find('input[type="checkbox"]').prop('checked', false);
				}
			}

			// Update label based on selected options
			function updateLabel() {
				var selectedItems = $dropdown.find('input[type="checkbox"]:checked').not('.select-all').map(function() {
					return $(this).parent().text();
				}).get();

				if (selectedItems.length > 0) {
					$label.text(selectedItems.length > 2 ? `${locale.selectedTitle} : ${selectedItems.length}` : selectedItems.join(', '));
				} else {
					$label.text(locale.title);
				}
			}

			function toggleDropdown() {
				isOpen ? hideDropdown() : showDropdown();
			}

			function showDropdown() {
				hideOtherDropdowns();
				$dropdown.show();
				isOpen = true;
			}

			function hideDropdown() {
				$dropdown.hide();
				isOpen = false;
			}

			function hideOtherDropdowns() {
				if (openSelectCheckbox && openSelectCheckbox !== $wrapper) {
					openSelectCheckbox.find('.selectcheckbox-dropdown').hide();
				}
				openSelectCheckbox = $wrapper;
			}

			function generateRandomId() {
				return Math.random().toString(16).substr(2, 8);
			}
		});
	};
})(jQuery);
