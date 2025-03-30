"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import { useState } from "react";
import newTopics from "../../test-main/testDataNewTopics"

export function NewTopics(){

    return (
        <Card className="w-96 h-full bg-white rounded-[10px] border border-zinc-300">
            <CardHeader className="border-b-2 border-zinc-300">
                <CardTitle className="text-2xl text-start">New Topics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col pt-2 space-y-2">
                    {newTopics.slice(0,9).map((topics, index) => (
                        <Card key={index} className="p-4">
                            <div className="flex flex-row justify-start space-x-6">
                                <p> Image</p>
                                <span> {topics.title}</span>
                            </div>
                        </Card>
                    ))}
                <button className="text-start text-gray-500 text-sm underline">
                    Show More...
                </button>
            </CardContent>
        </Card>
    )
} 


