import React from "react";
import { Check, X } from "lucide-react";

interface GroupFormProps {
  newGroupName: string;
  setNewGroupName: (v: string) => void;
  createGroup: () => void;
  setShowGroupForm: (v: boolean) => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ newGroupName, setNewGroupName, createGroup, setShowGroupForm }) => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder="Tên nhóm..."
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          onKeyPress={e => e.key === "Enter" && createGroup()}
          className="flex-1 bg-slate-700/50 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-400 focus:outline-none"
          autoFocus
        />
        <button
          onClick={createGroup}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setShowGroupForm(false);
            setNewGroupName("");
          }}
          className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GroupForm; 