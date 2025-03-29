import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import topics from "../../test-main/testDataFeaturedTopics"
import Img from "next/image";

export function FeaturedTopics() {
    return (
        <Card className="w-[1044px] h-[553px] bg-white rounded-[10px] border boder-zinc-300">
            <CardHeader className="border-b-2 border-zinc-300">
                <CardTitle className="w-52 h-6 text-stone-900">Featured Topics</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="space-y-4 pt-2">
                    {topics.map((topic, index) => (
                    <Card key={index} className="p-4 flex items-center gap-4 bg-gray-100 rounded-lg">
                        
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

                    <button className="text-blue-500 text-sm underline">Show More...</button>
                </div>
            </CardContent>
        </Card>
    )
}