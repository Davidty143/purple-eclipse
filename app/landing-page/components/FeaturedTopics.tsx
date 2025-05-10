"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import topics from "../../test-main/testDataFeaturedTopics";
import ThreadBlock from "@/components/ThreadBlock";

export function FeaturedTopics() {
    const [showAll, setShowAll] = useState(false);

    return (
        <div className="w-full flex flex-col gap-4">
            <ThreadBlock />
            <ThreadBlock />
            <ThreadBlock />
        </div>
    );
}
