import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BodyHeader from '@/components/BodyHeader';
export function LandingHeader() {
  return (
    <Card className="w-auto h-32 border-0 border-b-4 bg-white rounded-[10px]">
      <BodyHeader />
    </Card>
  );
}
