import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Check,
  CircleDollarSign,
  Layers,
  Palette,
  Sliders,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import {
  OccasionType,
  ShoppingForGender,
  AgeGroup,
  StylePreference,
} from '../../types/shoppingAssistant';
import { formatINR } from '../../utils/currency';

const OCCASIONS: OccasionType[] = [
  'Wedding',
  'Party',
  'Office',
  'Everyday Wear',
  'Vacation / Travel',
  'Festive Occasion',
  'Date Night',
  'Gifting',
  'Sports / Activewear',
  'Something Else',
];

const GENDER_OPTIONS: { label: string; value: ShoppingForGender; desc: string }[] = [
  { label: 'Men', value: 'men', desc: 'Tailored shirts, trousers & footwear' },
  { label: 'Women', value: 'women', desc: 'Silk dresses, handloom & separates' },
  { label: 'Kids & Juniors', value: 'kids', desc: 'Gentle organic cottons & sets' },
  { label: 'Anyone / Show All', value: 'anyone', desc: 'Cross-wardrobe & lifestyle objects' },
];

const KIDS_AGE_GROUPS: AgeGroup[] = [
  '0–2 years',
  '3–5 years',
  '6–8 years',
  '9–12 years',
  '13+ years',
];

const BUDGET_PRESETS: { label: string; min: number; max: number }[] = [
  { label: 'Under ₹999', min: 0, max: 999 },
  { label: '₹1,000 – ₹2,499', min: 1000, max: 2499 },
  { label: '₹2,500 – ₹4,999', min: 2500, max: 4999 },
  { label: '₹5,000 – ₹9,999', min: 5000, max: 9999 },
  { label: '₹10,000+', min: 10000, max: 25000 },
];

const STYLE_OPTIONS: StylePreference[] = [
  'Minimal',
  'Classic',
  'Contemporary',
  'Trendy',
  'Ethnic',
  'Streetwear',
  'Sporty',
  'Elegant',
  'Casual',
  'Premium Essentials',
];

const COLOR_OPTIONS = ['Ivory', 'Charcoal', 'Olive', 'Champagne', 'Tan', 'Navy', 'Cream'];

export const PreferenceStep: React.FC = () => {
  const {
    currentStep,
    selectOccasion,
    selectGender,
    selectBudget,
    selectStyles,
    isTyping,
  } = useAssistant();

  // Step 1 Custom Occasion state
  const [customOccasion, setCustomOccasion] = useState('');
  const [showCustomOccasionInput, setShowCustomOccasionInput] = useState(false);

  // Step 2 Kids Age State
  const [selectedKidsAge, setSelectedKidsAge] = useState<AgeGroup | undefined>(undefined);
  const [isKidsSelected, setIsKidsSelected] = useState(false);

  // Step 3 Budget State
  const [customMin, setCustomMin] = useState<number>(0);
  const [customMax, setCustomMax] = useState<number>(10000);
  const [isCustomBudget, setIsCustomBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // Step 4 Style Multi-Select State
  const [selectedStylesList, setSelectedStylesList] = useState<string[]>(['Minimal', 'Classic']);
  const [selectedColorsList, setSelectedColorsList] = useState<string[]>([]);
  const [selectedCategoriesList, setSelectedCategoriesList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOccasionSelect = (occ: string) => {
    if (isSubmitting || isTyping) return;
    setIsSubmitting(true);
    selectOccasion(occ);
    setTimeout(() => setIsSubmitting(false), 600);
  };

  const handleGenderSelect = (gender: ShoppingForGender, age?: AgeGroup) => {
    if (isSubmitting || isTyping) return;
    setIsSubmitting(true);
    selectGender(gender, age);
    setTimeout(() => setIsSubmitting(false), 600);
  };

  const handleBudgetSelect = (min: number, max: number) => {
    if (isSubmitting || isTyping) return;
    setIsSubmitting(true);
    selectBudget(min, max);
    setTimeout(() => setIsSubmitting(false), 600);
  };

  if (isTyping) {
    return (
      <div className="flex items-center gap-2 p-3 bg-white/70 border border-[#E4DED4] rounded-xs text-xs text-[#777B63] italic">
        <span className="w-1.5 h-1.5 rounded-full bg-[#777B63] animate-bounce" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#777B63] animate-bounce delay-150" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#777B63] animate-bounce delay-300" />
        <span className="font-serif">Curating thoughtful questions...</span>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 1: OCCASION
  // -------------------------------------------------------------
  if (currentStep === 'occasion') {
    return (
      <div className="space-y-3 bg-[#EFE9DF]/30 p-3.5 border border-[#E4DED4]">
        <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-medium block">
          Select an occasion or enter your own
        </span>

        <div className="flex flex-wrap gap-1.5">
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (occ === 'Something Else') {
                  setShowCustomOccasionInput(true);
                } else {
                  handleOccasionSelect(occ);
                }
              }}
              className="px-3 py-1.5 text-xs bg-white text-[#242522] border border-[#E4DED4] hover:border-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1] transition-all rounded-none cursor-pointer disabled:opacity-50"
            >
              {occ}
            </button>
          ))}
        </div>

        {showCustomOccasionInput && (
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Gallery Opening, Weekend Getaway..."
              value={customOccasion}
              onChange={(e) => setCustomOccasion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customOccasion.trim()) {
                  handleOccasionSelect(customOccasion.trim());
                }
              }}
              className="flex-1 bg-white border border-[#E4DED4] px-3 py-1.5 text-xs text-[#242522] focus:outline-none focus:border-[#242522]"
            />
            <button
              type="button"
              disabled={!customOccasion.trim() || isSubmitting}
              onClick={() => customOccasion.trim() && handleOccasionSelect(customOccasion.trim())}
              className="px-3 py-1.5 bg-[#242522] text-[#F8F6F1] text-xs font-medium uppercase tracking-wider disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 2: GENDER & KIDS AGE
  // -------------------------------------------------------------
  if (currentStep === 'gender') {
    return (
      <div className="space-y-3 bg-[#EFE9DF]/30 p-3.5 border border-[#E4DED4]">
        <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-medium block">
          Select department or recipient
        </span>

        {!isKidsSelected ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (opt.value === 'kids') {
                    setIsKidsSelected(true);
                  } else {
                    handleGenderSelect(opt.value);
                  }
                }}
                className="p-2.5 text-left bg-white border border-[#E4DED4] hover:border-[#242522] hover:bg-[#F8F6F1] transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="font-serif text-sm text-[#242522] group-hover:text-[#777B63] transition-colors">
                  {opt.label}
                </div>
                <div className="text-[11px] text-[#5A5C55] font-light mt-0.5">
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <span className="text-xs text-[#242522] font-medium block">
              Which age bracket for Kids & Juniors? (Optional)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {KIDS_AGE_GROUPS.map((age) => (
                <button
                  key={age}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleGenderSelect('kids', age)}
                  className="px-3 py-1.5 text-xs bg-white text-[#242522] border border-[#E4DED4] hover:border-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1] transition-all disabled:opacity-50"
                >
                  {age}
                </button>
              ))}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleGenderSelect('kids')}
                className="px-3 py-1.5 text-xs bg-[#EFE9DF] text-[#777B63] border border-[#E4DED4] hover:text-[#242522] disabled:opacity-50"
              >
                Skip / All Ages
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 3: BUDGET
  // -------------------------------------------------------------
  if (currentStep === 'budget') {
    const handleApplyCustomBudget = () => {
      if (customMin > customMax) {
        setBudgetError('Minimum budget cannot exceed maximum budget.');
        return;
      }
      setBudgetError(null);
      selectBudget(customMin, customMax);
    };

    return (
      <div className="space-y-3 bg-[#EFE9DF]/30 p-3.5 border border-[#E4DED4]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-medium block">
            Select your comfortable budget
          </span>
          <button
            type="button"
            onClick={() => setIsCustomBudget(!isCustomBudget)}
            className="text-[11px] text-[#777B63] underline hover:text-[#242522]"
          >
            {isCustomBudget ? 'Quick Presets' : 'Custom Min & Max'}
          </button>
        </div>

        {!isCustomBudget ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleBudgetSelect(preset.min, preset.max)}
                className="p-2 text-center text-xs font-medium bg-white text-[#242522] border border-[#E4DED4] hover:border-[#242522] hover:bg-[#242522] hover:text-[#F8F6F1] transition-all disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#777B63] uppercase tracking-wider block mb-1">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={customMin}
                  onChange={(e) => setCustomMin(Number(e.target.value))}
                  className="w-full bg-white border border-[#E4DED4] px-2.5 py-1.5 text-xs text-[#242522]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#777B63] uppercase tracking-wider block mb-1">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={250}
                  value={customMax}
                  onChange={(e) => setCustomMax(Number(e.target.value))}
                  className="w-full bg-white border border-[#E4DED4] px-2.5 py-1.5 text-xs text-[#242522]"
                />
              </div>
            </div>

            {/* Range Slider for Max Price */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#777B63] mb-1">
                <span>Upper Bound Slider:</span>
                <span className="font-serif font-medium text-[#242522]">
                  {formatINR(customMax)}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={25000}
                step={250}
                value={customMax}
                onChange={(e) => setCustomMax(Number(e.target.value))}
                className="w-full accent-[#242522] cursor-pointer"
              />
            </div>

            {budgetError && (
              <p className="text-[11px] text-red-600 font-medium">{budgetError}</p>
            )}

            <button
              type="button"
              onClick={handleApplyCustomBudget}
              className="w-full py-2 bg-[#242522] text-[#F8F6F1] text-xs font-medium uppercase tracking-wider hover:bg-[#383934] transition-colors"
            >
              Set Budget ({formatINR(customMin)} — {formatINR(customMax)})
            </button>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 4: STYLE & INTERESTS (Multi-Select)
  // -------------------------------------------------------------
  if (currentStep === 'styles') {
    const toggleStyle = (style: string) => {
      setSelectedStylesList((prev) =>
        prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
      );
    };

    const toggleColor = (color: string) => {
      setSelectedColorsList((prev) =>
        prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
      );
    };

    const handleConfirm = () => {
      selectStyles(selectedStylesList, selectedCategoriesList, selectedColorsList);
    };

    return (
      <div className="space-y-3.5 bg-[#EFE9DF]/30 p-3.5 border border-[#E4DED4]">
        {/* Style Aesthetics */}
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-medium block mb-1.5">
            Select Your Aesthetic (Multiple Allowed)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_OPTIONS.map((style) => {
              const isSelected = selectedStylesList.includes(style);
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`px-3 py-1.5 text-xs border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#242522] text-[#F8F6F1] border-[#242522] font-medium shadow-xs'
                      : 'bg-white text-[#242522] border-[#E4DED4] hover:border-[#242522]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-[#D8C6AA]" />}
                  <span>{style}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Preferred Colors */}
        <div className="pt-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-medium block mb-1.5">
            Preferred Colour Palette (Optional)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_OPTIONS.map((color) => {
              const isSelected = selectedColorsList.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`px-2.5 py-1 text-[11px] border transition-colors ${
                    isSelected
                      ? 'bg-[#777B63] text-white border-[#777B63] font-medium'
                      : 'bg-white text-[#5A5C55] border-[#E4DED4] hover:border-[#242522]'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs font-medium uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 group"
          >
            <span>Curate My Wardrobe</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D8C6AA] group-hover:rotate-12 transition-transform" />
          </button>
          <button
            type="button"
            onClick={() => selectStyles(['Minimal', 'Classic'])}
            className="px-3 py-2.5 text-xs text-[#777B63] hover:text-[#242522] underline"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  return null;
};

