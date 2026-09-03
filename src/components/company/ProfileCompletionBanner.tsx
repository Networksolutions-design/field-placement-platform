interface Props {
  percent: number;
  missing: string[];
  onCompleteProfile: () => void;
}

export function ProfileCompletionBanner({
  percent,
  missing,
  onCompleteProfile,
}: Props) {
  if (percent >= 100) return null;

  return (
    <div className="bg-gradient-to-r from-teal-50 to-white border border-teal-100 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800">
          Your profile is {percent}% complete
        </h3>
        <span className="text-sm text-teal-700 font-semibold">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-teal-600 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Companies with complete profiles get noticed more by students. A few
        quick details left:{" "}
        <span className="font-medium text-gray-700">
          {missing.slice(0, 3).join(", ")}
          {missing.length > 3 ? `, +${missing.length - 3} more` : ""}
        </span>
      </p>
      <button
        onClick={onCompleteProfile}
        className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
      >
        Complete my profile
      </button>
    </div>
  );
}