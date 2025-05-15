import { User } from '@/app/types/user';
import { RestrictionReason } from '@/app/types/restriction';

interface ActionModalProps {
  user: User;
  action: 'restrict' | 'ban' | 'unrestrict' | 'unban';
  reason: RestrictionReason;
  endDate: string;
  notes: string;
  onReasonChange: (reason: RestrictionReason) => void;
  onEndDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActionModal({ user, action, reason, endDate, notes, onReasonChange, onEndDateChange, onNotesChange, onConfirm, onCancel }: ActionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold mb-6">{action === 'restrict' ? 'Restrict User' : action === 'ban' ? 'Ban User' : action === 'unrestrict' ? 'Unrestrict User' : 'Unban User'}</h3>

        {(action === 'restrict' || action === 'ban') && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reason</label>
              <select value={reason} onChange={(e) => onReasonChange(e.target.value as RestrictionReason)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base">
                {Object.values(RestrictionReason).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {action === 'restrict' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">End Date (optional)</label>
                <input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <textarea value={notes} onChange={(e) => onNotesChange(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" rows={3} />
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors text-base font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2.5 text-white rounded-lg transition-colors text-base font-medium ${action === 'ban' ? 'bg-red-500 hover:bg-red-600' : action === 'restrict' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
