import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  ShoppingPreferences,
  CuratedRecommendations,
  ChatMessage,
  ConversationStep,
  ShoppingForGender,
  AgeGroup,
} from '../types/shoppingAssistant';
import { productRecommendationService } from '../services/productRecommendationService';
import { formatINR } from '../utils/currency';

interface AssistantContextType {
  isOpen: boolean;
  openAssistant: (initialOccasionOrPreset?: string) => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  messages: ChatMessage[];
  currentStep: ConversationStep;
  preferences: ShoppingPreferences;
  recommendations: CuratedRecommendations | null;
  isTyping: boolean;
  selectOccasion: (occasion: string) => void;
  selectGender: (gender: ShoppingForGender, ageGroup?: AgeGroup) => void;
  selectBudget: (min: number, max: number) => void;
  selectStyles: (
    styles: string[],
    preferredCategories?: string[],
    preferredColours?: string[]
  ) => void;
  handleUserTextMessage: (text: string) => void;
  resetConversation: () => void;
  editPreferences: () => void;
  relaxFilters: () => void;
}

const DEFAULT_PREFERENCES: ShoppingPreferences = {
  occasion: '',
  gender: 'anyone',
  minBudget: 0,
  maxBudget: 25000,
  styles: [],
  preferredCategories: [],
  preferredColours: [],
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: "Hi! Let's find something you'll love. Tell me a little about what you're shopping for, and I'll curate a collection around you.",
    timestamp: 'Just now',
    step: 'welcome',
  },
  {
    id: 'msg-ask-occasion',
    sender: 'assistant',
    text: 'What are you shopping for today?',
    timestamp: 'Just now',
    step: 'occasion',
  },
];

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [currentStep, setCurrentStep] = useState<ConversationStep>('occasion');
  const [preferences, setPreferences] = useState<ShoppingPreferences>(DEFAULT_PREFERENCES);
  const [recommendations, setRecommendations] = useState<CuratedRecommendations | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const openAssistant = useCallback((initialOccasionOrPreset?: string) => {
    setIsOpen(true);
    if (initialOccasionOrPreset) {
      // Pre-select occasion if provided
      setPreferences((prev) => ({ ...prev, occasion: initialOccasionOrPreset }));
      setMessages([
        ...INITIAL_MESSAGES,
        {
          id: `msg-user-occ-${Date.now()}`,
          sender: 'user',
          text: initialOccasionOrPreset,
          timestamp: 'Just now',
        },
        {
          id: `msg-ask-gender-${Date.now()}`,
          sender: 'assistant',
          text: 'Who are we shopping for?',
          timestamp: 'Just now',
          step: 'gender',
        },
      ]);
      setCurrentStep('gender');
    }
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const resetConversation = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    setRecommendations(null);
    setCurrentStep('occasion');
    setIsTyping(false);
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Hi! Let's find something you'll love. Tell me a little about what you're shopping for, and I'll curate a collection around you.",
        timestamp: 'Just now',
        step: 'welcome',
      },
      {
        id: `msg-ask-occ-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'What are you shopping for today?',
        timestamp: 'Just now',
        step: 'occasion',
      },
    ]);
  }, []);

  const editPreferences = useCallback(() => {
    setCurrentStep('occasion');
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-edit-${Date.now()}`,
        sender: 'assistant',
        text: 'Let us refine your preferences. What occasion or piece shall we focus on?',
        timestamp: 'Just now',
        step: 'occasion',
      },
    ]);
  }, []);

  // STEP 1: Select Occasion
  const selectOccasion = useCallback((occasion: string) => {
    setPreferences((prev) => ({ ...prev, occasion }));

    // Add user response
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        text: occasion,
        timestamp: 'Just now',
      },
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-gender-${Date.now()}`,
          sender: 'assistant',
          text: 'Who are we shopping for?',
          timestamp: 'Just now',
          step: 'gender',
        },
      ]);
      setCurrentStep('gender');
    }, 450);
  }, []);

  // STEP 2: Select Gender & optional Kids age
  const selectGender = useCallback((gender: ShoppingForGender, ageGroup?: AgeGroup) => {
    setPreferences((prev) => ({ ...prev, gender, ageGroup }));

    const genderLabel =
      gender === 'men'
        ? "Men's Collection"
        : gender === 'women'
        ? "Women's Atelier"
        : gender === 'kids'
        ? `Kids & Juniors${ageGroup ? ` (${ageGroup})` : ''}`
        : 'Anyone / Show All';

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        text: genderLabel,
        timestamp: 'Just now',
      },
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-budget-${Date.now()}`,
          sender: 'assistant',
          text: "What's your comfortable budget for these pieces?",
          timestamp: 'Just now',
          step: 'budget',
        },
      ]);
      setCurrentStep('budget');
    }, 450);
  }, []);

  // STEP 3: Select Budget
  const selectBudget = useCallback((min: number, max: number) => {
    setPreferences((prev) => ({ ...prev, minBudget: min, maxBudget: max }));

    const budgetText =
      max >= 25000
        ? min > 0
          ? `From ${formatINR(min)} onwards`
          : 'Any price range'
        : min === 0
        ? `Under ${formatINR(max)}`
        : `${formatINR(min)} — ${formatINR(max)}`;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        text: budgetText,
        timestamp: 'Just now',
      },
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-styles-${Date.now()}`,
          sender: 'assistant',
          text: 'Which aesthetic and styles feel most like you? (Select any that apply)',
          timestamp: 'Just now',
          step: 'styles',
        },
      ]);
      setCurrentStep('styles');
    }, 450);
  }, []);

  // STEP 4: Select Styles & finalize recommendations
  const selectStyles = useCallback(
    (styles: string[], preferredCategories?: string[], preferredColours?: string[]) => {
      const finalPrefs: ShoppingPreferences = {
        ...preferences,
        styles,
        preferredCategories: preferredCategories || preferences.preferredCategories,
        preferredColours: preferredColours || preferences.preferredColours,
      };

      setPreferences(finalPrefs);

      const stylesText = styles.length > 0 ? styles.join(', ') : 'Versatile & Timeless';

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-user-${Date.now()}`,
          sender: 'user',
          text: stylesText,
          timestamp: 'Just now',
        },
      ]);

      setIsTyping(true);

      setTimeout(async () => {
        const results = await productRecommendationService.getRecommendationsAsync(finalPrefs);
        setIsTyping(false);
        setRecommendations(results);

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-recs-${Date.now()}`,
            sender: 'assistant',
            text: results.summaryCopy,
            timestamp: 'Just now',
            step: 'recommendations',
            recommendations: results,
          },
        ]);
        setCurrentStep('recommendations');
      }, 700);
    },
    [preferences]
  );

  // Relax filters helper (e.g. If no products match)
  const relaxFilters = useCallback(() => {
    setIsTyping(true);
    setTimeout(async () => {
      const relaxed = await productRecommendationService.getRecommendationsAsync(preferences, {
        relaxBudget: true,
        relaxCategory: true,
      });
      setIsTyping(false);
      setRecommendations(relaxed);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-user-relax-${Date.now()}`,
          sender: 'user',
          text: 'Widen budget & relax categories',
          timestamp: 'Just now',
        },
        {
          id: `msg-relaxed-${Date.now() + 1}`,
          sender: 'assistant',
          text: `We relaxed the budget to ${formatINR(
            Math.round(preferences.maxBudget * 1.5)
          )} and broadened matching categories. Here is your extended edit:`,
          timestamp: 'Just now',
          step: 'recommendations',
          recommendations: relaxed,
        },
      ]);
    }, 600);
  }, [preferences]);

  // Handle Free-Form User Text Input
  const handleUserTextMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Depending on current step, interpret response or forward
      if (currentStep === 'occasion') {
        selectOccasion(trimmed);
      } else if (currentStep === 'gender') {
        const lower = trimmed.toLowerCase();
        if (lower.includes('men') || lower.includes('guy') || lower.includes('him')) {
          selectGender('men');
        } else if (lower.includes('women') || lower.includes('lady') || lower.includes('her')) {
          selectGender('women');
        } else if (lower.includes('kid') || lower.includes('child') || lower.includes('baby')) {
          selectGender('kids');
        } else {
          selectGender('anyone');
        }
      } else if (currentStep === 'budget') {
        // Parse numbers if present
        const matches = trimmed.match(/\d[\d,.]*/g);
        if (matches && matches.length > 0) {
          const num = Number(matches[matches.length - 1].replace(/,/g, ''));
          selectBudget(0, num);
        } else {
          selectBudget(0, 5000);
        }
      } else if (currentStep === 'styles') {
        selectStyles([trimmed]);
      } else {
        // Freeform message after recommendations
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-user-${Date.now()}`,
            sender: 'user',
            text: trimmed,
            timestamp: 'Just now',
          },
        ]);

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-reply-${Date.now()}`,
              sender: 'assistant',
              text: `I've noted "${trimmed}". Would you like to refine your budget, change occasion, or explore matching catalogue pieces?`,
              timestamp: 'Just now',
            },
          ]);
        }, 500);
      }
    },
    [currentStep, selectOccasion, selectGender, selectBudget, selectStyles]
  );

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        messages,
        currentStep,
        preferences,
        recommendations,
        isTyping,
        selectOccasion,
        selectGender,
        selectBudget,
        selectStyles,
        handleUserTextMessage,
        resetConversation,
        editPreferences,
        relaxFilters,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = (): AssistantContextType => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};

