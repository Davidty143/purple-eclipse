import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { MAX_COMMENT_CHARS, isNearCharLimit, getCurrentChars } from './utils/commentUtils';

interface ReplyFormProps {
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  placeholder: string;
  authorUsername: string;
  isNested?: boolean;
}

export function ReplyForm({ content, onChange, onSubmit, isSubmitting, placeholder, authorUsername, isNested = false }: ReplyFormProps) {
  return (
    <div className={`mt-3 ${isNested ? 'pl-3 sm:pl-4 border-l border-blue-100' : 'pl-3 sm:pl-6 border-l-2 border-blue-200'} py-3`}>
      <div className="relative">
        <textarea value={content} onChange={onChange} placeholder={placeholder} className={`w-full ${isNested ? 'min-h-[50px] sm:min-h-[60px] text-xs sm:text-sm' : 'min-h-[60px] sm:min-h-[80px] text-sm'} p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${isNearCharLimit(content) ? 'pr-20' : ''}`} disabled={isSubmitting} />
        <div className={`absolute bottom-2 right-2 text-xs ${isNearCharLimit(content) ? 'text-red-500' : 'text-gray-500'}`}>
          {getCurrentChars(content)}/{MAX_COMMENT_CHARS}
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <Button size="sm" disabled={isSubmitting || !content.trim() || content.length > MAX_COMMENT_CHARS} onClick={onSubmit} className={`${isNested ? 'bg-[#267858] hover:bg-[#267858] h-7 sm:h-8' : 'bg-blue-600 hover:bg-blue-700'} text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm`}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 sm:mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Reply'
          )}
        </Button>
      </div>
    </div>
  );
}
