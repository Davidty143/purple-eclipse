"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import { useState } from "react";
import newTopics from "../../test-main/testDataNewTopics"
import ThreadNameBlock from "@/components/ThreadNameBlock";

export function NewTopics(){
    return (
        <div className="lg:w-[300px] flex-shrink-0 h-auto">
            <ThreadNameBlock />
        </div>
    )
} 


