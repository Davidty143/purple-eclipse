"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import topics from "../../test-main/testDataFeaturedTopics";

export function FeaturedTopics() {
    const [showAll, setShowAll] = useState(false);

    return (
        <Card className="w-full h-full bg-white rounded-[10px] border border-zinc-300">
            <CardHeader className="border-b-2 border-zinc-300">
                <CardTitle className="text-stone-900">Featured Topics</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col pt-2">
                {topics.slice(0, 5).map((topic, index) => (
                        <Card key={index} className="m-2 p-4 flex items-center gap-4 rounded-lg">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="bg-gray-300 px-2 py-1 text-xs rounded">{topic.tag}</span>
                                    <h2 className="font-semibold">{topic.title}</h2>
                                </div>
                                <p className="text-xs text-gray-500">{topic.user} • {topic.date} • {topic.category}</p>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                                <p>Replies: {topic.replies}</p>
                                <p>Views: {topic.views}</p>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                                <p>{topic.time}</p>
                            </div>
                        </Card>
                    ))}

                    {showAll && (
                        <div className="max-h-64 overflow-y-auto border-t pt-2 mt-2">
                            {topics.slice(5).map((topic, index) => (
                                <Card key={index + 5} className="p-4 flex items-center gap-4 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-300 px-2 py-1 text-xs rounded">{topic.tag}</span>
                                            <h2 className="font-semibold">{topic.title}</h2>
                                        </div>
                                        <p className="text-xs text-gray-500">{topic.user} • {topic.date} • {topic.category}</p>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <p>Replies: {topic.replies}</p>
                                        <p>Views: {topic.views}</p>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <p>{topic.time}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                    <button onClick={() => setShowAll(!showAll)} className="text-start text-gray-500 text-sm underline">
                        {showAll ? "Show Less" : "Show More..."}
                    </button>    
            </CardContent>
        </Card>
    );
}
