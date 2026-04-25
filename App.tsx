import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const TASKS = [
  { id: 1, title: 'Morning workout', emoji: '💪', proof: false },
  { id: 2, title: 'Read for 30 mins', emoji: '📚', proof: false },
  { id: 3, title: 'Cold shower', emoji: '🚿', proof: false },
  { id: 4, title: 'Meditate 10 mins', emoji: '🧘', proof: false },
  { id: 5, title: 'No social media before 12pm', emoji: '📵', proof: false },
];

const FRIENDS = [
  { id: 1, name: 'Jordan', streak: 14, done: 4, total: 5 },
  { id: 2, name: 'Marcus', streak: 3, done: 2, total: 5 },
  { id: 3, name: 'Priya', streak: 21, done: 5, total: 5 },
];

export default function App() {
  const [tasks, setTasks] = useState(TASKS);
  const [activeTab, setActiveTab] = useState('home');

  const completedCount = tasks.filter((t) => t.proof).length;
  const progress = completedCount / tasks.length;

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, proof: !t.proof } : t)));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <View style={styles.header}>
            <View>
              <Text style={styles.appName}>LOCKIN</Text>
              <Text style={styles.greeting}>Good morning, Nikesh 👋</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakNumber}>7</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressTitle}>Today's progress</Text>
              <Text style={styles.progressCount}>{completedCount}/{tasks.length} done</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
            </View>
            {completedCount === tasks.length && (
              <Text style={styles.allDone}>All done! You locked in today 🎉</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Your tasks</Text>
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, task.proof && styles.taskCardDone]}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.taskEmoji}>{task.emoji}</Text>
              <Text style={[styles.taskTitle, task.proof && styles.taskTitleDone]}>
                {task.title}
              </Text>
              <View style={[styles.checkbox, task.proof && styles.checkboxDone]}>
                {task.proof && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.proofHint}>
            <Text style={styles.proofHintIcon}>📸</Text>
            <Text style={styles.proofHintText}>
              Tap a task then upload photo proof — AI will verify it
            </Text>
          </View>

        </ScrollView>
      )}

      {/* FEED TAB */}
      {activeTab === 'feed' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.tabHeader}>Public Feed</Text>
          <Text style={styles.tabSubtitle}>See what the world is locking in on</Text>

          {[
            { name: 'Alex M.', task: 'Morning workout', time: '6:32am', verified: true },
            { name: 'Sarah K.', task: 'Read 30 mins', time: '7:15am', verified: true },
            { name: 'Tom R.', task: 'Cold shower', time: '8:00am', verified: false },
            { name: 'Priya S.', task: 'Meditation', time: '8:45am', verified: true },
          ].map((post, i) => (
            <View key={i} style={styles.feedCard}>
              <View style={styles.feedAvatar}>
                <Text style={styles.feedAvatarText}>{post.name[0]}</Text>
              </View>
              <View style={styles.feedContent}>
                <Text style={styles.feedName}>{post.name}</Text>
                <Text style={styles.feedTask}>completed: {post.task}</Text>
                <Text style={styles.feedTime}>{post.time}</Text>
              </View>
              <View style={[styles.feedBadge, post.verified ? styles.feedBadgeGreen : styles.feedBadgeGray]}>
                <Text style={styles.feedBadgeText}>{post.verified ? '✓ Verified' : 'Pending'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* FRIENDS TAB */}
      {activeTab === 'friends' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.tabHeader}>Friends</Text>
          <Text style={styles.tabSubtitle}>Hold each other accountable</Text>

          {FRIENDS.map((friend) => (
            <View key={friend.id} style={styles.friendCard}>
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>{friend.name[0]}</Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendTasks}>{friend.done}/{friend.total} tasks today</Text>
                <View style={styles.friendTrack}>
                  <View style={[styles.friendFill, { width: `${(friend.done / friend.total) * 100}%` as any }]} />
                </View>
              </View>
              <View style={styles.friendStreak}>
                <Text style={styles.friendStreakFire}>🔥</Text>
                <Text style={styles.friendStreakNum}>{friend.streak}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addFriendBtn}>
            <Text style={styles.addFriendText}>+ Add a friend</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* COMMUNITY TAB */}
      {activeTab === 'community' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.tabHeader}>Communities</Text>
          <Text style={styles.tabSubtitle}>Find your people</Text>

          {[
            { emoji: '💪', name: 'Gym & Fitness', members: '12.4k', joined: true },
            { emoji: '📚', name: 'Students & Uni', members: '8.1k', joined: false },
            { emoji: '🎯', name: 'Lock In Mode', members: '21k', joined: true },
            { emoji: '🧘', name: 'Mental Health', members: '5.3k', joined: false },
            { emoji: '💻', name: 'Coding & Tech', members: '9.7k', joined: false },
            { emoji: '⏰', name: 'Early Risers', members: '6.2k', joined: false },
          ].map((c, i) => (
            <View key={i} style={styles.communityCard}>
              <Text style={styles.communityEmoji}>{c.emoji}</Text>
              <View style={styles.communityInfo}>
                <Text style={styles.communityName}>{c.name}</Text>
                <Text style={styles.communityMembers}>{c.members} members</Text>
              </View>
              <TouchableOpacity style={[styles.joinBtn, c.joined && styles.joinBtnJoined]}>
                <Text style={[styles.joinBtnText, c.joined && styles.joinBtnTextJoined]}>
                  {c.joined ? 'Joined' : 'Join'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', emoji: '🏠', label: 'Home' },
          { id: 'feed', emoji: '🌍', label: 'Feed' },
          { id: 'friends', emoji: '👥', label: 'Friends' },
          { id: 'community', emoji: '🏘️', label: 'Community' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navTab}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.navEmoji}>{tab.emoji}</Text>
            <Text style={[styles.navLabel, activeTab === tab.id && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const C = {
  bg: '#0a0a0a',
  card: '#141414',
  border: '#222222',
  green: '#4ade80',
  greenDark: '#166534',
  white: '#ffffff',
  muted: '#71717a',
  dim: '#3f3f46',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 100 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  appName: { color: C.green, fontSize: 14, fontWeight: '900', letterSpacing: 4, marginBottom: 4 },
  greeting: { color: C.white, fontSize: 20, fontWeight: '700' },
  streakBadge: { alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.border },
  streakFire: { fontSize: 20 },
  streakNumber: { color: C.green, fontSize: 22, fontWeight: '900' },
  streakLabel: { color: C.muted, fontSize: 10 },

  progressCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 28, borderWidth: 1, borderColor: C.border },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { color: C.white, fontWeight: '600', fontSize: 15 },
  progressCount: { color: C.green, fontWeight: '700', fontSize: 15 },
  progressTrack: { height: 8, backgroundColor: C.dim, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.green, borderRadius: 4 },
  allDone: { color: C.green, marginTop: 10, fontWeight: '600', textAlign: 'center' },

  sectionTitle: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  taskCardDone: { borderColor: C.greenDark, opacity: 0.7 },
  taskEmoji: { fontSize: 22, marginRight: 14 },
  taskTitle: { flex: 1, color: C.white, fontSize: 15, fontWeight: '500' },
  taskTitleDone: { color: C.muted, textDecorationLine: 'line-through' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.dim, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: C.green, borderColor: C.green },
  checkmark: { color: '#000', fontWeight: '900', fontSize: 13 },

  proofHint: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, padding: 14, marginTop: 8, gap: 10, borderWidth: 1, borderColor: '#1e3a5f' },
  proofHintIcon: { fontSize: 20 },
  proofHintText: { flex: 1, color: C.muted, fontSize: 13, lineHeight: 18 },

  tabHeader: { color: C.white, fontSize: 26, fontWeight: '900', marginBottom: 4 },
  tabSubtitle: { color: C.muted, fontSize: 14, marginBottom: 24 },

  feedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, gap: 12 },
  feedAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a2e1a', alignItems: 'center', justifyContent: 'center' },
  feedAvatarText: { color: C.green, fontWeight: '800', fontSize: 16 },
  feedContent: { flex: 1 },
  feedName: { color: C.white, fontWeight: '700', fontSize: 14 },
  feedTask: { color: C.muted, fontSize: 13, marginTop: 2 },
  feedTime: { color: C.dim, fontSize: 11, marginTop: 2 },
  feedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  feedBadgeGreen: { backgroundColor: C.greenDark },
  feedBadgeGray: { backgroundColor: '#27272a' },
  feedBadgeText: { color: C.white, fontSize: 10, fontWeight: '700' },

  friendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, gap: 12 },
  friendAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a2e1a', alignItems: 'center', justifyContent: 'center' },
  friendAvatarText: { color: C.green, fontWeight: '800', fontSize: 18 },
  friendInfo: { flex: 1 },
  friendName: { color: C.white, fontWeight: '700', fontSize: 15 },
  friendTasks: { color: C.muted, fontSize: 12, marginTop: 2, marginBottom: 6 },
  friendTrack: { height: 4, backgroundColor: C.dim, borderRadius: 2, overflow: 'hidden' },
  friendFill: { height: '100%', backgroundColor: C.green, borderRadius: 2 },
  friendStreak: { alignItems: 'center' },
  friendStreakFire: { fontSize: 18 },
  friendStreakNum: { color: C.green, fontWeight: '900', fontSize: 16 },
  addFriendBtn: { backgroundColor: C.card, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginTop: 4 },
  addFriendText: { color: C.green, fontWeight: '700', fontSize: 15 },

  communityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, gap: 12 },
  communityEmoji: { fontSize: 28 },
  communityInfo: { flex: 1 },
  communityName: { color: C.white, fontWeight: '700', fontSize: 15 },
  communityMembers: { color: C.muted, fontSize: 12, marginTop: 2 },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.green },
  joinBtnJoined: { backgroundColor: C.greenDark, borderColor: C.greenDark },
  joinBtnText: { color: C.green, fontWeight: '700', fontSize: 13 },
  joinBtnTextJoined: { color: C.white },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: 28, paddingTop: 10 },
  navTab: { flex: 1, alignItems: 'center', gap: 3 },
  navEmoji: { fontSize: 20 },
  navLabel: { color: C.dim, fontSize: 10, fontWeight: '600' },
  navLabelActive: { color: C.green },
});
