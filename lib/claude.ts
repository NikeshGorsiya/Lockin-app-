import type { OnboardingAnswers } from '../screens/OnboardingScreen';

export type Task = {
  id: number;
  emoji: string;
  title: string;
  proof: boolean;
};

const TASK_EMOJIS: Record<string, string> = {
  workout: '💪', gym: '💪', exercise: '💪', walk: '🚶', run: '🏃',
  read: '📚', book: '📖', study: '📖', learn: '🧠',
  meditat: '🧘', breathe: '🌬️', mindful: '🧘',
  water: '💧', hydrat: '💧', drink: '💧',
  sleep: '😴', bed: '🛌',
  journal: '✍️', write: '✍️', gratitude: '🙏',
  cook: '🍳', meal: '🥗', eat: '🥗', diet: '🥗',
  cold: '🚿', shower: '🚿',
  phone: '📵', social: '📵', screen: '📵',
  clean: '🧹', tidy: '🧹',
  code: '💻', work: '💼',
  call: '📞', connect: '🤝',
};

function pickEmoji(title: string): string {
  const lower = title.toLowerCase();
  for (const [keyword, emoji] of Object.entries(TASK_EMOJIS)) {
    if (lower.includes(keyword)) return emoji;
  }
  return '✅';
}

function getTaskCount(taskCount: string): number {
  if (taskCount.includes('3')) return 3;
  if (taskCount.includes('7')) return 7;
  return 5;
}

export async function generateTasksFromOnboarding(answers: OnboardingAnswers): Promise<Task[]> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;
  const count = getTaskCount(answers.taskCount);

  const prompt = `You are a personal accountability coach building a daily habit plan for someone who is serious about changing their life.

Here is their profile:
- Situation: ${answers.situation}
- Main goal: ${answers.goal}
- Wakes up: ${answers.wakeUpTime}
- Free time daily: ${answers.freeTime}
- Biggest struggle: ${answers.struggle}
- Current exercise: ${answers.exercise}
- Tasks wanted: ${count} per day
- Community: ${answers.community}
- Their reason for being here: "${answers.reason}"

Generate exactly ${count} daily tasks personalised to this person. Each task must:
- Be specific and achievable within their schedule
- Be provable with a photo (they must upload photo evidence to mark it done)
- Take 5–30 minutes
- Directly address their goals and struggles
- Feel personal to their reason for joining

Return ONLY a numbered list. Nothing else. No intro, no explanation. Format exactly like this:
1. Task name here
2. Another task here
3. ...`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text: string = data.content[0].text;

  const tasks: Task[] = text
    .split('\n')
    .filter((line: string) => /^\d+\./.test(line.trim()))
    .map((line: string, index: number) => {
      const title = line.replace(/^\d+\.\s*/, '').trim();
      return {
        id: index + 1,
        emoji: pickEmoji(title),
        title,
        proof: false,
      };
    })
    .filter((t: Task) => t.title.length > 0);

  return tasks;
}
