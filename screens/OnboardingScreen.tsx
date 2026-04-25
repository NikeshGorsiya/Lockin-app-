import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export type OnboardingAnswers = {
  situation: string;
  goal: string;
  wakeUpTime: string;
  freeTime: string;
  struggle: string;
  exercise: string;
  taskCount: string;
  community: string;
  reason: string;
};

type Props = {
  onComplete: (answers: OnboardingAnswers) => void;
};

const QUESTIONS = [
  {
    key: 'situation',
    emoji: '👤',
    question: "What's your current situation?",
    subtitle: 'This helps us understand your daily structure',
    options: ['Working full-time', 'Working part-time', 'Student', 'Between jobs', 'Self-employed'],
  },
  {
    key: 'goal',
    emoji: '🎯',
    question: "What's your main goal?",
    subtitle: 'Pick the one that matters most right now',
    options: ['Get fit & healthy', 'Study & perform better', 'Build discipline', 'Improve mental health', 'All of the above'],
  },
  {
    key: 'wakeUpTime',
    emoji: '⏰',
    question: 'What time do you usually wake up?',
    subtitle: 'We\'ll schedule tasks around your natural rhythm',
    options: ['Before 6am', '6am – 7am', '7am – 8am', '8am – 9am', 'After 9am'],
  },
  {
    key: 'freeTime',
    emoji: '🕐',
    question: 'How much free time do you have each day?',
    subtitle: 'Be honest — we\'ll work with whatever you have',
    options: ['Less than 1 hour', '1 – 2 hours', '2 – 3 hours', '3+ hours'],
  },
  {
    key: 'struggle',
    emoji: '😤',
    question: 'What do you struggle with most?',
    subtitle: 'We\'ll target this specifically in your tasks',
    options: ['Being consistent', 'Staying motivated', 'Staying focused', 'Getting started', 'All of it honestly'],
  },
  {
    key: 'exercise',
    emoji: '💪',
    question: 'How often do you exercise?',
    subtitle: 'No judgment — we all start somewhere',
    options: ['Never', 'Rarely (once a month)', 'Sometimes (1–2x a week)', 'Regularly (3–4x a week)', 'Every day'],
  },
  {
    key: 'taskCount',
    emoji: '📋',
    question: 'How many daily tasks do you want?',
    subtitle: 'You can always adjust this later',
    options: ['3 tasks — easy start', '5 tasks — balanced', '7 tasks — full grind'],
  },
  {
    key: 'community',
    emoji: '🏘️',
    question: 'Which community fits you best?',
    subtitle: 'You can join more later',
    options: ['💪 Gym & Fitness', '📚 Study & Uni', '🎯 Lock In Mode', '🧘 Mental Health', '🌍 Mixed / All'],
  },
  {
    key: 'reason',
    emoji: '💬',
    question: "Why are you really here?",
    subtitle: 'Be honest with yourself. This is just for you.',
    isTextInput: true,
    placeholder: 'e.g. I keep starting and stopping and I need something to hold me accountable...',
  },
] as const;

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [textValue, setTextValue] = useState('');

  const current = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;
  const isLast = step === QUESTIONS.length - 1;

  const handleOption = (option: string) => {
    const updated = { ...answers, [current.key]: option };
    setAnswers(updated);

    if (!isLast) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      onComplete(updated as OnboardingAnswers);
    }
  };

  const handleTextNext = () => {
    if (!textValue.trim()) return;
    const updated = { ...answers, reason: textValue.trim() };
    onComplete(updated as OnboardingAnswers);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Progress bar */}
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Header */}
        <View style={s.header}>
          {step > 0 && (
            <TouchableOpacity onPress={handleBack} style={s.backBtn}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={s.stepCount}>{step + 1} of {QUESTIONS.length}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Question */}
          <View style={s.questionSection}>
            <Text style={s.emoji}>{current.emoji}</Text>
            <Text style={s.question}>{current.question}</Text>
            <Text style={s.subtitle}>{current.subtitle}</Text>
          </View>

          {/* Options or text input */}
          {'isTextInput' in current && current.isTextInput ? (
            <View style={s.textSection}>
              <TextInput
                style={s.textInput}
                placeholder={current.placeholder}
                placeholderTextColor="#3f3f46"
                value={textValue}
                onChangeText={setTextValue}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                autoFocus
              />
              <TouchableOpacity
                style={[s.nextBtn, !textValue.trim() && s.nextBtnDisabled]}
                onPress={handleTextNext}
                disabled={!textValue.trim()}
              >
                <Text style={s.nextBtnText}>Generate my tasks →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.options}>
              {'options' in current && current.options.map((option) => {
                const selected = answers[current.key as keyof OnboardingAnswers] === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[s.optionBtn, selected && s.optionBtnSelected]}
                    onPress={() => handleOption(option)}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.optionText, selected && s.optionTextSelected]}>
                      {option}
                    </Text>
                    {selected && <Text style={s.tick}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  progressBar: { height: 3, backgroundColor: '#1f1f1f', marginHorizontal: 0 },
  progressFill: { height: '100%', backgroundColor: '#4ade80' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  backBtn: { padding: 4 },
  backText: { color: '#71717a', fontSize: 15, fontWeight: '600' },
  stepCount: { color: '#3f3f46', fontSize: 13, fontWeight: '600', marginLeft: 'auto' },

  scroll: { paddingHorizontal: 24, paddingBottom: 48 },

  questionSection: { marginTop: 16, marginBottom: 36, gap: 10 },
  emoji: { fontSize: 44 },
  question: { fontSize: 26, fontWeight: '900', color: '#ffffff', lineHeight: 34 },
  subtitle: { fontSize: 15, color: '#71717a', lineHeight: 22 },

  options: { gap: 12 },
  optionBtn: { backgroundColor: '#141414', borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: '#27272a', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionBtnSelected: { borderColor: '#4ade80', backgroundColor: '#0f2a1a' },
  optionText: { color: '#d4d4d8', fontSize: 16, fontWeight: '500', flex: 1 },
  optionTextSelected: { color: '#4ade80', fontWeight: '700' },
  tick: { color: '#4ade80', fontSize: 16, fontWeight: '900' },

  textSection: { gap: 16 },
  textInput: { backgroundColor: '#141414', borderWidth: 1.5, borderColor: '#27272a', borderRadius: 16, padding: 18, color: '#ffffff', fontSize: 16, minHeight: 140, lineHeight: 24 },
  nextBtn: { backgroundColor: '#4ade80', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#000', fontWeight: '800', fontSize: 17 },
});
