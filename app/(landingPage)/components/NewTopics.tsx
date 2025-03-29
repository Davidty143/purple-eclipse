"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import { useState } from "react";

export function NewTopics(){
    return (
        <Card className="w-96 h-full bg-white rounded-[10px] border border-zinc-300">
            <CardHeader className="border-b-2 border-zinc-300">
                <CardTitle className="text-2xl text-start">New Topics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-1 p-2">
                <Card className="bg-gray p-4">
                </Card>
            </CardContent>
        </Card>
    );
};


