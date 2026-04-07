import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { FAMILY_ROLE_LABELS } from '@tsunagu-care/shared';
import type { CareReceiver, FamilyMember } from '@tsunagu-care/shared';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getReceiver(id: string): Promise<CareReceiver | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('care_receivers')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}

async function getFamilyMembers(careReceiverId: string): Promise<FamilyMember[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('family_members')
    .select('*')
    .eq('care_receiver_id', careReceiverId)
    .order('is_primary', { ascending: false });

  return (data || []) as FamilyMember[];
}

export default async function FamilyPage({ params }: PageProps) {
  const { id } = await params;
  const [receiver, familyMembers] = await Promise.all([
    getReceiver(id),
    getFamilyMembers(id),
  ]);

  if (!receiver) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/dashboard/receivers/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {receiver.name}さんの詳細に戻る
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">ご家族一覧</h1>
        <p className="text-muted-foreground">
          {receiver.name}さんのご家族情報
        </p>
      </div>

      {/* 家族一覧 */}
      {familyMembers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {familyMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {member.relation}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {member.is_primary && (
                      <Badge>主介護者</Badge>
                    )}
                    <Badge variant="outline">
                      {FAMILY_ROLE_LABELS[member.role as keyof typeof FAMILY_ROLE_LABELS]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              登録されているご家族がいません
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
