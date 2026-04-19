import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import {
  Upload,
  Languages,
  RotateCcw,
  BookOpen,
  BarChart3,
  XCircle,
  CheckCircle2,
  Layers3,
  Brain,
  CalendarClock,
  Download,
  UploadCloud,
  Archive,
  Flame,
} from 'lucide-react';

const STORAGE_KEY = 'spanish-trainer-web-release-v1';

// ---------- Tiny UI layer ----------
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Card({ className = '', children }) {
  return <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>;
}
function CardHeader({ className = '', children }) {
  return <div className={cn('p-5 pb-0', className)}>{children}</div>;
}
function CardContent({ className = '', children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
function CardTitle({ className = '', children }) {
  return <h2 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h2>;
}
function CardDescription({ className = '', children }) {
  return <div className={cn('mt-1 text-sm text-slate-500', className)}>{children}</div>;
}
function Button({ variant = 'default', className = '', children, ...props }) {
  const styles = {
    default: 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-900',
    outline: 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-300',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-100',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant] || styles.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
function Input({ className = '', ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500',
        className
      )}
      {...props}
    />
  );
}
function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500',
        className
      )}
      {...props}
    />
  );
}
function Badge({ variant = 'default', className = '', children }) {
  const styles = {
    default: 'bg-slate-900 text-white',
    secondary: 'bg-slate-100 text-slate-700',
  };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', styles[variant] || styles.default, className)}>{children}</span>;
}
function Progress({ value = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-3 w-full overflow-hidden rounded-full bg-slate-200', className)}>
      <div className="h-full rounded-full bg-slate-700 transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
}

const TabsContext = createContext(null);
function Tabs({ value, onValueChange, className = '', children }) {
  return <TabsContext.Provider value={{ value, onValueChange }}><div className={className}>{children}</div></TabsContext.Provider>;
}
function TabsList({ className = '', children }) {
  return <div className={cn('inline-grid rounded-2xl bg-slate-100 p-1', className)}>{children}</div>;
}
function TabsTrigger({ value, className = '', children }) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx?.onValueChange?.(value)}
      className={cn(
        'rounded-xl px-3 py-2 text-sm font-medium transition',
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
        className
      )}
    >
      {children}
    </button>
  );
}
function TabsContent({ value, className = '', children }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div className={className}>{children}</div>;
}

// ---------- Defaults ----------
const defaultTopics = [
  { topic_id: 'general_library', topic_name: 'Общая библиотека', topic_type: 'mixed', description: 'Все слова, импортированные из CSV', is_active: 'true' },
];

const defaultBlocks = [
  { block_id: 'b001', block_name: 'Текст о Месси', topic_id: 'general_library', source_type: 'csv', source_name: 'vocabulary.csv', description: 'Пример блока', is_active: 'true' },
  { block_id: 'b002', block_name: 'Одежда', topic_id: 'general_library', source_type: 'csv', source_name: 'vocabulary.csv', description: 'Пример тематического блока', is_active: 'true' },
];

const defaultVocabulary = [
  { item_id: 'v0001', topic_id: 'general_library', spanish: 'camisa', russian: 'рубашка', accepted_answers_es: 'camisa', accepted_answers_ru: 'рубашка', explanation: 'Пример слова.', status: 'active' },
  { item_id: 'v0002', topic_id: 'general_library', spanish: 'pantalones', russian: 'брюки', accepted_answers_es: 'pantalones', accepted_answers_ru: 'брюки', explanation: 'Пример слова.', status: 'active' },
  { item_id: 'v0003', topic_id: 'general_library', spanish: 'fútbol', russian: 'футбол', accepted_answers_es: 'fútbol|futbol', accepted_answers_ru: 'футбол', explanation: 'Пример слова.', status: 'active' },
];

const defaultBlockItems = [
  { block_item_id: 'bi0001', block_id: 'b001', item_id: 'v0003', position: '1', is_active: 'true' },
  { block_item_id: 'bi0002', block_id: 'b002', item_id: 'v0001', position: '1', is_active: 'true' },
  { block_item_id: 'bi0003', block_id: 'b002', item_id: 'v0002', position: '2', is_active: 'true' },
];

const defaultGrammarTasks = [
  { task_id: 'g0001', topic_id: 'ser_estar', task_type: 'translation', instruction: 'Переведи на испанский', prompt: 'Я дома.', correct_answer: 'Estoy en casa.', accepted_answers: 'Estoy en casa.|Estoy en mi casa.', error_explanation: 'Для местоположения используется estar.', status: 'active' },
  { task_id: 'g0002', topic_id: 'ser_estar', task_type: 'fill_form', instruction: 'Вставь правильную форму', prompt: 'Madrid ___ la capital de España.', correct_answer: 'es', accepted_answers: 'es', error_explanation: 'Постоянный факт требует ser.', status: 'active' },
  { task_id: 'g0003', topic_id: 'preterito_perfecto', task_type: 'fix_error', instruction: 'Исправь ошибку', prompt: 'Corrige: He comí.', correct_answer: 'He comido.', accepted_answers: 'He comido.', error_explanation: 'После haber нужен participio.', status: 'active' },
];

const defaultOpenTasks = [
  { task_id: 'o0001', topic_id: 'general_library', instruction: 'Напиши короткий ответ', prompt: 'Напиши 1 предложение о том, что ты учишь испанский.', keywords_required: 'español', hint: 'Например: Estudio español todos los días.', error_explanation: 'В ответе должно быть слово español.', status: 'active' },
];

// ---------- Helpers ----------
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const splitLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map((v) => v.trim());
  };
  const headers = splitLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = splitLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[¡!¿?.,;:]/g, '');
}

function getAcceptedAnswers(item, direction) {
  const raw = direction === 'ru_es' ? item.accepted_answers_es || item.spanish : item.accepted_answers_ru || item.russian;
  return String(raw).split('|').map((v) => normalize(v)).filter(Boolean);
}

function daysBetween(isoDate) {
  if (!isoDate) return 999;
  const then = new Date(isoDate).getTime();
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

function getIntervalDays(strength) {
  if (strength <= 20) return 1;
  if (strength <= 40) return 3;
  if (strength <= 60) return 7;
  return 14;
}

function makeInitialItemProgress(itemId) {
  return { item_id: itemId, seen_count: 0, correct_count: 0, wrong_count: 0, last_seen_at: null, last_correct_at: null, strength: 0, next_review_at: null };
}
function makeInitialBlockProgress(blockId) {
  return { block_id: blockId, review_count: 0, reviewed_items: 0, correct_items: 0, wrong_items: 0, last_reviewed_at: null };
}
function makeInitialGrammarProgress(taskId) {
  return { task_id: taskId, seen_count: 0, correct_count: 0, wrong_count: 0, last_seen_at: null, strength: 0, next_review_at: null };
}

function formatGrammarTopicLabel(topicId) {
  const map = {
    general_library: 'Все темы',
    ser_estar: 'Ser / Estar',
    preterito_perfecto: 'Pretérito Perfecto',
    preterito_indefinido: 'Pretérito Indefinido',
    perfecto_vs_indefinido: 'Perfecto vs Indefinido',
    pronombres: 'Местоимения',
    por_para: 'Por / Para',
    numerales: 'Числительные',
  };
  return map[topicId] || topicId.replace(/_/g, ' ');
}
function formatGrammarTaskType(taskType) {
  const map = {
    multiple_choice: 'Выбрать вариант',
    fill_form: 'Вставить форму',
    fix_error: 'Исправить ошибку',
    translation: 'Перевод',
  };
  return map[taskType] || taskType;
}

function StatCard({ title, value, hint, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">{title}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
            <div className="mt-1 text-sm text-slate-500">{hint}</div>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityCalendar({ dailyStats }) {
  const cells = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const total = dailyStats[key]?.total || 0;
    let bg = 'bg-slate-200';
    if (total >= 10) bg = 'bg-slate-700';
    else if (total >= 5) bg = 'bg-slate-400';
    else if (total >= 1) bg = 'bg-slate-300';
    return { key, total, label: key.slice(5), bg };
  });

  return (
    <Card className="rounded-3xl border-0">
      <CardHeader>
        <CardTitle>Календарь активности</CardTitle>
        <CardDescription>Последние 30 дней занятий</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-10">
          {cells.map((cell) => (
            <div key={cell.key} className="space-y-1">
              <div title={`${cell.key}: ${cell.total}`} className={cn('h-8 rounded-lg', cell.bg)} />
              <div className="text-[10px] text-slate-500">{cell.label}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Меньше</span>
          <div className="h-3 w-3 rounded-sm bg-slate-200" />
          <div className="h-3 w-3 rounded-sm bg-slate-300" />
          <div className="h-3 w-3 rounded-sm bg-slate-400" />
          <div className="h-3 w-3 rounded-sm bg-slate-700" />
          <span>Больше</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [topics, setTopics] = useState(defaultTopics);
  const [blocks, setBlocks] = useState(defaultBlocks);
  const [blockItems, setBlockItems] = useState(defaultBlockItems);
  const [vocabulary, setVocabulary] = useState(defaultVocabulary);
  const [grammarTasks, setGrammarTasks] = useState(defaultGrammarTasks);
  const [openTasks, setOpenTasks] = useState(defaultOpenTasks);

  const [selectedTopicId, setSelectedTopicId] = useState(defaultTopics[0].topic_id);
  const [selectedBlockId, setSelectedBlockId] = useState('all');
  const [mode, setMode] = useState('vocabulary');
  const [reviewMode, setReviewMode] = useState('topic');
  const [direction, setDirection] = useState('ru_es');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [importStatus, setImportStatus] = useState('');

  const [stats, setStats] = useState({ total: 0, correct: 0, wrong: 0, streak: 0 });
  const [mistakes, setMistakes] = useState([]);
  const [mistakeMode, setMistakeMode] = useState(false);
  const [mistakeIndex, setMistakeIndex] = useState(0);

  const [itemProgress, setItemProgress] = useState({});
  const [blockProgress, setBlockProgress] = useState({});
  const [grammarProgress, setGrammarProgress] = useState({});
  const [archivedItems, setArchivedItems] = useState({});
  const [dailyStats, setDailyStats] = useState({});
  const [lastStudyDate, setLastStudyDate] = useState(null);

  const [vocabIndex, setVocabIndex] = useState(0);
  const [grammarIndex, setGrammarIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState(0);

  const [selectedGrammarTopicId, setSelectedGrammarTopicId] = useState('all');
  const [selectedGrammarTaskType, setSelectedGrammarTaskType] = useState('all');
  const [grammarReviewMode, setGrammarReviewMode] = useState('topic');

  const topicInputRef = useRef(null);
  const blocksInputRef = useRef(null);
  const blockItemsInputRef = useRef(null);
  const vocabInputRef = useRef(null);
  const grammarInputRef = useRef(null);
  const openInputRef = useRef(null);
  const importProgressRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItemProgress(parsed.itemProgress || {});
        setBlockProgress(parsed.blockProgress || {});
        setGrammarProgress(parsed.grammarProgress || {});
        setArchivedItems(parsed.archivedItems || {});
        setDailyStats(parsed.dailyStats || {});
        setLastStudyDate(parsed.lastStudyDate || null);
        setStats(parsed.stats || { total: 0, correct: 0, wrong: 0, streak: 0 });
        setMistakes(parsed.mistakes || []);
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ itemProgress, blockProgress, grammarProgress, archivedItems, dailyStats, lastStudyDate, stats, mistakes })
      );
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }, [itemProgress, blockProgress, grammarProgress, archivedItems, dailyStats, lastStudyDate, stats, mistakes]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const xp = stats.correct * 10;
  const level = Math.max(1, Math.floor(xp / 250) + 1);
  const todaySolved = dailyStats[todayKey]?.total || 0;
  const todayAccuracy = todaySolved ? Math.round(((dailyStats[todayKey]?.correct || 0) / todaySolved) * 100) : 0;

  const activeTopics = useMemo(() => topics.filter((topic) => String(topic.is_active) !== 'false'), [topics]);
  const activeBlocks = useMemo(() => blocks.filter((block) => String(block.is_active) !== 'false'), [blocks]);
  const currentTopic = activeTopics.find((topic) => topic.topic_id === selectedTopicId) || activeTopics[0];
  const currentBlock = activeBlocks.find((block) => block.block_id === selectedBlockId) || null;

  const blocksForCurrentTopic = useMemo(() => activeBlocks.filter((block) => block.topic_id === currentTopic?.topic_id), [activeBlocks, currentTopic]);

  const blockIdByItemId = useMemo(() => {
    const map = {};
    blockItems.forEach((link) => {
      if (String(link.is_active) !== 'false' && !map[link.item_id]) map[link.item_id] = link.block_id;
    });
    return map;
  }, [blockItems]);

  const topicVocabulary = useMemo(() => {
    if (!currentTopic) return [];
    if (selectedBlockId !== 'all') {
      const allowedIds = new Set(
        blockItems.filter((item) => String(item.is_active) !== 'false' && item.block_id === selectedBlockId).map((item) => item.item_id)
      );
      return vocabulary.filter((item) => item.status !== 'inactive' && !archivedItems[item.item_id] && allowedIds.has(item.item_id));
    }
    return vocabulary.filter((item) => item.topic_id === currentTopic.topic_id && item.status !== 'inactive' && !archivedItems[item.item_id]);
  }, [vocabulary, currentTopic, blockItems, selectedBlockId, archivedItems]);

  const smartReviewVocabulary = useMemo(() => {
    const pool = vocabulary.filter((item) => item.status !== 'inactive' && !archivedItems[item.item_id]);
    const now = Date.now();
    const scored = pool.map((item) => {
      const progress = itemProgress[item.item_id] || makeInitialItemProgress(item.item_id);
      const blockId = blockIdByItemId[item.item_id];
      const bProgress = blockId ? blockProgress[blockId] || makeInitialBlockProgress(blockId) : null;
      const score =
        progress.wrong_count * 30 +
        (progress.seen_count === 0 ? 18 : 0) +
        (!progress.next_review_at || new Date(progress.next_review_at).getTime() <= now ? 25 : 0) +
        (daysBetween(progress.last_seen_at) > 7 ? 12 : daysBetween(progress.last_seen_at) > 3 ? 6 : 0) +
        (bProgress && daysBetween(bProgress.last_reviewed_at) > 7 ? 9 : 0) -
        Math.floor(progress.strength / 8);
      return { item, score };
    });
    return scored.sort((a, b) => b.score - a.score).map((entry) => entry.item);
  }, [vocabulary, archivedItems, itemProgress, blockProgress, blockIdByItemId]);

  const filteredVocabulary = reviewMode === 'smart' ? smartReviewVocabulary : topicVocabulary;

  const grammarTopics = useMemo(
    () => Array.from(new Set(grammarTasks.filter((task) => task.status !== 'inactive').map((task) => task.topic_id).filter(Boolean))),
    [grammarTasks]
  );
  const grammarTaskTypes = useMemo(
    () => Array.from(new Set(grammarTasks.filter((task) => task.status !== 'inactive').map((task) => task.task_type).filter(Boolean))),
    [grammarTasks]
  );

  const filteredGrammar = useMemo(() => {
    let tasks = grammarTasks.filter((task) => task.status !== 'inactive');
    if (selectedGrammarTopicId !== 'all') tasks = tasks.filter((task) => task.topic_id === selectedGrammarTopicId);
    if (selectedGrammarTaskType !== 'all') tasks = tasks.filter((task) => task.task_type === selectedGrammarTaskType);
    if (grammarReviewMode === 'smart') {
      const now = Date.now();
      tasks = [...tasks].sort((a, b) => {
        const pa = grammarProgress[a.task_id] || makeInitialGrammarProgress(a.task_id);
        const pb = grammarProgress[b.task_id] || makeInitialGrammarProgress(b.task_id);
        const scoreA =
          pa.wrong_count * 30 +
          (pa.seen_count === 0 ? 20 : 0) +
          (!pa.next_review_at || new Date(pa.next_review_at).getTime() <= now ? 15 : 0) +
          (daysBetween(pa.last_seen_at) > 7 ? 10 : 0) -
          Math.floor(pa.strength / 8);
        const scoreB =
          pb.wrong_count * 30 +
          (pb.seen_count === 0 ? 20 : 0) +
          (!pb.next_review_at || new Date(pb.next_review_at).getTime() <= now ? 15 : 0) +
          (daysBetween(pb.last_seen_at) > 7 ? 10 : 0) -
          Math.floor(pb.strength / 8);
        return scoreB - scoreA;
      });
    }
    return tasks;
  }, [grammarTasks, selectedGrammarTopicId, selectedGrammarTaskType, grammarReviewMode, grammarProgress]);

  const filteredOpen = useMemo(() => {
    const active = openTasks.filter((task) => task.status !== 'inactive');
    if (currentTopic?.topic_id === 'general_library') return active;
    return active.filter((task) => task.topic_id === currentTopic?.topic_id);
  }, [openTasks, currentTopic]);

  const currentVocab = filteredVocabulary[vocabIndex % Math.max(filteredVocabulary.length, 1)];
  const currentGrammar = filteredGrammar[grammarIndex % Math.max(filteredGrammar.length, 1)];
  const currentOpen = filteredOpen[openIndex % Math.max(filteredOpen.length, 1)];
  const currentMistake = mistakes[mistakeIndex % Math.max(mistakes.length, 1)];

  const dueCount = useMemo(() => {
    const now = Date.now();
    return vocabulary.filter((item) => {
      if (archivedItems[item.item_id]) return false;
      const progress = itemProgress[item.item_id] || makeInitialItemProgress(item.item_id);
      return !progress.next_review_at || new Date(progress.next_review_at).getTime() <= now;
    }).length;
  }, [vocabulary, itemProgress, archivedItems]);

  const newWordsCount = useMemo(
    () => vocabulary.filter((item) => !archivedItems[item.item_id] && (itemProgress[item.item_id] || makeInitialItemProgress(item.item_id)).seen_count === 0).length,
    [vocabulary, itemProgress, archivedItems]
  );

  const staleBlocks = useMemo(() => {
    return activeBlocks
      .map((block) => ({
        block,
        progress: blockProgress[block.block_id] || makeInitialBlockProgress(block.block_id),
        days: daysBetween((blockProgress[block.block_id] || makeInitialBlockProgress(block.block_id)).last_reviewed_at),
      }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 3);
  }, [activeBlocks, blockProgress]);

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  const grammarStatsByTopic = useMemo(() => {
    const summary = {};
    grammarTasks
      .filter((task) => task.status !== 'inactive')
      .forEach((task) => {
        const p = grammarProgress[task.task_id] || makeInitialGrammarProgress(task.task_id);
        if (!summary[task.topic_id]) summary[task.topic_id] = { total: 0, correct: 0, wrong: 0 };
        summary[task.topic_id].total += p.seen_count;
        summary[task.topic_id].correct += p.correct_count;
        summary[task.topic_id].wrong += p.wrong_count;
      });
    return Object.entries(summary)
      .map(([topicId, data]) => ({
        topicId,
        accuracy: data.total ? Math.round((data.correct / data.total) * 100) : 0,
        total: data.total,
        wrong: data.wrong,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [grammarTasks, grammarProgress]);

  function updateProgressForItem(itemId, isCorrect) {
    setItemProgress((prev) => {
      const current = prev[itemId] || makeInitialItemProgress(itemId);
      const nextStrength = Math.max(0, current.strength + (isCorrect ? 10 : -15));
      const intervalDays = isCorrect ? getIntervalDays(nextStrength) : 0;
      const nextReviewDate = new Date();
      if (isCorrect) nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
      else nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
      return {
        ...prev,
        [itemId]: {
          ...current,
          seen_count: current.seen_count + 1,
          correct_count: current.correct_count + (isCorrect ? 1 : 0),
          wrong_count: current.wrong_count + (isCorrect ? 0 : 1),
          last_seen_at: new Date().toISOString(),
          last_correct_at: isCorrect ? new Date().toISOString() : current.last_correct_at,
          strength: nextStrength,
          next_review_at: nextReviewDate.toISOString(),
        },
      };
    });

    const blockId = blockIdByItemId[itemId];
    if (blockId) {
      setBlockProgress((prev) => {
        const current = prev[blockId] || makeInitialBlockProgress(blockId);
        return {
          ...prev,
          [blockId]: {
            ...current,
            reviewed_items: current.reviewed_items + 1,
            correct_items: current.correct_items + (isCorrect ? 1 : 0),
            wrong_items: current.wrong_items + (isCorrect ? 0 : 1),
            review_count: current.review_count + 1,
            last_reviewed_at: new Date().toISOString(),
          },
        };
      });
    }
  }

  function updateGrammarProgress(taskId, isCorrect) {
    setGrammarProgress((prev) => {
      const current = prev[taskId] || makeInitialGrammarProgress(taskId);
      const nextStrength = Math.max(0, current.strength + (isCorrect ? 10 : -15));
      const nextReviewDate = new Date();
      if (isCorrect) nextReviewDate.setDate(nextReviewDate.getDate() + getIntervalDays(nextStrength));
      else nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
      return {
        ...prev,
        [taskId]: {
          ...current,
          seen_count: current.seen_count + 1,
          correct_count: current.correct_count + (isCorrect ? 1 : 0),
          wrong_count: current.wrong_count + (isCorrect ? 0 : 1),
          last_seen_at: new Date().toISOString(),
          strength: nextStrength,
          next_review_at: nextReviewDate.toISOString(),
        },
      };
    });
  }

  function registerResult({ isCorrect, explanation, correctAnswer, prompt, topicName, modeName }) {
    setStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
    setDailyStats((prev) => ({
      ...prev,
      [todayKey]: {
        total: (prev[todayKey]?.total || 0) + 1,
        correct: (prev[todayKey]?.correct || 0) + (isCorrect ? 1 : 0),
      },
    }));
    setLastStudyDate(todayKey);
    if (!isCorrect) {
      setMistakes((prev) => [{ id: `${Date.now()}-${Math.random()}`, mode: modeName, topic: topicName, prompt, correctAnswer, explanation }, ...prev].slice(0, 30));
    }
  }

  function handleAnswerKeyDown(event, submitFn) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitFn();
    }
  }

  function nextTask() {
    setAnswer('');
    setFeedback(null);
    if (mistakeMode) return setMistakeIndex((prev) => prev + 1);
    if (mode === 'vocabulary') setVocabIndex((prev) => prev + 1);
    if (mode === 'grammar') setGrammarIndex((prev) => prev + 1);
    if (mode === 'open') setOpenIndex((prev) => prev + 1);
  }

  function checkVocabulary(autoAdvance = false) {
    if (!currentVocab) return;
    const accepted = getAcceptedAnswers(currentVocab, direction);
    const user = normalize(answer);
    const ok = accepted.includes(user);
    const correctAnswer = direction === 'ru_es' ? currentVocab.spanish : currentVocab.russian;
    const text = ok ? 'Верно.' : `Неверно. Правильно: ${correctAnswer}. Почему: ${currentVocab.explanation}`;
    setFeedback({ type: ok ? 'success' : 'error', text });
    updateProgressForItem(currentVocab.item_id, ok);
    registerResult({
      isCorrect: ok,
      explanation: currentVocab.explanation,
      correctAnswer,
      prompt: direction === 'ru_es' ? currentVocab.russian : currentVocab.spanish,
      topicName: reviewMode === 'smart' ? 'Общее повторение' : currentBlock ? `${currentTopic?.topic_name} · ${currentBlock.block_name}` : currentTopic?.topic_name,
      modeName: reviewMode === 'smart' ? 'Smart Review' : 'Лексика',
    });
    if (ok && autoAdvance) setTimeout(() => nextTask(), 150);
  }

  function checkGrammar(autoAdvance = false) {
    if (!currentGrammar) return;
    const accepted = String(currentGrammar.accepted_answers || currentGrammar.correct_answer)
      .split('|')
      .map((v) => normalize(v));
    const user = normalize(answer);
    const ok = accepted.includes(user);
    const text = ok ? 'Верно.' : `Неверно. Правильно: ${currentGrammar.correct_answer}. Почему: ${currentGrammar.error_explanation}`;
    setFeedback({ type: ok ? 'success' : 'error', text });
    updateGrammarProgress(currentGrammar.task_id, ok);
    registerResult({
      isCorrect: ok,
      explanation: currentGrammar.error_explanation,
      correctAnswer: currentGrammar.correct_answer,
      prompt: currentGrammar.prompt,
      topicName: formatGrammarTopicLabel(currentGrammar.topic_id),
      modeName: 'Грамматика',
    });
    if (ok && autoAdvance) setTimeout(() => nextTask(), 150);
  }

  function checkOpen() {
    if (!currentOpen) return;
    const required = String(currentOpen.keywords_required || '')
      .split('|')
      .map((v) => normalize(v))
      .filter(Boolean);
    const user = normalize(answer);
    const ok = required.some((word) => user.includes(word));
    const text = ok ? 'Ответ принят. Базовая проверка пройдена.' : `Пока не засчитано. Почему: ${currentOpen.error_explanation}`;
    setFeedback({ type: ok ? 'success' : 'error', text });
    registerResult({
      isCorrect: ok,
      explanation: currentOpen.error_explanation,
      correctAnswer: currentOpen.hint,
      prompt: currentOpen.prompt,
      topicName: currentTopic?.topic_name,
      modeName: 'Открытое задание',
    });
  }

  function removeCurrentMistake() {
    if (!mistakes.length) return;
    setMistakes((prev) => {
      const next = prev.filter((_, index) => index !== mistakeIndex % prev.length);
      if (!next.length) {
        setMistakeMode(false);
        setMistakeIndex(0);
      } else if (mistakeIndex >= next.length) {
        setMistakeIndex(0);
      }
      return next;
    });
  }

  function checkMistakeRetry(autoAdvance = false) {
    if (!currentMistake) return;
    const accepted = String(currentMistake.correctAnswer || '')
      .split('|')
      .map((v) => normalize(v))
      .filter(Boolean);
    const user = normalize(answer);
    const ok = accepted.includes(user);
    if (ok) {
      setFeedback({ type: 'success', text: 'Верно. Ошибка убрана из блока повторения.' });
      registerResult({
        isCorrect: true,
        explanation: currentMistake.explanation,
        correctAnswer: currentMistake.correctAnswer,
        prompt: currentMistake.prompt,
        topicName: currentMistake.topic,
        modeName: `Повторение: ${currentMistake.mode}`,
      });
      removeCurrentMistake();
      setAnswer('');
      if (autoAdvance) setTimeout(() => nextTask(), 150);
    } else {
      setFeedback({ type: 'error', text: `Пока неверно. Правильно: ${currentMistake.correctAnswer}. Почему: ${currentMistake.explanation}` });
      registerResult({
        isCorrect: false,
        explanation: currentMistake.explanation,
        correctAnswer: currentMistake.correctAnswer,
        prompt: currentMistake.prompt,
        topicName: currentMistake.topic,
        modeName: `Повторение: ${currentMistake.mode}`,
      });
    }
  }

  function resetProgress() {
    setStats({ total: 0, correct: 0, wrong: 0, streak: 0 });
    setMistakes([]);
    setMistakeMode(false);
    setMistakeIndex(0);
    setItemProgress({});
    setBlockProgress({});
    setGrammarProgress({});
    setArchivedItems({});
    setDailyStats({});
    setLastStudyDate(null);
    setAnswer('');
    setFeedback(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function archiveCurrentWord() {
    if (!currentVocab) return;
    setArchivedItems((prev) => ({ ...prev, [currentVocab.item_id]: true }));
    setFeedback({ type: 'success', text: `Слово «${currentVocab.spanish}» отправлено в архив.` });
    setAnswer('');
    setTimeout(() => setVocabIndex((prev) => prev + 1), 0);
  }

  function exportProgress() {
    const payload = { itemProgress, blockProgress, grammarProgress, archivedItems, dailyStats, lastStudyDate, stats, mistakes, exported_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spanish_trainer_progress.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importProgressFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setItemProgress(parsed.itemProgress || {});
      setBlockProgress(parsed.blockProgress || {});
      setGrammarProgress(parsed.grammarProgress || {});
      setArchivedItems(parsed.archivedItems || {});
      setDailyStats(parsed.dailyStats || {});
      setLastStudyDate(parsed.lastStudyDate || null);
      setStats(parsed.stats || { total: 0, correct: 0, wrong: 0, streak: 0 });
      setMistakes(parsed.mistakes || []);
      setImportStatus('Прогресс успешно импортирован.');
    } catch {
      setImportStatus('Не удалось импортировать прогресс. Проверь JSON-файл.');
    }
  }

  async function handleFileImport(event, kind) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCSV(text);
    if (!rows.length) return setImportStatus('Файл пустой или не распознан.');
    if (kind === 'topics') {
      setTopics(rows);
      setSelectedTopicId(rows[0]?.topic_id || '');
      setSelectedBlockId('all');
      setImportStatus(`Импортировано тем: ${rows.length}`);
    }
    if (kind === 'blocks') {
      setBlocks(rows);
      setSelectedBlockId('all');
      setImportStatus(`Импортировано блоков: ${rows.length}`);
    }
    if (kind === 'block_items') {
      setBlockItems(rows);
      setSelectedBlockId('all');
      setImportStatus(`Импортировано связей слов с блоками: ${rows.length}`);
    }
    if (kind === 'vocabulary') {
      setVocabulary(rows);
      setImportStatus(`Импортировано слов/фраз: ${rows.length}`);
    }
    if (kind === 'grammar') {
      setGrammarTasks(rows);
      setImportStatus(`Импортировано грамматических заданий: ${rows.length}`);
    }
    if (kind === 'open') {
      setOpenTasks(rows);
      setImportStatus(`Импортировано открытых заданий: ${rows.length}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <Card className="rounded-3xl border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3">
                  <Languages className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Spanish Trainer</CardTitle>
                  <CardDescription>Релизная веб-версия с прогрессом, уровнями и календарём</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 text-sm font-medium text-slate-700">Темы</div>
                <div className="space-y-2">
                  {activeTopics.map((topic) => (
                    <button
                      key={topic.topic_id}
                      onClick={() => {
                        setSelectedTopicId(topic.topic_id);
                        setSelectedBlockId('all');
                        setReviewMode('topic');
                        setAnswer('');
                        setFeedback(null);
                        setVocabIndex(0);
                        setGrammarIndex(0);
                        setOpenIndex(0);
                      }}
                      className={cn(
                        'w-full rounded-2xl border p-3 text-left transition',
                        selectedTopicId === topic.topic_id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{topic.topic_name}</div>
                          <div className={cn('mt-1 text-sm', selectedTopicId === topic.topic_id ? 'text-slate-300' : 'text-slate-500')}>{topic.description}</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                          {topic.topic_type}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-slate-100 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Brain className="h-4 w-4" /> Режим повторения
                </div>
                <Button
                  variant={reviewMode === 'topic' ? 'default' : 'outline'}
                  className="w-full justify-start rounded-2xl"
                  onClick={() => {
                    setReviewMode('topic');
                    setSelectedBlockId('all');
                    setVocabIndex(0);
                    setAnswer('');
                    setFeedback(null);
                  }}
                >
                  По теме / блоку
                </Button>
                <Button
                  variant={reviewMode === 'smart' ? 'default' : 'outline'}
                  className="w-full justify-start rounded-2xl"
                  onClick={() => {
                    setReviewMode('smart');
                    setSelectedBlockId('all');
                    setVocabIndex(0);
                    setAnswer('');
                    setFeedback(null);
                  }}
                >
                  Общее Smart Review
                </Button>
                <div className="rounded-2xl border border-dashed p-3 text-sm text-slate-600">
                  К повторению сейчас: <span className="font-medium text-slate-900">{dueCount}</span>
                  <br />
                  Новых слов: <span className="font-medium text-slate-900">{newWordsCount}</span>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-slate-100 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarClock className="h-4 w-4" /> Блоки, которые давно не повторялись
                </div>
                {staleBlocks.map(({ block, days, progress }) => (
                  <div key={block.block_id} className="rounded-2xl border bg-white p-3">
                    <div className="font-medium text-slate-900">{block.block_name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {days > 900 ? 'ещё не повторялся' : `${days} дн. назад`} · ответов: {progress.reviewed_items}
                    </div>
                  </div>
                ))}
              </div>

              {reviewMode === 'topic' ? (
                <div className="space-y-3 rounded-2xl bg-slate-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Layers3 className="h-4 w-4" /> Блоки лексики
                  </div>
                  <Button
                    variant={selectedBlockId === 'all' ? 'default' : 'outline'}
                    className="w-full justify-start rounded-2xl"
                    onClick={() => {
                      setSelectedBlockId('all');
                      setAnswer('');
                      setFeedback(null);
                      setVocabIndex(0);
                    }}
                  >
                    Вся тема целиком
                  </Button>
                  {blocksForCurrentTopic.length ? (
                    blocksForCurrentTopic.map((block) => (
                      <Button
                        key={block.block_id}
                        variant={selectedBlockId === block.block_id ? 'default' : 'outline'}
                        className="h-auto w-full justify-start rounded-2xl py-3 text-left"
                        onClick={() => {
                          setSelectedBlockId(block.block_id);
                          setAnswer('');
                          setFeedback(null);
                          setVocabIndex(0);
                        }}
                      >
                        <div>
                          <div className="font-medium">{block.block_name}</div>
                          <div className="mt-1 text-xs text-slate-500">{block.description}</div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed p-3 text-sm text-slate-500">Для этой темы пока нет блоков.</div>
                  )}
                </div>
              ) : null}

              <div className="space-y-3 rounded-2xl bg-slate-100 p-4">
                <div className="text-sm font-medium text-slate-700">Импорт библиотеки</div>
                <div className="rounded-2xl border border-dashed p-3 text-sm text-slate-600">
                  Для боевого использования загрузи свои CSV: topics, blocks, block_items, vocabulary, grammar_tasks и open_tasks. Прогресс хранится локально в браузере.
                </div>
                <div className="grid gap-2">
                  <input ref={topicInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileImport(e, 'topics')} />
                  <input ref={blocksInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileImport(e, 'blocks')} />
                  <input ref={blockItemsInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileImport(e, 'block_items')} />
                  <input ref={vocabInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileImport(e, 'vocabulary')} />
                  <input ref={grammarInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileImport(e, 'grammar')} />
                  <input ref={openInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileImport(e, 'open')} />
                  <input ref={importProgressRef} type="file" accept=".json" className="hidden" onChange={importProgressFile} />
                  <Button variant="outline" className="justify-start rounded-2xl" onClick={() => topicInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Загрузить topics.csv
                  </Button>
                  <Button variant="outline" className="justify-start rounded-2xl" onClick={() => blocksInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Загрузить blocks.csv
                  </Button>
                  <Button variant="outline" className="justify-start rounded-2xl" onClick={() => blockItemsInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Загрузить block_items.csv
                  </Button>
                  <Button variant="outline" className="justify-start rounded-2xl" onClick={() => vocabInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Загрузить vocabulary.csv
                  </Button>
                  <Button variant="outline" className="justify-start rounded-2xl" onClick={() => grammarInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Загрузить grammar_tasks.csv
                  </Button>
                  <Button variant="outline" className="justify-start rounded-2xl" onClick={() => openInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Загрузить open_tasks.csv
                  </Button>
                  <Button variant="outline" className="justify-start rounded-2xl" onClick={exportProgress}>
                    <Download className="mr-2 h-4 w-4" /> Экспортировать прогресс
                  </Button>
                  <Button variant="outline" className="justify-start rounded-2xl" onClick={() => importProgressRef.current?.click()}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Импортировать прогресс
                  </Button>
                </div>
                {importStatus ? <div className="text-sm text-slate-600">{importStatus}</div> : null}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-6">
              <StatCard title="Всего ответов" value={stats.total} hint="Все проверенные задания" icon={BookOpen} />
              <StatCard title="Точность" value={`${accuracy}%`} hint="Доля верных ответов" icon={BarChart3} />
              <StatCard title="Ошибки" value={stats.wrong} hint="Для повторения" icon={XCircle} />
              <StatCard title="Серия" value={stats.streak} hint="Подряд без ошибок" icon={CheckCircle2} />
              <StatCard title="XP" value={xp} hint="Очки прогресса" icon={Brain} />
              <StatCard title="Уровень" value={level} hint="Каждые 250 XP" icon={Flame} />
            </div>

            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Релизный статус</div>
                    <div className="mt-1 text-base font-medium text-slate-900">
                      Функционал зафиксирован. Следующий этап — GitHub → Vercel и публикация по ссылке.
                    </div>
                  </div>
                  <Badge className="rounded-full">Release Candidate</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardContent className="p-5"><div className="text-sm text-slate-500">Сегодня решено</div><div className="mt-2 text-3xl font-semibold text-slate-900">{todaySolved}</div></CardContent></Card>
              <Card><CardContent className="p-5"><div className="text-sm text-slate-500">Точность сегодня</div><div className="mt-2 text-3xl font-semibold text-slate-900">{todayAccuracy}%</div></CardContent></Card>
              <Card><CardContent className="p-5"><div className="text-sm text-slate-500">Последняя сессия</div><div className="mt-2 text-2xl font-semibold text-slate-900">{lastStudyDate || '—'}</div></CardContent></Card>
            </div>

            <ActivityCalendar dailyStats={dailyStats} />

            <Card className="rounded-3xl border-0">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {mistakeMode ? 'Повторение ошибок' : reviewMode === 'smart' ? 'Общее Smart Review' : currentBlock ? currentBlock.block_name : currentTopic?.topic_name || 'Тема не выбрана'}
                    </CardTitle>
                    <CardDescription>
                      {mistakeMode
                        ? 'Отдельный режим тренировки только по ошибкам'
                        : reviewMode === 'smart'
                        ? 'Слова с ошибками, просроченные и новые — с учетом давности блоков'
                        : currentBlock
                        ? currentBlock.description
                        : currentTopic?.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={mistakeMode ? 'default' : 'outline'}
                      className="rounded-2xl"
                      onClick={() => {
                        setMistakeMode((prev) => !prev);
                        setMistakeIndex(0);
                        setFeedback(null);
                        setAnswer('');
                      }}
                      disabled={!mistakes.length}
                    >
                      Повторить ошибки
                    </Button>
                    <Button variant="outline" className="rounded-2xl" onClick={resetProgress}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Сбросить прогресс
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mistakeMode ? (
                  <div className="space-y-5">
                    {currentMistake ? (
                      <Card className="rounded-3xl bg-slate-50 shadow-none">
                        <CardContent className="space-y-4 p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full">Повторение ошибок</Badge>
                            <Badge variant="secondary" className="rounded-full">{currentMistake.mode}</Badge>
                            <Badge variant="secondary" className="rounded-full">{currentMistake.topic}</Badge>
                          </div>
                          <div className="text-sm text-slate-500">Дай правильный ответ на задание, где была ошибка</div>
                          <div className="text-xl font-semibold text-slate-900">{currentMistake.prompt}</div>
                          <Input value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => handleAnswerKeyDown(e, () => checkMistakeRetry(true))} placeholder="Введи правильный ответ" className="h-12 rounded-2xl" />
                          <div className="flex gap-2">
                            <Button className="rounded-2xl" onClick={checkMistakeRetry}>Проверить</Button>
                            <Button variant="outline" className="rounded-2xl" onClick={nextTask}>Следующая ошибка</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="rounded-2xl border border-dashed p-6 text-slate-500">Ошибок для повторения нет.</div>
                    )}
                  </div>
                ) : (
                  <Tabs value={mode} onValueChange={setMode} className="space-y-5">
                    <TabsList className="grid w-full grid-cols-3 rounded-2xl">
                      <TabsTrigger value="vocabulary" className="rounded-2xl">Лексика</TabsTrigger>
                      <TabsTrigger value="grammar" className="rounded-2xl">Грамматика</TabsTrigger>
                      <TabsTrigger value="open" className="rounded-2xl">Открытые</TabsTrigger>
                    </TabsList>

                    <TabsContent value="vocabulary" className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        <Button variant={direction === 'ru_es' ? 'default' : 'outline'} className="rounded-2xl" onClick={() => setDirection('ru_es')}>RU → ES</Button>
                        <Button variant={direction === 'es_ru' ? 'default' : 'outline'} className="rounded-2xl" onClick={() => setDirection('es_ru')}>ES → RU</Button>
                      </div>
                      {currentVocab ? (
                        <Card className="rounded-3xl bg-slate-50 shadow-none">
                          <CardContent className="space-y-4 p-6">
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-sm text-slate-500">Переведи</div>
                              <Badge variant="secondary" className="rounded-full">Сила: {(itemProgress[currentVocab.item_id] || makeInitialItemProgress(currentVocab.item_id)).strength}</Badge>
                            </div>
                            <div className="text-3xl font-semibold text-slate-900">{direction === 'ru_es' ? currentVocab.russian : currentVocab.spanish}</div>
                            <Input value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => handleAnswerKeyDown(e, () => checkVocabulary(true))} placeholder="Введи ответ" className="h-12 rounded-2xl" />
                            <div className="flex flex-wrap gap-2">
                              <Button className="rounded-2xl" onClick={checkVocabulary}>Проверить</Button>
                              <Button variant="outline" className="rounded-2xl" onClick={nextTask}>Следующее</Button>
                              <Button variant="outline" className="rounded-2xl" onClick={archiveCurrentWord}><Archive className="mr-2 h-4 w-4" /> В архив</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="rounded-2xl border border-dashed p-6 text-slate-500">Для текущего выбора пока нет слов.</div>
                      )}
                    </TabsContent>

                    <TabsContent value="grammar" className="space-y-5">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2 rounded-2xl bg-slate-100 p-4">
                          <div className="text-sm font-medium text-slate-700">Режим грамматики</div>
                          <Button variant={grammarReviewMode === 'topic' ? 'default' : 'outline'} className="w-full justify-start rounded-2xl" onClick={() => { setGrammarReviewMode('topic'); setGrammarIndex(0); setAnswer(''); setFeedback(null); }}>По фильтру</Button>
                          <Button variant={grammarReviewMode === 'smart' ? 'default' : 'outline'} className="w-full justify-start rounded-2xl" onClick={() => { setGrammarReviewMode('smart'); setGrammarIndex(0); setAnswer(''); setFeedback(null); }}>Smart Review</Button>
                        </div>
                        <div className="space-y-2 rounded-2xl bg-slate-100 p-4">
                          <div className="text-sm font-medium text-slate-700">Тема</div>
                          <Button variant={selectedGrammarTopicId === 'all' ? 'default' : 'outline'} className="w-full justify-start rounded-2xl" onClick={() => { setSelectedGrammarTopicId('all'); setGrammarIndex(0); setAnswer(''); setFeedback(null); }}>Все темы</Button>
                          {grammarTopics.map((topicId) => (
                            <Button key={topicId} variant={selectedGrammarTopicId === topicId ? 'default' : 'outline'} className="w-full justify-start rounded-2xl" onClick={() => { setSelectedGrammarTopicId(topicId); setGrammarIndex(0); setAnswer(''); setFeedback(null); }}>{formatGrammarTopicLabel(topicId)}</Button>
                          ))}
                        </div>
                        <div className="space-y-2 rounded-2xl bg-slate-100 p-4">
                          <div className="text-sm font-medium text-slate-700">Тип задания</div>
                          <Button variant={selectedGrammarTaskType === 'all' ? 'default' : 'outline'} className="w-full justify-start rounded-2xl" onClick={() => { setSelectedGrammarTaskType('all'); setGrammarIndex(0); setAnswer(''); setFeedback(null); }}>Все типы</Button>
                          {grammarTaskTypes.map((taskType) => (
                            <Button key={taskType} variant={selectedGrammarTaskType === taskType ? 'default' : 'outline'} className="w-full justify-start rounded-2xl" onClick={() => { setSelectedGrammarTaskType(taskType); setGrammarIndex(0); setAnswer(''); setFeedback(null); }}>{formatGrammarTaskType(taskType)}</Button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border p-4 text-sm text-slate-600">
                        Сейчас в очереди: <span className="font-medium text-slate-900">{filteredGrammar.length}</span>
                        {currentGrammar ? (
                          <span>
                            {' '}· тема: <span className="font-medium text-slate-900">{formatGrammarTopicLabel(currentGrammar.topic_id)}</span> · тип:{' '}
                            <span className="font-medium text-slate-900">{formatGrammarTaskType(currentGrammar.task_type)}</span>
                          </span>
                        ) : null}
                      </div>
                      {currentGrammar ? (
                        <Card className="rounded-3xl bg-slate-50 shadow-none">
                          <CardContent className="space-y-4 p-6">
                            <div className="text-sm text-slate-500">{currentGrammar.instruction}</div>
                            <div className="text-xl font-semibold text-slate-900">{currentGrammar.prompt}</div>
                            <Input value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => handleAnswerKeyDown(e, () => checkGrammar(true))} placeholder="Введи ответ" className="h-12 rounded-2xl" />
                            <div className="flex gap-2">
                              <Button className="rounded-2xl" onClick={checkGrammar}>Проверить</Button>
                              <Button variant="outline" className="rounded-2xl" onClick={nextTask}>Следующее</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="rounded-2xl border border-dashed p-6 text-slate-500">Нет грамматических заданий под текущий фильтр.</div>
                      )}
                    </TabsContent>

                    <TabsContent value="open" className="space-y-5">
                      {currentOpen ? (
                        <Card className="rounded-3xl bg-slate-50 shadow-none">
                          <CardContent className="space-y-4 p-6">
                            <div className="text-sm text-slate-500">{currentOpen.instruction}</div>
                            <div className="text-xl font-semibold text-slate-900">{currentOpen.prompt}</div>
                            <Textarea
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.ctrlKey && e.key === 'Enter') {
                                  e.preventDefault();
                                  checkOpen();
                                }
                              }}
                              placeholder="Напиши ответ на испанском"
                              className="min-h-[140px] rounded-2xl"
                            />
                            <div className="text-sm text-slate-500">Подсказка: {currentOpen.hint}</div>
                            <div className="flex gap-2">
                              <Button className="rounded-2xl" onClick={checkOpen}>Проверить</Button>
                              <Button variant="outline" className="rounded-2xl" onClick={nextTask}>Следующее</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="rounded-2xl border border-dashed p-6 text-slate-500">Для этой темы пока нет open_tasks.csv.</div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                {feedback ? (
                  <div className={cn('mt-5 rounded-2xl p-4 text-sm', feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800')}>
                    {feedback.text}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
              <Card className="rounded-3xl border-0">
                <CardHeader>
                  <CardTitle>Статистика по грамматике</CardTitle>
                  <CardDescription>Видно слабые темы и где нужен повтор</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {grammarStatsByTopic.length ? (
                    grammarStatsByTopic.map((row) => (
                      <div key={row.topicId} className="rounded-2xl border p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-medium text-slate-900">{formatGrammarTopicLabel(row.topicId)}</div>
                            <div className="mt-1 text-sm text-slate-500">Решено: {row.total} · Ошибок: {row.wrong}</div>
                          </div>
                          <div className="text-2xl font-semibold text-slate-900">{row.accuracy}%</div>
                        </div>
                        <div className="mt-3"><Progress value={row.accuracy} className="h-3" /></div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed p-6 text-slate-500">Пока нет данных по грамматике.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0">
                <CardHeader>
                  <CardTitle>Сегодня к повторению</CardTitle>
                  <CardDescription>Короткий вход в ежедневную сессию</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">XP до следующего уровня</span>
                      <span className="font-medium text-slate-900">{250 - (xp % 250 || 250)}</span>
                    </div>
                    <Progress value={(xp % 250) / 2.5} className="h-3" />
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="text-sm text-slate-600">Что уже работает</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-800">
                      <li>• XP и уровни</li>
                      <li>• статистика по дням</li>
                      <li>• календарь активности</li>
                      <li>• smart review по грамматике</li>
                      <li>• ошибки и повторение ошибок</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
