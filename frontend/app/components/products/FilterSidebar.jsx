"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaChevronDown, FaStar, FaTimes } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";

const RATINGS = [4, 3, 2, 1];
const DISCOUNTS = [10, 20, 30, 40, 50];
const CAT_LIMIT = 6;
const BRAND_LIMIT = 5;

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const isColor = (v) =>
  typeof CSS !== "undefined" && typeof v === "string" && CSS.supports("color", v);

/* ---------- collapsible section ---------- */
function Section({ title, badge = 0, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2 text-[14px] font-medium text-slate-800">
          {title}
          {badge > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-blue-red px-1 text-[10px] font-medium text-white">
              {badge}
            </span>
          )}
        </span>
        <FaChevronDown
          size={10}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

/* ---------- themed checkbox ---------- */
function Checkbox({ checked, onChange, label }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-[13.5px] text-slate-600 transition hover:bg-slate-50">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border border-slate-300 bg-white transition peer-checked:border-transparent peer-checked:bg-gradient-blue-red peer-focus-visible:ring-2 peer-focus-visible:ring-primary-blue/30 peer-checked:[&_svg]:opacity-100">
        <FaCheck size={9} className="text-white opacity-0 transition" />
      </span>
      <span className={`truncate ${checked ? "text-slate-900" : ""}`}>{label}</span>
    </label>
  );
}

/* ---------- price slider (waits until you stop dragging) ---------- */
function PriceSlider({ min, max, step, value, onCommit }) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onCommit(local), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  if (!(max > 0)) return <p className="text-xs text-slate-400">Prices pending</p>;

  const pct = max > min ? Math.min(100, Math.max(0, ((local - min) / (max - min)) * 100)) : 100;

  return (
    <div>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute left-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-gradient-blue-red"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={local}
          onChange={(e) => setLocal(Number(e.target.value))}
          aria-label="Maximum price"
          className="absolute inset-0 h-5 w-full cursor-pointer appearance-none bg-transparent focus:outline-none
            [&::-webkit-slider-runnable-track]:h-5 [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-webkit-slider-thumb]:mt-[2px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-red
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
            [&::-moz-range-track]:bg-transparent
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-primary-red
            [&::-moz-range-thumb]:bg-white"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{inr(min)}</span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
          Up to {inr(local)}
        </span>
      </div>
    </div>
  );
}

/* ---------- one dynamic filter (color swatches, chips or checkboxes) ---------- */
function OptionSection({ filter, selected = [], onToggle }) {
  const [showAll, setShowAll] = useState(false);
  const LIMIT = filter.type === "check" ? 5 : 12;
  const options = showAll ? filter.options : filter.options.slice(0, LIMIT);

  return (
    <Section title={filter.title} badge={selected.length}>
      {filter.type === "check" ? (
        <div className="-mx-2 space-y-0.5">
          {options.map((o) => (
            <Checkbox
              key={o.value}
              label={o.count != null ? `${o.value} (${o.count})` : o.value}
              checked={selected.includes(o.value)}
              onChange={() => onToggle(filter.key, o.value)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const active = selected.includes(o.value);

            // color swatch (falls back to a text chip if the value is not a real color)
            if (filter.type === "color" && isColor(o.value)) {
              return (
                <button
                  key={o.value}
                  type="button"
                  title={o.value}
                  aria-label={o.value}
                  aria-pressed={active}
                  onClick={() => onToggle(filter.key, o.value)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                    active
                      ? "border-primary-red ring-2 ring-primary-red/30"
                      : "border-slate-300 hover:scale-110"
                  }`}
                  style={{ backgroundColor: o.value }}
                >
                  {active && <FaCheck size={9} className="text-white mix-blend-difference" />}
                </button>
              );
            }

            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(filter.key, o.value)}
                className={`rounded-full border px-3 py-1 text-[13px] transition ${
                  active
                    ? "border-transparent bg-gradient-blue-red text-white"
                    : "border-slate-200 text-slate-600 hover:border-primary-blue hover:text-primary-blue"
                }`}
              >
                {o.value}
              </button>
            );
          })}
        </div>
      )}

      {filter.options.length > LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 text-xs text-primary-blue hover:underline"
        >
          {showAll ? "Show less" : `Show ${filter.options.length - LIMIT} more`}
        </button>
      )}
    </Section>
  );
}

/* ---------- main sidebar ---------- */
export default function FilterSidebar({
  isOpen,
  onClose,

  categories = [], // [{ name, count }]  (first one is "All")
  subcategories = {}, // { categoryName: { subName: count } }
  brands = [], // [{ name }]
  dynamicFilters = [], // [{ key, title, type: "color" | "chip" | "check", options: [{ value, count }] }]

  selectedCategory,
  selectedSubCategory,
  selectedBrands = [],
  selectedDynamic = {}, // { colors: ["red"], sizes: ["M"] }
  selectedRating,
  discountRange,
  priceRange,
  minPrice,
  maxPrice,
  priceStep,

  onCategory,
  onSubCategory,
  onToggleBrand,
  onToggleDynamic = () => {},
  onRating,
  onDiscount,
  onPrice,
  onClear,
}) {
  const [showAllCats, setShowAllCats] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const rating = Number(selectedRating) || 0;

  const selectedIdx = categories.findIndex((c) => c.name === selectedCategory);
  const catsExpanded = showAllCats || selectedIdx >= CAT_LIMIT;
  const shownCats = catsExpanded ? categories : categories.slice(0, CAT_LIMIT);
  const shownBrands = showAllBrands ? brands : brands.slice(0, BRAND_LIMIT);

  const priceActive = maxPrice > 0 && priceRange < maxPrice;

  const chips = [
    selectedCategory && selectedCategory !== "All" && {
      key: "cat",
      label: selectedCategory,
      remove: () => onCategory("All"),
    },
    selectedSubCategory && {
      key: "sub",
      label: selectedSubCategory,
      remove: () => onSubCategory(""),
    },
    ...selectedBrands.map((b) => ({
      key: `brand-${b}`,
      label: b,
      remove: () => onToggleBrand(b),
    })),
    ...dynamicFilters.flatMap((f) =>
      (selectedDynamic[f.key] || []).map((v) => ({
        key: `${f.key}-${v}`,
        label: `${f.title}: ${v}`,
        remove: () => onToggleDynamic(f.key, v),
      }))
    ),
    rating > 0 && { key: "rating", label: `${rating}★ & up`, remove: () => onRating(rating) },
    discountRange > 0 && {
      key: "disc",
      label: `${discountRange}% off+`,
      remove: () => onDiscount(0),
    },
    priceActive && {
      key: "price",
      label: `Up to ${inr(priceRange)}`,
      remove: () => onPrice(maxPrice),
    },
  ].filter(Boolean);

  const hasFilters = chips.length > 0;

  return (
    <>
      {/* Desktop height = about 2 product cards (2 x 433px + 24px gap = 890px).
          Change 890px if your product cards are taller or shorter. */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300
          lg:sticky lg:top-4 lg:z-10 lg:m-4 lg:h-[min(890px,calc(100vh-2rem))] lg:w-[270px] lg:shrink-0 lg:translate-x-0 lg:self-start lg:rounded-2xl lg:border lg:border-slate-200/80 lg:shadow-sm
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* theme accent */}
        <div className="h-[3px] shrink-0 bg-gradient-blue-red" />

        {/* header */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
          <h3 className="text-[17px] font-medium tracking-tight text-slate-800">Filters</h3>

          <div className="flex items-center gap-3">
            {hasFilters && (
              <span className="text-xs text-slate-400">{chips.length} applied</span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="rounded-full bg-gradient-blue-red p-1 text-white lg:hidden"
            >
              <MdOutlineClose size={18} />
            </button>
          </div>
        </div>

        {/* applied filters */}
        {hasFilters && (
          <div className="flex shrink-0 flex-wrap gap-1.5 px-5 pb-3">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.remove}
                className="flex items-center gap-1.5 rounded-full bg-primary-blue/10 px-2.5 py-1 text-xs text-primary-blue transition hover:bg-primary-blue/15"
              >
                {chip.label}
                <FaTimes size={8} />
              </button>
            ))}
          </div>
        )}

        {/* sections: the only scrolling area */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto border-t border-slate-100">
          {/* CATEGORY */}
          <Section
            title="Category"
            defaultOpen
            badge={selectedCategory && selectedCategory !== "All" ? 1 : 0}
          >
            <ul className="space-y-0.5">
              {shownCats.map((cat) => {
                const active = selectedCategory === cat.name;
                const subs = Object.entries(subcategories[cat.name] || {});

                return (
                  <li key={cat.name}>
                    <button
                      type="button"
                      onClick={() => onCategory(cat.name)}
                      className={`relative flex w-full items-center justify-between rounded-lg py-2 pl-3.5 pr-2.5 text-left text-[13.5px] transition ${
                        active
                          ? "bg-primary-blue/[0.06] text-primary-blue"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gradient-blue-red" />
                      )}
                      <span className="truncate">{cat.name}</span>
                      <span className="ml-2 text-xs text-slate-400">{cat.count}</span>
                    </button>

                    {active && subs.length > 0 && (
                      <ul className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                        {subs.map(([sub, count]) => (
                          <li key={sub}>
                            <button
                              type="button"
                              onClick={() => onSubCategory(selectedSubCategory === sub ? "" : sub)}
                              className={`flex w-full items-center justify-between py-1.5 text-left text-[13px] transition ${
                                selectedSubCategory === sub
                                  ? "text-primary-red"
                                  : "text-slate-500 hover:text-primary-blue"
                              }`}
                            >
                              <span className="truncate">{sub}</span>
                              <span className="ml-2 text-xs text-slate-400">{count}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            {categories.length > CAT_LIMIT && selectedIdx < CAT_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAllCats((v) => !v)}
                className="mt-2 px-3.5 text-xs text-primary-blue hover:underline"
              >
                {showAllCats ? "Show less" : `Show ${categories.length - CAT_LIMIT} more`}
              </button>
            )}
          </Section>

          {/* PRICE */}
          <Section title="Price" defaultOpen badge={priceActive ? 1 : 0}>
            <PriceSlider
              min={minPrice}
              max={maxPrice}
              step={priceStep}
              value={priceRange}
              onCommit={onPrice}
            />
          </Section>

          {/* BRAND (hidden when there is only one) */}
          {brands.length > 1 && (
            <Section title="Brand" badge={selectedBrands.length}>
              <div className="-mx-2 space-y-0.5">
                {shownBrands.map((b) => (
                  <Checkbox
                    key={b.name}
                    label={b.name}
                    checked={selectedBrands.includes(b.name)}
                    onChange={() => onToggleBrand(b.name)}
                  />
                ))}
              </div>

              {brands.length > BRAND_LIMIT && (
                <button
                  type="button"
                  onClick={() => setShowAllBrands((v) => !v)}
                  className="mt-2 text-xs text-primary-blue hover:underline"
                >
                  {showAllBrands ? "Show less" : `Show ${brands.length - BRAND_LIMIT} more`}
                </button>
              )}
            </Section>
          )}

          {/* DYNAMIC FILTERS (Color, Size, ...) */}
          {dynamicFilters
            .filter((f) => f.options.length > 0)
            .map((f) => (
              <OptionSection
                key={f.key}
                filter={f}
                selected={selectedDynamic[f.key] || []}
                onToggle={onToggleDynamic}
              />
            ))}

          {/* DISCOUNT */}
          <Section title="Discount" badge={discountRange > 0 ? 1 : 0}>
            <div className="flex flex-wrap gap-2">
              {DISCOUNTS.map((d) => {
                const active = discountRange === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDiscount(active ? 0 : d)}
                    className={`rounded-full border px-3 py-1 text-[13px] transition ${
                      active
                        ? "border-transparent bg-gradient-blue-red text-white"
                        : "border-slate-200 text-slate-600 hover:border-primary-blue hover:text-primary-blue"
                    }`}
                  >
                    {d}% & above
                  </button>
                );
              })}
            </div>
          </Section>

          {/* RATING */}
          <Section title="Customer rating" badge={rating > 0 ? 1 : 0}>
            <div className="space-y-0.5">
              {RATINGS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRating(r)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition ${
                    rating === r
                      ? "bg-primary-blue/[0.06] text-primary-blue"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FaStar
                        key={i}
                        size={12}
                        className={i <= r ? "text-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </span>
                  <span>& up</span>
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* footer: always visible */}
        <div className="flex shrink-0 gap-2 border-t border-slate-100 bg-white p-4">
          <div
            className={`group flex-1 rounded-xl bg-gradient-blue-red p-[1.5px] transition ${
              hasFilters ? "" : "opacity-40"
            }`}
          >
            <button
              type="button"
              onClick={onClear}
              disabled={!hasFilters}
              className="w-full rounded-[10px] bg-white py-2 text-[13.5px] text-slate-700 transition enabled:group-hover:bg-transparent enabled:group-hover:text-white disabled:cursor-not-allowed"
            >
              Clear all filters
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-gradient-blue-red py-2 text-[13.5px] text-white lg:hidden"
          >
            Show results
          </button>
        </div>
      </aside>

      {/* mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}