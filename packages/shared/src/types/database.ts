// ============================================
// Supabase テーブル型定義
// ============================================
// スキーマ変更時は packages/supabase/migrations/ と必ず同期させること。
// supabase CLI が使える環境では `pnpm --filter supabase gen:types` で
// 生成型と差分がないか確認できる。

// nullableフィールドをoptionalにするユーティリティ型
type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never;
}[keyof T];
type MakeNullableOptional<T> = Omit<T, NullableKeys<T>> & Partial<Pick<T, NullableKeys<T>>>;

// --------------------------------------------
// Organization（事業所）
// --------------------------------------------
export type Organization = {
  id: string;
  name: string;
  license_number: string | null;
  address: string | null;
  phone: string | null;
  plan: 'free' | 'standard' | 'premium';
  created_at: string;
  updated_at: string;
};

export type OrganizationInsert = MakeNullableOptional<Omit<Organization, 'id' | 'created_at' | 'updated_at'>> & Partial<Pick<Organization, 'id' | 'plan'>>;

export type OrganizationUpdate = Partial<OrganizationInsert>;

// --------------------------------------------
// CareManager（ケアマネージャー）
// --------------------------------------------
export type CareManager = {
  id: string;
  auth_id: string | null;
  organization_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CareManagerInsert = MakeNullableOptional<Omit<CareManager, 'id' | 'created_at' | 'updated_at'>> & Partial<Pick<CareManager, 'id' | 'is_active'>>;

export type CareManagerUpdate = Partial<CareManagerInsert>;

// --------------------------------------------
// CareReceiver（利用者）
// --------------------------------------------
export type CareLevel =
  | '要支援1'
  | '要支援2'
  | '要介護1'
  | '要介護2'
  | '要介護3'
  | '要介護4'
  | '要介護5';

export type Gender = 'male' | 'female' | 'other';

export type CareReceiver = {
  id: string;
  care_manager_id: string | null;
  name: string;
  birth_date: string | null;
  gender: Gender | null;
  care_level: CareLevel | null;
  conditions: string[] | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CareReceiverInsert = MakeNullableOptional<Omit<CareReceiver, 'id' | 'created_at' | 'updated_at'>> & Partial<Pick<CareReceiver, 'id' | 'is_active'>>;

export type CareReceiverUpdate = Partial<CareReceiverInsert>;

// --------------------------------------------
// FamilyMember（家族）
// --------------------------------------------
export type FamilyRole = 'primary' | 'editor' | 'viewer';

export type FamilyMember = {
  id: string;
  auth_id: string | null;
  care_receiver_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  relation: string;
  role: FamilyRole;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type FamilyMemberInsert = MakeNullableOptional<Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>> & Partial<Pick<FamilyMember, 'id' | 'role' | 'is_primary'>>;

export type FamilyMemberUpdate = Partial<FamilyMemberInsert>;

// --------------------------------------------
// DailyLog（日々の記録）
// --------------------------------------------
export type ScoreValue = 1 | 2 | 3 | 4 | 5;

export type DailyLog = {
  id: string;
  care_receiver_id: string | null;
  family_member_id: string | null;
  log_date: string;
  mood: ScoreValue | null;
  appetite: ScoreValue | null;
  sleep_quality: ScoreValue | null;
  activity_level: ScoreValue | null;
  notes: string | null;
  concerns: string | null;
  photo_urls: string[] | null;
  created_at: string;
  updated_at: string;
};

export type DailyLogInsert = MakeNullableOptional<Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>> & Partial<Pick<DailyLog, 'id'>>;

export type DailyLogUpdate = Partial<DailyLogInsert>;

// --------------------------------------------
// Feedback（ほんね投函）
// --------------------------------------------
export type FeedbackCategory = 'service' | 'schedule' | 'cost' | 'communication' | 'other';
export type FeedbackStatus = 'unread' | 'read' | 'addressed';

export type Feedback = {
  id: string;
  care_receiver_id: string | null;
  family_member_id: string | null;
  category: FeedbackCategory;
  content: string;
  is_anonymous: boolean;
  status: FeedbackStatus;
  manager_notes: string | null;
  created_at: string;
  addressed_at: string | null;
  updated_at: string;
};

export type FeedbackInsert = MakeNullableOptional<Omit<Feedback, 'id' | 'created_at' | 'updated_at' | 'addressed_at'>> & Partial<Pick<Feedback, 'id' | 'is_anonymous' | 'status'>>;

export type FeedbackUpdate = Partial<Omit<FeedbackInsert, 'care_receiver_id' | 'family_member_id' | 'category' | 'content'>> & { addressed_at?: string | null };

// フィードバック読み取り用VIEW（feedbacks_view）の行型。
// 匿名投稿では family_member_id / name / relation が投稿者本人以外に NULL で返る。
export type FeedbackViewRow = Omit<Feedback, 'family_member_id'> & {
  family_member_id: string | null;
  family_member_name: string | null;
  family_member_relation: string | null;
};

// --------------------------------------------
// SatisfactionSurvey（満足度調査）
// --------------------------------------------
export type SatisfactionSurvey = {
  id: string;
  care_receiver_id: string | null;
  family_member_id: string | null;
  survey_month: string;
  overall_score: ScoreValue | null;
  care_plan_score: ScoreValue | null;
  communication_score: ScoreValue | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type SatisfactionSurveyInsert = MakeNullableOptional<Omit<SatisfactionSurvey, 'id' | 'created_at' | 'updated_at'>> & Partial<Pick<SatisfactionSurvey, 'id'>>;

export type SatisfactionSurveyUpdate = Partial<SatisfactionSurveyInsert>;

// --------------------------------------------
// リレーション付き型
// --------------------------------------------
export type CareReceiverWithRelations = CareReceiver & {
  care_manager?: CareManager | null;
  family_members?: FamilyMember[];
  daily_logs?: DailyLog[];
};

export type CareManagerWithRelations = CareManager & {
  organization?: Organization | null;
  care_receivers?: CareReceiver[];
};

export type DailyLogWithRelations = DailyLog & {
  care_receiver?: Pick<CareReceiver, 'id' | 'name'> | null;
  family_member?: Pick<FamilyMember, 'id' | 'name' | 'relation'> | null;
};

export type FeedbackWithRelations = Feedback & {
  care_receiver?: Pick<CareReceiver, 'id' | 'name'> | null;
  family_member?: Pick<FamilyMember, 'id' | 'name' | 'relation'> | null;
};

// --------------------------------------------
// Database型（Supabase生成型と同じ構造）
// --------------------------------------------
// Relationships を埋めることで embedded select
// （例: `family_member:family_members(...)`）の型推論が効く。
// foreignKeyName は Postgres のデフォルト命名（<table>_<column>_fkey）。
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: OrganizationInsert;
        Update: OrganizationUpdate;
        Relationships: [];
      };
      care_managers: {
        Row: CareManager;
        Insert: CareManagerInsert;
        Update: CareManagerUpdate;
        Relationships: [
          {
            foreignKeyName: 'care_managers_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      care_receivers: {
        Row: CareReceiver;
        Insert: CareReceiverInsert;
        Update: CareReceiverUpdate;
        Relationships: [
          {
            foreignKeyName: 'care_receivers_care_manager_id_fkey';
            columns: ['care_manager_id'];
            isOneToOne: false;
            referencedRelation: 'care_managers';
            referencedColumns: ['id'];
          },
        ];
      };
      family_members: {
        Row: FamilyMember;
        Insert: FamilyMemberInsert;
        Update: FamilyMemberUpdate;
        Relationships: [
          {
            foreignKeyName: 'family_members_care_receiver_id_fkey';
            columns: ['care_receiver_id'];
            isOneToOne: false;
            referencedRelation: 'care_receivers';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_logs: {
        Row: DailyLog;
        Insert: DailyLogInsert;
        Update: DailyLogUpdate;
        Relationships: [
          {
            foreignKeyName: 'daily_logs_care_receiver_id_fkey';
            columns: ['care_receiver_id'];
            isOneToOne: false;
            referencedRelation: 'care_receivers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_logs_family_member_id_fkey';
            columns: ['family_member_id'];
            isOneToOne: false;
            referencedRelation: 'family_members';
            referencedColumns: ['id'];
          },
        ];
      };
      feedbacks: {
        Row: Feedback;
        Insert: FeedbackInsert;
        Update: FeedbackUpdate;
        Relationships: [
          {
            foreignKeyName: 'feedbacks_care_receiver_id_fkey';
            columns: ['care_receiver_id'];
            isOneToOne: false;
            referencedRelation: 'care_receivers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedbacks_family_member_id_fkey';
            columns: ['family_member_id'];
            isOneToOne: false;
            referencedRelation: 'family_members';
            referencedColumns: ['id'];
          },
        ];
      };
      satisfaction_surveys: {
        Row: SatisfactionSurvey;
        Insert: SatisfactionSurveyInsert;
        Update: SatisfactionSurveyUpdate;
        Relationships: [
          {
            foreignKeyName: 'satisfaction_surveys_care_receiver_id_fkey';
            columns: ['care_receiver_id'];
            isOneToOne: false;
            referencedRelation: 'care_receivers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'satisfaction_surveys_family_member_id_fkey';
            columns: ['family_member_id'];
            isOneToOne: false;
            referencedRelation: 'family_members';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      feedbacks_view: {
        Row: FeedbackViewRow;
        Relationships: [
          {
            foreignKeyName: 'feedbacks_care_receiver_id_fkey';
            columns: ['care_receiver_id'];
            isOneToOne: false;
            referencedRelation: 'care_receivers';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      get_my_care_manager_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_my_family_member_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
