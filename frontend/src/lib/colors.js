export const getStatusColor = (status) => {
  const colors = {
    planning: "bg-blue-100 text-blue-800",
    ongoing: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
  };
  return colors[status];
};

export const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: "bg-green-100 text-green-800",
    moderate: "bg-yellow-100 text-yellow-800",
    challenging: "bg-red-100 text-red-800",
  };
  return colors[difficulty];
};
