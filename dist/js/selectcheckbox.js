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
			items     : [],
			name      : '',
			width     : 'auto',
			height    : 'auto',
			ajax      : null,
			icon      : '<i class="fa fa-caret-down"></i>',
			mapping   : {
				label : 'label',
				value : 'value'
			},
			onChanged : null
		}, options);

		return this.each(function() {
			var $this = $(this);
			$this.empty();

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

				$.ajax({
					url      : settings.ajax.url,
					method   : 'GET',
					data     : settings.ajax.data,
					dataType : 'json',
					success  : function(response) {
						settings.items = response;
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
				if (settings.items && settings.items.length > 0) {
					$.each(settings.items, function(index, item) {
						var label = item[settings.mapping.label];
						if (typeof settings.mapping.label === 'function') {
							label = settings.mapping.label(item);
						}

						var $item = $(`<label title="${label}"><input type="checkbox" name="${settings.name}[]" value="${item[settings.mapping.value]}">${label}</label>`);
						$dropdown.append($item);
					});
				}


				$dropdown.prepend($selectAll);

				// Toggle dropdown on label click
				$wrapper.on('click', function(e) {
					e.stopPropagation();
					$dropdown.toggle();
					hideOtherDropdowns();
				});

				// Close dropdown on outside click
				$(document).on('click', function() {
					$dropdown.hide();
				});

				// Prevent dropdown from closing when clicking on it
				$dropdown.on('click', function(e) {
					e.stopPropagation();
					hideOtherDropdowns();
				});

				// Handle checkbox changes
				$dropdown.find('input[type="checkbox"]:not(.select-all)').on('change', function() {
					updateLabel();
					detectSelectAll();
					if (typeof settings.onChanged === 'function') {
						settings.onChanged(getSelectedValues());
					}
				});

				// Handle "Select All" checkbox
				$selectAll.find('input[type="checkbox"]').on('change', function() {
					var isChecked = $(this).prop('checked');
					$dropdown.find('input[type="checkbox"]').prop('checked', isChecked);
					updateLabel();
					if (typeof settings.onChanged === 'function') {
						settings.onChanged(getSelectedValues());
					}
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

			function hideOtherDropdowns() {
				if (openSelectCheckbox && openSelectCheckbox !== $wrapper) {
					openSelectCheckbox.find('.selectcheckbox-dropdown').hide();

				}
				openSelectCheckbox = $wrapper;
			}

			function generateRandomId() {
				return Math.random().toString(16).substr(2, 8);
			}

			function getSelectedValues() {
				return $dropdown.find('input[type="checkbox"]:checked:not(.select-all)').map(function() {
					return $(this).val();
				}).get();
			}
		});
	};
})(jQuery);
