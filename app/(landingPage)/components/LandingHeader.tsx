import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BodyHeader from "@/components/BodyHeader";
import { Body } from "@radix-ui/themes/dist/cjs/components/table";
export function LandingHeader() {
    return (
        <Card className="w-[1044px] h-34 bg-white rounded-[10px]">
            <BodyHeader />
        </Card>
    )   
}