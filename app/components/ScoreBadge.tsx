const ScoreBadge = ({ score }: { score: number }) => {
  const badgeColor =
    score > 70
      ? "bg-green-200 text-green-800 p-2 rounded"
      : score > 49
        ? "bg-yellow-200 text-yellow-800 p-2 rounded"
        : "bg-red-200 text-red-800 p-2 rounded";

  const badgeText =
    score > 70 ? "Strong" : score > 49 ? "Good Start" : "Needs Work";
  return (
    <div className={badgeColor}>
      <p className="text-sm font-medium">{badgeText}</p>
    </div>
  );
};

export default ScoreBadge;
