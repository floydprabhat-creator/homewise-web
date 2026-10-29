import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';

const ROLES = [
  {
    role: 'HEAD',
    tone: 'brand',
    can: ['Set the budget and its split', 'Add bills and choose who pays', 'Invite and remove members', 'Undo a bill payment'],
  },
  {
    role: 'MEMBER',
    tone: 'brand-subtle',
    can: ['Record spending with bill photos', 'Pay bills assigned to them', 'See the dashboard, budget and bills'],
  },
] as const;

/** What each role can do, so a head knows what a member gets before inviting them. */
export function RolesCard() {
  return (
    <Card className="flex flex-col gap-4">
      <CardTitle>Who can do what</CardTitle>
      {ROLES.map(({ role, tone, can }) => (
        <div key={role} className="flex flex-col gap-2">
          <Badge shape="tag" tone={tone} className="self-start">
            {role}
          </Badge>
          <ul className="flex flex-col gap-1.5">
            {can.map((item) => (
              <li key={item} className="flex items-start gap-2 text-caption text-muted-foreground">
                <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Card>
  );
}
