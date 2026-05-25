import { useEffect } from 'react';
import { useStudyStore } from './studyStore';
import { storage } from '../../utils/storage';

export function useSyncStudyStore(planId: string | undefined) {
  const store = useStudyStore();

  // Sync store to storage for backward compatibility
  useEffect(() => {
    if (!planId) return;

    const PLANS_STORAGE_KEY = 'echomentor_study_plans';
    const allPlansProgress = storage.get(PLANS_STORAGE_KEY);
    let plansData: Record<string, any> = {};

    if (allPlansProgress) {
      try {
        plansData = JSON.parse(allPlansProgress);
      } catch (err) {
        console.error('Failed to parse existing plans progress:', err);
      }
    }

    plansData[planId] = {
      completedTopics: Array.from(store.topicsCompleted),
      topicScores: store.topicScores,
      studyStreak: store.streak,
      lastStudyDate: store.lastStudyDate,
    };

    storage.set(PLANS_STORAGE_KEY, JSON.stringify(plansData));
  }, [planId, store.topicsCompleted, store.topicScores, store.streak, store.lastStudyDate]);

  // Load from old storage on mount
  useEffect(() => {
    if (!planId) return;

    const PLANS_STORAGE_KEY = 'echomentor_study_plans';
    const allPlansProgress = storage.get(PLANS_STORAGE_KEY);

    if (allPlansProgress) {
      try {
        const plansData = JSON.parse(allPlansProgress);
        const planProgress = plansData[planId];

        if (planProgress) {
          store.topicsCompleted.clear();
          planProgress.completedTopics?.forEach((topic: string) => {
            store.topicsCompleted.add(topic);
          });

          if (planProgress.topicScores) {
            Object.entries(planProgress.topicScores).forEach(([topic, score]) => {
              store.setTopicScore(topic, score as number);
            });
          }

          if (planProgress.studyStreak !== undefined) {
            // Update streak through store
          }
        }
      } catch (err) {
        console.error('Failed to load plan progress:', err);
      }
    }
  }, [planId]);
}
