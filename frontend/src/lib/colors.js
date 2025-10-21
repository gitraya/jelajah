export const getTripStatusColor = (status) => {
  const colors = {
    planning: "bg-blue-100 text-blue-800",
    ongoing: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
  };
  return colors[status];
};

export const getTripDifficultyColor = (difficulty) => {
  const colors = {
    easy: "bg-green-100 text-green-800",
    moderate: "bg-yellow-100 text-yellow-800",
    challenging: "bg-red-100 text-red-800",
  };
  return colors[difficulty];
};

export const getItineraryPriorityColor = (priority) => {
  const colors = {
    HIGH: "bg-red-100 text-red-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    LOW: "bg-green-100 text-green-800",
  };
  return colors[priority];
};

export const getExpenseCategoryColor = (category) => {
  const colors = {
    Accommodation: "bg-blue-100 text-blue-800",
    Transportation: "bg-green-100 text-green-800",
    Food: "bg-orange-100 text-orange-800",
    Activities: "bg-purple-100 text-purple-800",
    Shopping: "bg-pink-100 text-pink-800",
    Other: "bg-gray-100 text-gray-800",
  };
  return colors[category] || colors["Other"];
};

export const getMapTypeColor = (type) => {
  const colors = {
    Cultural: "bg-purple-100 text-purple-800",
    Nature: "bg-green-100 text-green-800",
    Beach: "bg-blue-100 text-blue-800",
    Restaurant: "bg-orange-100 text-orange-800",
    Shopping: "bg-pink-100 text-pink-800",
    Activity: "bg-yellow-100 text-yellow-800",
    Other: "bg-gray-100 text-gray-800",
  };
  return colors[type] || colors["Other"];
};

export const getMapStatusColor = (status) => {
  const colors = {
    planned: "bg-blue-100 text-blue-800",
    visited: "bg-green-100 text-green-800",
    skipped: "bg-gray-100 text-gray-800",
  };
  return colors[status];
};

export const getMemberStatusColor = (status) => {
  const colors = {
    ACCEPTED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    DECLINED: "bg-red-100 text-red-800",
  };
  return colors[status];
};

export const getMemberRoleColor = (role) => {
  const colors = {
    ORGANIZER: "bg-purple-100 text-purple-800",
    CO_ORGANIZER: "bg-blue-100 text-blue-800",
    MEMBER: "bg-gray-100 text-gray-800",
  };
  return colors[role];
};

export const getPackingCategoryColor = (category) => {
  const colors = {
    Documents: "bg-red-100 text-red-800",
    Clothing: "bg-blue-100 text-blue-800",
    Toiletries: "bg-green-100 text-green-800",
    Electronics: "bg-purple-100 text-purple-800",
    "Beach gear": "bg-cyan-100 text-cyan-800",
    Medical: "bg-orange-100 text-orange-800",
    Other: "bg-gray-100 text-gray-800",
  };
  return colors[category] || colors["Other"];
};
