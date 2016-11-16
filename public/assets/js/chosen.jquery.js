(function () {
    var e, t, n, r, i, s = {}.hasOwnProperty, o = function (e, t) {
        function r() {
            this.constructor = e
        }

        for (var n in t) {
            if (s.call(t, n))e[n] = t[n]
        }
        r.prototype = t.prototype;
        e.prototype = new r;
        e.__super__ = t.prototype;
        return e
    };
    r = function () {
        function e() {
            this.options_index = 0;
            this.parsed = []
        }

        e.prototype.add_node = function (e) {
            if (e.nodeName.toUpperCase() === "OPTGROUP") {
                return this.add_group(e)
            } else {
                return this.add_option(e)
            }
        };
        e.prototype.add_group = function (e) {
            var t, n, r, i, s, o;
            t = this.parsed.length;
            this.parsed.push({
                array_index: t,
                group: true,
                label: this.escapeExpression(e.label),
                children: 0,
                disabled: e.disabled
            });
            s = e.childNodes;
            o = [];
            for (r = 0, i = s.length; r < i; r++) {
                n = s[r];
                o.push(this.add_option(n, t, e.disabled))
            }
            return o
        };
        e.prototype.add_option = function (e, t, n) {
            if (e.nodeName.toUpperCase() === "OPTION") {
                if (e.text !== "") {
                    if (t != null) {
                        this.parsed[t].children += 1
                    }
                    this.parsed.push({
                        array_index: this.parsed.length,
                        options_index: this.options_index,
                        value: e.value,
                        text: e.text,
                        html: e.innerHTML,
                        selected: e.selected,
                        disabled: n === true ? n : e.disabled,
                        group_array_index: t,
                        classes: e.className,
                        style: e.style.cssText
                    })
                } else {
                    this.parsed.push({array_index: this.parsed.length, options_index: this.options_index, empty: true})
                }
                return this.options_index += 1
            }
        };
        e.prototype.escapeExpression = function (e) {
            var t, n;
            if (e == null || e === false) {
                return ""
            }
            if (!/[\&\<\>\"\'\`]/.test(e)) {
                return e
            }
            t = {"<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;"};
            n = /&(?!\w+;)|[\<\>\"\'\`]/g;
            return e.replace(n, function (e) {
                return t[e] || "&"
            })
        };
        return e
    }();
    r.select_to_array = function (e) {
        var t, n, i, s, o;
        n = new r;
        o = e.childNodes;
        for (i = 0, s = o.length; i < s; i++) {
            t = o[i];
            n.add_node(t)
        }
        return n.parsed
    };
    t = function () {
        function e(t, n) {
            this.form_field = t;
            this.options = n != null ? n : {};
            if (!e.browser_is_supported()) {
                return
            }
            this.is_multiple = this.form_field.multiple;
            this.set_default_text();
            this.set_default_values();
            this.setup();
            this.set_up_html();
            this.register_observers()
        }

        e.prototype.set_default_values = function () {
            var e = this;
            this.click_test_action = function (t) {
                return e.test_active_click(t)
            };
            this.activate_action = function (t) {
                return e.activate_field(t)
            };
            this.active_field = false;
            this.mouse_on_container = false;
            this.results_showing = false;
            this.result_highlighted = null;
            this.result_single_selected = null;
            this.allow_single_deselect = this.options.allow_single_deselect != null && this.form_field.options[0] != null && this.form_field.options[0].text === "" ? this.options.allow_single_deselect : false;
            this.disable_search_threshold = this.options.disable_search_threshold || 0;
            this.disable_search = this.options.disable_search || false;
            this.enable_split_word_search = this.options.enable_split_word_search != null ? this.options.enable_split_word_search : true;
            this.group_search = this.options.group_search != null ? this.options.group_search : true;
            this.search_contains = this.options.search_contains || false;
            this.single_backstroke_delete = this.options.single_backstroke_delete != null ? this.options.single_backstroke_delete : true;
            this.max_selected_options = this.options.max_selected_options || Infinity;
            this.inherit_select_classes = this.options.inherit_select_classes || false;
            this.display_selected_options = this.options.display_selected_options != null ? this.options.display_selected_options : true;
            return this.display_disabled_options = this.options.display_disabled_options != null ? this.options.display_disabled_options : true
        };
        e.prototype.set_default_text = function () {
            if (this.form_field.getAttribute("data-placeholder")) {
                this.default_text = this.form_field.getAttribute("data-placeholder")
            } else if (this.is_multiple) {
                this.default_text = this.options.placeholder_text_multiple || this.options.placeholder_text || e.default_multiple_text
            } else {
                this.default_text = this.options.placeholder_text_single || this.options.placeholder_text || e.default_single_text
            }
            return this.results_none_found = this.form_field.getAttribute("data-no_results_text") || this.options.no_results_text || e.default_no_result_text
        };
        e.prototype.mouse_enter = function () {
            return this.mouse_on_container = true
        };
        e.prototype.mouse_leave = function () {
            return this.mouse_on_container = false
        };
        e.prototype.input_focus = function (e) {
            var t = this;
            if (this.is_multiple) {
                if (!this.active_field) {
                    return setTimeout(function () {
                        return t.container_mousedown()
                    }, 50)
                }
            } else {
                if (!this.active_field) {
                    return this.activate_field()
                }
            }
        };
        e.prototype.input_blur = function (e) {
            var t = this;
            if (!this.mouse_on_container) {
                this.active_field = false;
                return setTimeout(function () {
                    return t.blur_test()
                }, 100)
            }
        };
        e.prototype.results_option_build = function (e) {
            var t, n, r, i, s;
            t = "";
            s = this.results_data;
            for (r = 0, i = s.length; r < i; r++) {
                n = s[r];
                if (n.group) {
                    t += this.result_add_group(n)
                } else {
                    t += this.result_add_option(n)
                }
                if (e != null ? e.first : void 0) {
                    if (n.selected && this.is_multiple) {
                        this.choice_build(n)
                    } else if (n.selected && !this.is_multiple) {
                        this.single_set_selected_text(n.text)
                    }
                }
            }
            return t
        };
        e.prototype.result_add_option = function (e) {
            var t, n;
            if (!e.search_match) {
                return ""
            }
            if (!this.include_option_in_results(e)) {
                return ""
            }
            t = [];
            if (!e.disabled && !(e.selected && this.is_multiple)) {
                t.push("active-result")
            }
            if (e.disabled && !(e.selected && this.is_multiple)) {
                t.push("disabled-result")
            }
            if (e.selected) {
                t.push("result-selected")
            }
            if (e.group_array_index != null) {
                t.push("group-option")
            }
            if (e.classes !== "") {
                t.push(e.classes)
            }
            n = e.style.cssText !== "" ? ' style="' + e.style + '"' : "";
            return '<li class="' + t.join(" ") + '"' + n + ' data-option-array-index="' + e.array_index + '">' + e.search_text + "</li>"
        };
        e.prototype.result_add_group = function (e) {
            if (!(e.search_match || e.group_match)) {
                return ""
            }
            if (!(e.active_options > 0)) {
                return ""
            }
            return '<li class="group-result">' + e.search_text + "</li>"
        };
        e.prototype.results_update_field = function () {
            this.set_default_text();
            if (!this.is_multiple) {
                this.results_reset_cleanup()
            }
            this.result_clear_highlight();
            this.result_single_selected = null;
            this.results_build();
            if (this.results_showing) {
                return this.winnow_results()
            }
        };
        e.prototype.results_toggle = function () {
            if (this.results_showing) {
                return this.results_hide()
            } else {
                return this.results_show()
            }
        };
        e.prototype.results_search = function (e) {
            if (this.results_showing) {
                return this.winnow_results()
            } else {
                return this.results_show()
            }
        };
        e.prototype.winnow_results = function () {
            var e, t, n, r, i, s, o, u, a, f, l, c, h, tt;
            this.no_results_clear();
            i = 0;
            o = this.get_search_text();
            e = o.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            r = this.search_contains ? "" : "^";
            n = new RegExp(r + e, "i");
            f = new RegExp(e, "i");
            h = this.results_data;
            for (l = 0, c = h.length; l < c; l++) {
                t = h[l];
                t.search_match = false;
                s = null;
                if (this.include_option_in_results(t)) {
                    if (t.group) {
                        t.group_match = false;
                        t.active_options = 0
                    }
                    if (t.group_array_index != null && this.results_data[t.group_array_index]) {
                        s = this.results_data[t.group_array_index];
                        if (s.active_options === 0 && s.search_match) {
                            i += 1
                        }
                        s.active_options += 1
                    }
                    if (!(t.group && !this.group_search)) {
                        t.search_text = t.group ? t.label : t.html;
                        t.search_match = this.search_string_match(t.search_text, n);
                        if (t.search_match && !t.group) {
                            i += 1
                        }
                        if (t.search_match) {
                            if (o.length) {
                                u = t.search_text.search(f);
                                // fix for related accents search.
								if (u != 0) {
									var tt = gd_replace_accents(t.search_text);
									u = tt.search(f);
								}
								//
								a = t.search_text.substr(0, u + o.length) + "</em>" + t.search_text.substr(u + o.length);
                                t.search_text = a.substr(0, u) + "<em>" + a.substr(u)
                            }
                            if (s != null) {
                                s.group_match = true
                            }
                        } else if (t.group_array_index != null && this.results_data[t.group_array_index].search_match) {
                            t.search_match = true
                        }
                    }
                }
            }
            this.result_clear_highlight();
            if (i < 1 && o.length) {
                this.update_results_content("");
                return this.no_results(o)
            } else {
                this.update_results_content(this.results_option_build());
                return this.winnow_results_set_highlight()
            }
        };
        e.prototype.search_string_match = function (e, t) {
            var n, r, i, s, et;
            if (t.test(e)) {
                return true
            } else if (this.enable_split_word_search && (e.indexOf(" ") >= 0 || e.indexOf("[") === 0)) {
                r = e.replace(/\[|\]/g, "").split(" ");
                if (r.length) {
                    for (i = 0, s = r.length; i < s; i++) {
                        n = r[i];
                        if (t.test(n)) {
                            return true
                        }
                    }
                }
				
				// fix for related accents search.
				et = gd_replace_accents(e);
				r = et.replace(/\[|\]/g, "").split(" ");
				if (r.length) {
					for (i = 0, s = r.length; i < s; i++) {
						n = r[i];
						if (t.test(n)) {
							return true;
						}
					}
				}
				//
            } else { // fix for related accents search.
				et = gd_replace_accents(e);
				if (t.test(et)) {
					return true;
				}
			}
			//
        };
        e.prototype.choices_count = function () {
            var e, t, n, r;
            if (this.selected_option_count != null) {
                return this.selected_option_count
            }
            this.selected_option_count = 0;
            r = this.form_field.options;
            for (t = 0, n = r.length; t < n; t++) {
                e = r[t];
                if (e.selected) {
                    this.selected_option_count += 1
                }
            }
            return this.selected_option_count
        };
        e.prototype.choices_click = function (e) {
            e.preventDefault();
            if (!(this.results_showing || this.is_disabled)) {
                return this.results_show()
            }
        };
        e.prototype.keyup_checker = function (e) {
            var t, n;
            t = (n = e.which) != null ? n : e.keyCode;
            this.search_field_scale();
            switch (t) {
                case 8:
                    if (this.is_multiple && this.backstroke_length < 1 && this.choices_count() > 0) {
                        return this.keydown_backstroke()
                    } else if (!this.pending_backstroke) {
                        this.result_clear_highlight();
                        return this.results_search()
                    }
                    break;
                case 13:
                    e.preventDefault();
                    if (this.results_showing) {
                        return this.result_select(e)
                    }
                    break;
                case 27:
                    if (this.results_showing) {
                        this.results_hide()
                    }
                    return true;
                case 9:
                case 38:
                case 40:
                case 16:
                case 91:
                case 17:
                    break;
                default:
                    return this.results_search()
            }
        };
        e.prototype.container_width = function () {
            if (this.options.width != null) {
                return this.options.width
            } else {
                return "" + this.form_field.offsetWidth + "px"
            }
        };
        e.prototype.include_option_in_results = function (e) {
            if (this.is_multiple && !this.display_selected_options && e.selected) {
                return false
            }
            if (!this.display_disabled_options && e.disabled) {
                return false
            }
            if (e.empty) {
                return false
            }
            return true
        };
        e.browser_is_supported = function () {
            if (window.navigator.appName === "Microsoft Internet Explorer") {
                return document.documentMode >= 8
            }
            if (/iP(od|hone)/i.test(window.navigator.userAgent)) {
                return false
            }
            if (/Android/i.test(window.navigator.userAgent)) {
                if (/Mobile/i.test(window.navigator.userAgent)) {
                    return false
                }
            }
            return true
        };
        e.default_multiple_text = "Select Some Options";
        e.default_single_text = "Select an Option";
        e.default_no_result_text = "No results match";
        return e
    }();
    e = jQuery;
    e.fn.extend({
        chosen: function (r) {
            if (!t.browser_is_supported()) {
                return this
            }
            return this.each(function (t) {
                var i, s;
                i = e(this);
                s = i.data("chosen");
                if (r === "destroy" && s) {
                    s.destroy()
                } else if (!s) {
                    i.data("chosen", new n(this, r))
                }
            })
        }
    });
    n = function (t) {
        function n() {
            i = n.__super__.constructor.apply(this, arguments);
            return i
        }

        o(n, t);
        n.prototype.setup = function () {
            this.form_field_jq = e(this.form_field);
            this.current_selectedIndex = this.form_field.selectedIndex;
            return this.is_rtl = this.form_field_jq.hasClass("chosen-rtl")
        };
        n.prototype.set_up_html = function () {
            var t, n;
            t = ["uwp-chosen-container"];
            t.push("uwp-chosen-container-" + (this.is_multiple ? "multi" : "single"));
            if (this.inherit_select_classes && this.form_field.className) {
                t.push(this.form_field.className)
            }
            if (this.is_rtl) {
                t.push("chosen-rtl")
            }
            n = {"class": t.join(" "), style: "width: " + this.container_width() + ";", title: this.form_field.title};
            if (this.form_field.id.length) {
                n.id = this.form_field.id.replace(/[^\w]/g, "_") + "_chosen"
            }
            this.container = e("<div />", n);
            if (this.is_multiple) {
                this.container.html('<div class="chosen-choices"><li class="search-field"><input type="text" value="' + this.default_text + '" class="default" autocomplete="off" style="width:25px;" /></li></div><div class="chosen-drop"><div class="chosen-results"></div></div>')
            } else {
                this.container.html('<a class="chosen-single chosen-default" tabindex="-1"><span>' + this.default_text + '</span><div><b></b></div></a><div class="chosen-drop"><div class="chosen-search"><input type="text" autocomplete="off" /></div><div class="chosen-results"></div></div>')
            }
            this.form_field_jq.hide().after(this.container);
            this.dropdown = this.container.find("div.chosen-drop").first();
            this.search_field = this.container.find("input").first();
            this.search_results = this.container.find("div.chosen-results").first();
            this.search_field_scale();
            this.search_no_results = this.container.find("li.no-results").first();
            if (this.is_multiple) {
                this.search_choices = this.container.find("div.chosen-choices").first();
                this.search_container = this.container.find("li.search-field").first()
            } else {
                this.search_container = this.container.find("div.chosen-search").first();
                this.selected_item = this.container.find(".chosen-single").first()
            }
            this.results_build();
            this.set_tab_index();
            this.set_label_behavior();
            return this.form_field_jq.trigger("chosen:ready", {chosen: this})
        };
        n.prototype.register_observers = function () {
            var e = this;
            this.container.bind("mousedown.chosen", function (t) {
                e.container_mousedown(t)
            });
            this.container.bind("mouseup.chosen", function (t) {
                e.container_mouseup(t)
            });
            this.container.bind("mouseenter.chosen", function (t) {
                e.mouse_enter(t)
            });
            this.container.bind("mouseleave.chosen", function (t) {
                e.mouse_leave(t)
            });
            this.search_results.bind("mouseup.chosen", function (t) {
                e.search_results_mouseup(t)
            });
            this.search_results.bind("mouseover.chosen", function (t) {
                e.search_results_mouseover(t)
            });
            this.search_results.bind("mouseout.chosen", function (t) {
                e.search_results_mouseout(t)
            });
            this.search_results.bind("mousewheel.chosen DOMMouseScroll.chosen", function (t) {
                e.search_results_mousewheel(t)
            });
            this.form_field_jq.bind("chosen:updated.chosen", function (t) {
                e.results_update_field(t)
            });
            this.form_field_jq.bind("chosen:activate.chosen", function (t) {
                e.activate_field(t)
            });
            this.form_field_jq.bind("chosen:open.chosen", function (t) {
                e.container_mousedown(t)
            });
            this.search_field.bind("blur.chosen", function (t) {
                e.input_blur(t)
            });
            this.search_field.bind("keyup.chosen", function (t) {
                e.keyup_checker(t)
            });
            this.search_field.bind("keydown.chosen", function (t) {
                e.keydown_checker(t)
            });
            this.search_field.bind("focus.chosen", function (t) {
                e.input_focus(t)
            });
            if (this.is_multiple) {
                return this.search_choices.bind("click.chosen", function (t) {
                    e.choices_click(t)
                })
            } else {
                return this.container.bind("click.chosen", function (e) {
                    e.preventDefault()
                })
            }
        };
        n.prototype.destroy = function () {
            e(document).unbind("click.chosen", this.click_test_action);
            if (this.search_field[0].tabIndex) {
                this.form_field_jq[0].tabIndex = this.search_field[0].tabIndex
            }
            this.container.remove();
            this.form_field_jq.removeData("chosen");
            return this.form_field_jq.show()
        };
        n.prototype.search_field_disabled = function () {
            this.is_disabled = this.form_field_jq[0].disabled;
            if (this.is_disabled) {
                this.container.addClass("chosen-disabled");
                this.search_field[0].disabled = true;
                if (!this.is_multiple) {
                    this.selected_item.unbind("focus.chosen", this.activate_action)
                }
                return this.close_field()
            } else {
                this.container.removeClass("chosen-disabled");
                this.search_field[0].disabled = false;
                if (!this.is_multiple) {
                    return this.selected_item.bind("focus.chosen", this.activate_action)
                }
            }
        };
        n.prototype.container_mousedown = function (t) {
            if (!this.is_disabled) {
                if (t && t.type === "mousedown" && !this.results_showing) {
                    t.preventDefault()
                }
                if (!(t != null && e(t.target).hasClass("search-choice-close"))) {
                    if (!this.active_field) {
                        if (this.is_multiple) {
                            this.search_field.val("")
                        }
                        e(document).bind("click.chosen", this.click_test_action);
                        this.results_show()
                    } else if (!this.is_multiple && t && (e(t.target)[0] === this.selected_item[0] || e(t.target).parents("a.chosen-single").length)) {
                        t.preventDefault();
                        this.results_toggle()
                    }
                    return this.activate_field()
                }
            }
        };
        n.prototype.container_mouseup = function (e) {
            if (e.target.nodeName === "ABBR" && !this.is_disabled) {
                return this.results_reset(e)
            }
        };
        n.prototype.search_results_mousewheel = function (e) {
            var t, n, r;
            t = -((n = e.originalEvent) != null ? n.wheelDelta : void 0) || ((r = e.originialEvent) != null ? r.detail : void 0);
            if (t != null) {
                e.preventDefault();
                if (e.type === "DOMMouseScroll") {
                    t = t * 40
                }
                return this.search_results.scrollTop(t + this.search_results.scrollTop())
            }
        };
        n.prototype.blur_test = function (e) {
            if (!this.active_field && this.container.hasClass("uwp-chosen-container-active")) {
                return this.close_field()
            }
        };
        n.prototype.close_field = function () {
            e(document).unbind("click.chosen", this.click_test_action);
            this.active_field = false;
            this.results_hide();
            this.container.removeClass("uwp-chosen-container-active");
            this.clear_backstroke();
            this.show_search_field_default();
            return this.search_field_scale()
        };
        n.prototype.activate_field = function () {
            this.container.addClass("uwp-chosen-container-active");
            this.active_field = true;
            this.search_field.val(this.search_field.val());
            return this.search_field.focus()
        };
        n.prototype.test_active_click = function (t) {
            if (this.container.is(e(t.target).closest(".uwp-chosen-container"))) {
                return this.active_field = true
            } else {
                return this.close_field()
            }
        };
        n.prototype.results_build = function () {
            this.parsing = true;
            this.selected_option_count = null;
            this.results_data = r.select_to_array(this.form_field);
            if (this.is_multiple) {
                this.search_choices.find("li.search-choice").remove()
            } else if (!this.is_multiple) {
                this.single_set_selected_text();
                if (this.disable_search || this.form_field.options.length <= this.disable_search_threshold) {
                    this.search_field[0].readOnly = true;
                    this.container.addClass("uwp-chosen-container-single-nosearch")
                } else {
                    this.search_field[0].readOnly = false;
                    this.container.removeClass("uwp-chosen-container-single-nosearch")
                }
            }
            this.update_results_content(this.results_option_build({first: true}));
            this.search_field_disabled();
            this.search_field_scale();
            return this.parsing = false
        };
        n.prototype.result_do_highlight = function (e) {
            var t, n, r, i, s;
            if (e.length) {
                this.result_clear_highlight();
                this.result_highlight = e;
                this.result_highlight.addClass("highlighted");
                r = parseInt(this.search_results.css("maxHeight"), 10);
                s = this.search_results.scrollTop();
                i = r + s;
                n = this.result_highlight.position().top + this.search_results.scrollTop();
                t = n + this.result_highlight.outerHeight();
                if (t >= i) {
                    return this.search_results.scrollTop(t - r > 0 ? t - r : 0)
                } else if (n < s) {
                    return this.search_results.scrollTop(n)
                }
            }
        };
        n.prototype.result_clear_highlight = function () {
            if (this.result_highlight) {
                this.result_highlight.removeClass("highlighted")
            }
            return this.result_highlight = null
        };
        n.prototype.results_show = function () {
            if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
                this.form_field_jq.trigger("chosen:maxselected", {chosen: this});
                return false
            }
            this.container.addClass("chosen-with-drop");
            this.form_field_jq.trigger("chosen:showing_dropdown", {chosen: this});
            this.results_showing = true;
            this.search_field.focus();
            this.search_field.val(this.search_field.val());
            return this.winnow_results()
        };
        n.prototype.update_results_content = function (e) {
            return this.search_results.html(e)
        };
        n.prototype.results_hide = function () {
            if (this.results_showing) {
                this.result_clear_highlight();
                this.container.removeClass("chosen-with-drop");
                this.form_field_jq.trigger("chosen:hiding_dropdown", {chosen: this})
            }
            return this.results_showing = false
        };
        n.prototype.set_tab_index = function (e) {
            var t;
            if (this.form_field.tabIndex) {
                t = this.form_field.tabIndex;
                this.form_field.tabIndex = -1;
                return this.search_field[0].tabIndex = t
            }
        };
        n.prototype.set_label_behavior = function () {
            var t = this;
            this.form_field_label = this.form_field_jq.parents("label");
            if (!this.form_field_label.length && this.form_field.id.length) {
                this.form_field_label = e("label[for='" + this.form_field.id + "']")
            }
            if (this.form_field_label.length > 0) {
                return this.form_field_label.bind("click.chosen", function (e) {
                    if (t.is_multiple) {
                        return t.container_mousedown(e)
                    } else {
                        return t.activate_field()
                    }
                })
            }
        };
        n.prototype.show_search_field_default = function () {
            if (this.is_multiple && this.choices_count() < 1 && !this.active_field) {
                this.search_field.val(this.default_text);
                return this.search_field.addClass("default")
            } else {
                this.search_field.val("");
                return this.search_field.removeClass("default")
            }
        };
        n.prototype.search_results_mouseup = function (t) {
            var n;
            n = e(t.target).hasClass("active-result") ? e(t.target) : e(t.target).parents(".active-result").first();
            if (n.length) {
                this.result_highlight = n;
                this.result_select(t);
                return this.search_field.focus()
            }
        };
        n.prototype.search_results_mouseover = function (t) {
            var n;
            n = e(t.target).hasClass("active-result") ? e(t.target) : e(t.target).parents(".active-result").first();
            if (n) {
                return this.result_do_highlight(n)
            }
        };
        n.prototype.search_results_mouseout = function (t) {
            if (e(t.target).hasClass("active-result" || e(t.target).parents(".active-result").first())) {
                return this.result_clear_highlight()
            }
        };
        n.prototype.choice_build = function (t) {
            var n, r, i = this;
            n = e("<li />", {"class": "search-choice"}).html("<span>" + t.html + "</span>");
            if (t.disabled) {
                n.addClass("search-choice-disabled")
            } else {
                r = e("<a />", {"class": "search-choice-close", "data-option-array-index": t.array_index});
                r.bind("click.chosen", function (e) {
                    return i.choice_destroy_link_click(e)
                });
                n.append(r)
            }
            return this.search_container.before(n)
        };
        n.prototype.choice_destroy_link_click = function (t) {
            t.preventDefault();
            t.stopPropagation();
            if (!this.is_disabled) {
                return this.choice_destroy(e(t.target))
            }
        };
        n.prototype.choice_destroy = function (e) {
            if (this.result_deselect(e[0].getAttribute("data-option-array-index"))) {
                this.show_search_field_default();
                if (this.is_multiple && this.choices_count() > 0 && this.search_field.val().length < 1) {
                    this.results_hide()
                }
                e.parents("li").first().remove();
                return this.search_field_scale()
            }
        };
        n.prototype.results_reset = function () {
            this.form_field.options[0].selected = true;
            this.selected_option_count = null;
            this.single_set_selected_text();
            this.show_search_field_default();
            this.results_reset_cleanup();
            this.form_field_jq.trigger("change");
            if (this.active_field) {
                return this.results_hide()
            }
        };
        n.prototype.results_reset_cleanup = function () {
            this.current_selectedIndex = this.form_field.selectedIndex;
            return this.selected_item.find("abbr").remove()
        };
        n.prototype.result_select = function (e) {
            var t, n, r;
            if (this.result_highlight) {
                t = this.result_highlight;
                this.result_clear_highlight();
                if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
                    this.form_field_jq.trigger("chosen:maxselected", {chosen: this});
                    return false
                }
                if (this.is_multiple) {
                    t.removeClass("active-result")
                } else {
                    if (this.result_single_selected) {
                        this.result_single_selected.removeClass("result-selected");
                        r = this.result_single_selected[0].getAttribute("data-option-array-index");
                        this.results_data[r].selected = false
                    }
                    this.result_single_selected = t
                }
                t.addClass("result-selected");
                n = this.results_data[t[0].getAttribute("data-option-array-index")];
                n.selected = true;
                this.form_field.options[n.options_index].selected = true;
                this.selected_option_count = null;
                if (this.is_multiple) {
                    this.choice_build(n)
                } else {
                    this.single_set_selected_text(n.text)
                }
                if (!((e.metaKey || e.ctrlKey) && this.is_multiple)) {
                    this.results_hide()
                }
                this.search_field.val("");
                if (this.is_multiple || this.form_field.selectedIndex !== this.current_selectedIndex) {
                    this.form_field_jq.trigger("change", {selected: this.form_field.options[n.options_index].value})
                }
                this.current_selectedIndex = this.form_field.selectedIndex;
                return this.search_field_scale()
            }
        };
        n.prototype.single_set_selected_text = function (e) {
            if (e == null) {
                e = this.default_text
            }
            if (e === this.default_text) {
                this.selected_item.addClass("chosen-default")
            } else {
                this.single_deselect_control_build();
                this.selected_item.removeClass("chosen-default")
            }
            return this.selected_item.find("span").text(e)
        };
        n.prototype.result_deselect = function (e) {
            var t;
            t = this.results_data[e];
            if (!this.form_field.options[t.options_index].disabled) {
                t.selected = false;
                this.form_field.options[t.options_index].selected = false;
                this.selected_option_count = null;
                this.result_clear_highlight();
                if (this.results_showing) {
                    this.winnow_results()
                }
                this.form_field_jq.trigger("change", {deselected: this.form_field.options[t.options_index].value});
                this.search_field_scale();
                return true
            } else {
                return false
            }
        };
        n.prototype.single_deselect_control_build = function () {
            if (!this.allow_single_deselect) {
                return
            }
            if (!this.selected_item.find("abbr").length) {
                this.selected_item.find("span").first().after('<abbr class="search-choice-close"></abbr>')
            }
            return this.selected_item.addClass("chosen-single-with-deselect")
        };
        n.prototype.get_search_text = function () {
            if (this.search_field.val() === this.default_text) {
                return ""
            } else {
                return e("<div/>").text(e.trim(this.search_field.val())).html()
            }
        };
        n.prototype.winnow_results_set_highlight = function () {
            var e, t;
            t = !this.is_multiple ? this.search_results.find(".result-selected.active-result") : [];
            e = t.length ? t.first() : this.search_results.find(".active-result").first();
            if (e != null) {
                return this.result_do_highlight(e)
            }
        };
        n.prototype.no_results = function (t) {
            var n;
            n = e('<li class="no-results">' + this.results_none_found + ' "<span></span>"</li>');
            n.find("span").first().html(t);
            return this.search_results.append(n)
        };
        n.prototype.no_results_clear = function () {
            return this.search_results.find(".no-results").remove()
        };
        n.prototype.keydown_arrow = function () {
            var e;
            if (this.results_showing && this.result_highlight) {
                e = this.result_highlight.nextAll("li.active-result").first();
                if (e) {
                    return this.result_do_highlight(e)
                }
            } else {
                return this.results_show()
            }
        };
        n.prototype.keyup_arrow = function () {
            var e;
            if (!this.results_showing && !this.is_multiple) {
                return this.results_show()
            } else if (this.result_highlight) {
                e = this.result_highlight.prevAll("li.active-result");
                if (e.length) {
                    return this.result_do_highlight(e.first())
                } else {
                    if (this.choices_count() > 0) {
                        this.results_hide()
                    }
                    return this.result_clear_highlight()
                }
            }
        };
        n.prototype.keydown_backstroke = function () {
            var e;
            if (this.pending_backstroke) {
                this.choice_destroy(this.pending_backstroke.find("a").first());
                return this.clear_backstroke()
            } else {
                e = this.search_container.siblings("li.search-choice").last();
                if (e.length && !e.hasClass("search-choice-disabled")) {
                    this.pending_backstroke = e;
                    if (this.single_backstroke_delete) {
                        return this.keydown_backstroke()
                    } else {
                        return this.pending_backstroke.addClass("search-choice-focus")
                    }
                }
            }
        };
        n.prototype.clear_backstroke = function () {
            if (this.pending_backstroke) {
                this.pending_backstroke.removeClass("search-choice-focus")
            }
            return this.pending_backstroke = null
        };
        n.prototype.keydown_checker = function (e) {
            var t, n;
            t = (n = e.which) != null ? n : e.keyCode;
            this.search_field_scale();
            if (t !== 8 && this.pending_backstroke) {
                this.clear_backstroke()
            }
            switch (t) {
                case 8:
                    this.backstroke_length = this.search_field.val().length;
                    break;
                case 9:
                    if (this.results_showing && !this.is_multiple) {
                        this.result_select(e)
                    }
                    this.mouse_on_container = false;
                    break;
                case 13:
                    e.preventDefault();
                    break;
                case 38:
                    e.preventDefault();
                    this.keyup_arrow();
                    break;
                case 40:
                    e.preventDefault();
                    this.keydown_arrow();
                    break
            }
        };
        n.prototype.search_field_scale = function () {
            var t, n, r, i, s, o, u, a, f;
            if (this.is_multiple) {
                r = 0;
                u = 0;
                s = "position:absolute; left: -1000px; top: -1000px; display:none;";
                o = ["font-size", "font-style", "font-weight", "font-family", "line-height", "text-transform", "letter-spacing"];
                for (a = 0, f = o.length; a < f; a++) {
                    i = o[a];
                    s += i + ":" + this.search_field.css(i) + ";"
                }
                t = e("<div />", {style: s});
                t.text(this.search_field.val());
                e("body").append(t);
                u = t.width() + 25;
                t.remove();
                n = this.container.outerWidth();
                if (u > n - 10) {
                    u = n - 10
                }
                return this.search_field.css({width: u + "px"})
            }
        };
        return n
    }(t)
}).call(this)