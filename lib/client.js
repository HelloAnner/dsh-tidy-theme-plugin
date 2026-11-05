window.__ModuleLoader__.load({
	id: "dsh-tidy-theme-plugin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/**
		 * Services this browser half needs before `apply` runs. `slots` is the
		 * renderer-owned composition registry that owns the sidebar brand seats.
		 */
		const inject = ["slots"];

		/**
		 * Lower priority wins a single slot. The official brand package registers
		 * its occupants at the default priority (0), so -1 shadows them without
		 * touching that package or its configuration.
		 */
		const SHADOW_PRIORITY = -1;

		/**
		 * Layout sheet for the sidebar top row.
		 *
		 * The sidebar renders its 60px `logoRow` and then the real
		 * `button.newSession`. Emptying the brand slots leaves that row with only
		 * the collapse toggle, so pull the real button up by 49px: 60px row minus
		 * the 38px button, centered under the 6px column padding, plus 11px.
		 * `margin-bottom: 11px` cancels the pulled-up height so the navigation
		 * still starts exactly at the row's bottom edge, and `margin-right: 40px`
		 * reserves the 28px toggle plus its 8px gap.
		 *
		 * Selectors use the CSS-module suffixes (`_logoRow`, `_newSession`,
		 * `_brand`, `_collapsed`) rather than hashed prefixes so they survive
		 * rebuilds. Desktop window chrome owns different row geometry, so the
		 * promotion is scoped to the browser surface.
		 */
		const STYLE = `
html:not([data-platform='darwin']):not([data-windows-titlebar]) [class*='_root']:not([class*='_collapsed']) > button[class*='_newSession'] {
  margin-top: -49px;
  margin-right: 40px;
  margin-bottom: 11px;
  position: relative;
  z-index: 2;
}

html:not([data-platform='darwin']):not([data-windows-titlebar]) [class*='_logoRow'] > button[class*='_brand'] {
  display: none;
}
`;

		/**
		 * Empty occupant for the sidebar brand seats.
		 *
		 * The shell renders `sidebar.brand.mark` and `sidebar.brand.name` as
		 * independent single slots: the expanded lockup uses both, the collapsed
		 * rail uses the mark. Returning `null` removes the DeepSeek fish mark and
		 * the "deepseek HARNESS" wordmark together while leaving the brand row,
		 * its new-session click target, and the collapse toggle in place.
		 * @returns no element.
		 */
		function EmptyBrand() {
			return null;
		}

		/**
		 * Occupy both brand seats as one declaration-aware registration set, so
		 * the two seats appear and disappear together during boot and HMR.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			ctx.effect(() => {
				const stale = document.querySelector("style[data-dsh-tidy-theme]");
				stale?.remove();
				const style = document.createElement("style");
				style.dataset.dshTidyTheme = "";
				style.textContent = STYLE;
				document.head.appendChild(style);
				return () => style.remove();
			}, "tidy-theme: top-row layout");

			ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.inject("sidebar.brand.name", function* () {
				yield ctx.slots.register({ name: "sidebar.brand.mark", priority: SHADOW_PRIORITY }, EmptyBrand);
				yield ctx.slots.register({ name: "sidebar.brand.name", priority: SHADOW_PRIORITY }, EmptyBrand);
			}));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
