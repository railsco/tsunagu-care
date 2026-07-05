import type { FeedbackViewRow, FeedbackWithRelations } from '@tsunagu-care/shared';

type FeedbackViewWithReceiver = FeedbackViewRow & {
  care_receiver: { id: string; name: string } | null;
};

// feedbacks_view のフラットな投稿者カラムを、既存コンポーネントが期待する
// ネスト形（family_member: { id, name, relation }）に変換する。
// 匿名投稿では view 側で family_member_id が NULL になるため family_member も null になる。
export function toFeedbackWithRelations(row: FeedbackViewWithReceiver): FeedbackWithRelations {
  const { family_member_name, family_member_relation, ...feedback } = row;
  return {
    ...feedback,
    family_member: row.family_member_id
      ? {
          id: row.family_member_id,
          name: family_member_name ?? '',
          relation: family_member_relation ?? '',
        }
      : null,
  };
}
