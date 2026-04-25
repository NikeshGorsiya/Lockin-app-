import type { OnboardingAnswers } from '../screens/OnboardingScreen';

export type Task = {
  id: number;
  emoji: string;
  title: string;
  proof: boolean;
  verified?: boolean;
  verificationMessage?: string;
  proofPhotoUrl?: string;
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

export async function verifyTaskPhoto(
  taskTitle: string,
  imageBase64: string,
  mediaType: string = 'image/jpeg'
): Promise<{ verified: boolean; message: string }> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 },
          },
          {
            type: 'text',
            text: `You are verifying photo proof for a habit tracking app. The user completed this task: "${taskTitle}".

Your job is to verify good-faith effort — not perfection. Be generous. If the photo shows ANY reasonable evidence they did the task, verify it.

Examples of what to ACCEPT:
- Reading task: open book, e-reader, notes, highlighted pages, anything book-related
- Workout task: gym clothes, weights, sweaty selfie, workout equipment, gym background
- Meditation task: calm setting, yoga mat, closed eyes, peaceful environment
- Cold shower: wet hair, towel, bathroom setting, steam
- No social media: phone face down, timer app, anything suggesting they avoided their phone
- Journaling: notebook, pen and paper, writing app open
- Water intake: water bottle, glass of water
- Any task: if the photo is even vaguely related to the activity, verify it

Only REJECT if the photo is completely unrelated (e.g. a photo of food for a workout task with zero gym context).

Reply with ONLY valid JSON, nothing else:
{"verified": true, "message": "celebratory one-liner"}
or
{"verified": false, "message": "friendly suggestion of what photo would work"}`,
          },
        ],
      }],
    }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);

  const data = await response.json();
  const text: string = data.content[0].text.trim();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}

  return { verified: false, message: "Couldn't read the response. Try again." };
}
